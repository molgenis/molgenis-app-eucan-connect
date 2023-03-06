import Vue from 'vue'
import Vuex from 'vuex'
import api from '@molgenis/molgenis-api-client'
import rsqlService from '../logic/rsqlService'
import { sortAsc, sortDesc, unique } from '../logic/predicates'

Vue.use(Vuex)

export default new Vuex.Store({
  state: {
    studies: [],
    studiesPageInfo: {},
    countries: [],
    selectedCountries: [],
    search: '',
    sourceCatalogues: [],
    selectedSources: [],
    startYears: [],
    selectedStartYears: []
  },
  mutations: {
    setStudies (state, data) {
      state.studies = data.items.map(item => item.data) /* extract only the data part */
      // Data for use in pagination.
      state.studiesPageInfo = data.page
    },
    setCatalogueSources (state, data) {
      state.sourceCatalogues = data.items.map(item => ({ text: item.data.description, value: item.data.id })).sort(sortAsc('text'))
    },
    setStartYears (state, data) {
      state.startYears = data.items
        .map(item => ({ text: item.data.start_year, value: item.data.start_year }))
        .filter(unique('value'))
        .sort(sortDesc('value'))
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
      state.countries = countryOptions.sort(sortAsc('text'))
    },
    setSelectedCountries (state, newSelection) {
      state.selectedCountries = newSelection
    },
    setSearch (state, newSearch) {
      state.search = newSearch
    },
    setSelectedSources (state, newSources) {
      state.selectedSources = newSources
    },
    setSelectedStartYears (state, newYears) {
      state.selectedStartYears = newYears
    }
  },
  actions: {
    async getSimilarStudies (_, acronym) {
      const searchText = acronym.split(' ')
      const query = await rsqlService.acronymSearch(searchText[0])
      if (!query) return []

      const url = `/api/data/eucan_studies?size=10000&q=${query}`

      const response = await api.get(url)

      return response.items.filter(f => f.data.acronym !== acronym)
    },
    async getStudies ({ state, commit }, page = 0) {
      const rawQuerys = [
        await rsqlService.contactIdQuery(state.selectedCountries),
        await rsqlService.textSearchQuery(state.search),
        await rsqlService.sourceQuery(state.selectedSources),
        await rsqlService.startYearQuery(state.selectedStartYears)]

      const query = rsqlService.combineQuerys(rawQuerys)

      let url = `/api/data/eucan_studies?size=15&page=${page}&expand=source_catalogue&sort=study_name`

      if (query) url += query

      const response = await api.get(url)
      commit('setStudies', response)
    },
    async getStudy (_, id) {
      const url = `/api/data/eucan_studies/${id}?expand=populations`
      const response = await api.get(url)
      if (response.data.populations.items.length) {
        for (const item of response.data.populations.items) {
          // fetch one level deeper
          const critResponse = await api.get(item.data.selection_criteria.links.self)
          item.data.selection_criteria = critResponse.items.map(r => r.data)
        }
      }
      return response
    },
    /* Based on the list of contacts, get all the associated countries */
    async getAvailableCountries ({ commit }) {
      const response = await api.get('/api/data/eucan_persons?filter=country&expand=country')
      commit('setAvailableCountries', response)
    },
    async getAvailableSourceCatalogues ({ commit }) {
      const response = await api.get('/api/data/eucan_source_catalogues')
      commit('setCatalogueSources', response)
    },
    async getAvailableStartYears ({ commit }) {
      const response = await api.get('/api/data/eucan_studies?filter=start_year&size=10000')
      commit('setStartYears', response)
    }
  }
})
