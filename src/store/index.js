import Vue from 'vue'
import Vuex from 'vuex'
import api from '@molgenis/molgenis-api-client'
import rsqlService from '../logic/rsqlService'
import { sortAsc, sortDesc, unique } from '../logic/predicates'
import { createStudyViewmodel } from '../logic/viewmodels'

Vue.use(Vuex)

/** so we can get two pages worth and then cut off the excess when building the viewmodel, else we will have short,
 * because some studies are folded into one card if they are linked
 */
async function _queryStudies (page, query) {
  let url = `/api/data/eucan_studies?size=15&page=${page}&expand=source_catalogue,countries&sort=label`

  if (query) url += query

  let response = await api.get(url)

  if (response.items && response.items.length) {
    response = await AddLinkedStudies(response)
  }
  return response
}

/**
 * This function queries the linked studies table 'eucan_linkage' and then adds the studies.
 * After they have been added, the studies are further enriched with source_catalogue data
 * @param {*} response the response from emx1 data api
 * @returns an enriched response where the linked_studies have been added
 */
async function AddLinkedStudies (response) {
  const linkedStudiesId = {}
  const allStudyIds = response.items.map(study => study.data.id)
  const linkedStudiesResponse = await api.get(`/api/data/eucan_linkage?size=10000&expand=studies&q=studies.id=in=(${allStudyIds.join()})`)
  const linkedStudies = linkedStudiesResponse.items

  for (const linkedStudyRecord of linkedStudies) {
    for (const linkedStudy of linkedStudyRecord.data.studies.items) {
      linkedStudiesId[linkedStudy.data.id] = linkedStudyRecord.data.studies.items
    }
  }

  /** get full linked studies */
  for (const [index, studyResponse] of response.items.entries()) {
    const linkedStudiesForStudy = linkedStudiesId[studyResponse.data.id]

    if (linkedStudiesForStudy) {
      const linkedStudiesForStudyIds = linkedStudiesForStudy.map(study => study.data.id)

      const completeStudyData = await api.get(`/api/data/eucan_studies?q=id=in=(${linkedStudiesForStudyIds.join()})&expand=source_catalogue,countries`)
      response.items[index].data.linked_studies = completeStudyData.items.map(study => study.data)
    }
  }
  return response
}

export default new Vuex.Store({
  state: {
    studies: [],
    studiesPageInfo: { number: 1 },
    countries: [],
    selectedCountries: [],
    search: '',
    sourceCatalogues: [],
    selectedSources: [],
    startYears: [],
    fromStartYear: '',
    toStartYear: '',
    yearRangeActive: false
  },
  mutations: {
    setStudies (state, data) {
      const studyData = data.items.map(item => item.data)
      /** mold into a viewmodel */
      const viewmodels = createStudyViewmodel(studyData)
      state.studies = viewmodels

      /**  Data for use in pagination. */
      data.page.number++ /** add +1 because bootstrap pagination */

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

      state.fromStartYear = state.startYears[state.startYears.length - 1].value
      state.toStartYear = state.startYears[0].value
    },
    setAvailableCountries (state, data) {
      const distinctCountries = [] /** to keep track of added countries */
      const countryOptions = []

      for (const item of data.items) {
        const countries = item.data ? item.data.countries.items : undefined

        if (countries) {
          for (const country of countries) {
            if (!distinctCountries.includes(country.data.country_name)) {
              countryOptions.push({ text: country.data.country_name, value: country.data.iso2_code })
              distinctCountries.push(country.data.country_name)
            }
          }
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
    setFromStartYear (state, newYear) {
      state.fromStartYear = newYear
    },
    setToStartYear (state, newYear) {
      state.toStartYear = newYear
    },
    activateYearFilter (state) {
      state.yearRangeActive = true
    }
  },
  actions: {
    async getStudies ({ state, commit }, page = 0) {
      const rawQuerys = [
        await rsqlService.countryQuery(state.selectedCountries),
        await rsqlService.textSearchQuery(state.search),
        await rsqlService.sourceQuery(state.selectedSources),
        /** need to check if the user has activated the year range, else on pagination the unknown years are missing */
        await rsqlService.startYearQuery(state.yearRangeActive, state.fromStartYear, state.toStartYear)]

      const query = rsqlService.combineQuerys(rawQuerys)
      const studies = await _queryStudies(page, query)

      if (state.studiesPageInfo.totalPages !== page && !query) {
        const nextStudiesResponse = await _queryStudies(page + 1, query)
        studies.items = studies.items.concat(nextStudiesResponse.items)
      }

      commit('setStudies', studies)
    },
    async getStudy (_, id) {
      const url = `/api/data/eucan_studies/${id}?expand=populations,countries,source_catalogue`
      const response = await api.get(url)
      if (response.data.populations.items.length) {
        for (const item of response.data.populations.items) {
          /** fetch one level deeper */
          const critResponse = await api.get(item.data.selection_criteria.links.self)
          item.data.selection_criteria = critResponse.items.map(r => r.data)
        }
      }

      const linkedStudiesResponse = await api.get(`/api/data/eucan_linkage?filter=studies&size=1000&expand=studies&q=studies.id=in=(${response.data.id})`)

      if (linkedStudiesResponse.items && linkedStudiesResponse.items.length) {
        const linkedStudyIds = linkedStudiesResponse.items[0].data.studies.items.map(study => study.data.id)
        const completeLinkedStudies = await api.get(`/api/data/eucan_studies?q=id=in=(${linkedStudyIds.join()})&expand=source_catalogue,countries`)

        response.data.linked_studies = completeLinkedStudies.items.filter(cls => cls.data.id !== response.data.id)
        response.data.source_catalogue = completeLinkedStudies.items.filter(cls => cls.data.id === response.data.id)[0].data.source_catalogue
      }
      return response
    },
    /* Fetch all the associated countries */
    async getAvailableCountries ({ commit }) {
      const response = await api.get('/api/data/eucan_studies?expand=countries')
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
