import Vue from 'vue'
import Vuex from 'vuex'
import api from '@molgenis/molgenis-api-client'

Vue.use(Vuex)

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
      state.countries = data.items.map(item => {
        if (item.data.country) {
          return { text: item.data.country.data.country_name, value: item.data.country.data.iso2_code }
        }
      })
    }
  },
  actions: {
    async getStudies ({ commit }, page = 0) {
      const response = await api.get(`/api/data/eucan_study?page=${page}`)
      commit('setStudies', response)
    },
    /* Based on the list of contacts, get all the associated countries */
    async getAvailableCountries ({ commit }) {
      const response = await api.get('/api/data/eucan_persons?filter=country&expand=country')
      commit('setAvailableCountries', response)
    }
  }
})
