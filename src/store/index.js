import Vue from 'vue'
import Vuex from 'vuex'
import api from '@molgenis/molgenis-api-client'
import rsqlService from '../logic/rsqlService'

Vue.use(Vuex)

export default new Vuex.Store({
  state: {
    studies: [],
    studiesPageInfo: {},
    countries: [],
    selectedCountries: [],
    search: ''
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
    },
    setSelectedCountries (state, newSelection) {
      state.selectedCountries = newSelection
    },
    setSearch (state, newSearch) {
      state.search = newSearch
    }
  },
  actions: {
    async getStudies ({ state, commit }, page = 0) {
      const rawQuerys = [
        await rsqlService.contactIdQuery(state.selectedCountries),
        await rsqlService.textSearchQuery(state.search)]

      const query = rsqlService.combineQuerys(rawQuerys)

      let url = `/api/data/eucan_study?size=15&page=${page}`

      if (query) url += query

      const response = await api.get(url)
      commit('setStudies', response)
    },
    /* Based on the list of contacts, get all the associated countries */
    async getAvailableCountries ({ commit }) {
      const response = await api.get('/api/data/eucan_persons?filter=country&expand=country')
      commit('setAvailableCountries', response)
    }
  }
})
