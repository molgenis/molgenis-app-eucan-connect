import Vue from 'vue'
import Vuex from 'vuex'
import api from '@molgenis/molgenis-api-client'
import { transformToRSQL } from '@molgenis/rsql'

Vue.use(Vuex)

// move these later to molgenis/rsql
const queryBuilder = (attribute, filters, comparison) => filters.length > 0
  ? [{ selector: attribute, comparison, arguments: filters }]
  : []

// const createComparisons = (attribute, filters) =>
//   filters.map(filterValue => ({ selector: attribute, comparison: '==', arguments: filterValue }))

const createInQuery = (attribute, filters) => filters.length > 0
  ? queryBuilder(attribute, filters, '=in=')
  : []

export default new Vuex.Store({
  state: {
    studies: [],
    studiesPageInfo: {},
    countries: []
  },
  mutations: {
    setStudies (state, data) {
      state.studies = data.items.map(item => item.data) /* extract only the data part */
      // Data for use in pagination.
      state.studiesPageInfo = data.page
    },
    setAvailableCountries (state, data) {
      const distinctCountries = [] // to keep track of added countries
      const countryOptions = []

      for (const item of data.items) {
        const country = item.data ? item.data.country : undefined

        if (country && !distinctCountries.includes(country.data.country_name)) {
          countryOptions.push({ text: country.data.country_name, value: country.data.iso2_code })
          distinctCountries.push(country.data.country_name)
        }
      }
      state.countries = countryOptions
    }
  },
  actions: {
    async getStudies ({ commit }, page = 0) {
      const response = await api.get(`/api/data/eucan_study?page=${page}`)
      commit('setStudies', response)
    },
    async filterStudies ({ commit }, { countryCodes }) {
      if (!countryCodes.length) {
        this.dispatch('getStudies')
        return
      }

      const contactRsql = transformToRSQL({
        operator: 'OR',
        operands: createInQuery('country.iso2_code', countryCodes)
      })

      // get id's of contacts of country.
      const contactResponse = await api.get(`/api/data/eucan_persons?q=${contactRsql}`)

      const contactIds = contactResponse.items.map(item => item.data.id)

      const studyRsql = transformToRSQL({
        operator: 'OR',
        operands: createInQuery('contacts.id', contactIds)
      })
      const studyResponse = await api.get(`/api/data/eucan_study?q=${studyRsql}`)
      commit('setStudies', studyResponse)
    },
    /* Based on the list of contacts, get all the associated countries */
    async getAvailableCountries ({ commit }) {
      const response = await api.get('/api/data/eucan_persons?filter=country&expand=country')
      commit('setAvailableCountries', response)
    }
  }
})
