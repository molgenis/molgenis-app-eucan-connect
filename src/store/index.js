import Vue from 'vue'
import Vuex from 'vuex'
import api from '@molgenis/molgenis-api-client'
import rsqlService from '../logic/rsqlService'
import { sortAsc, sortDesc, unique } from '../logic/predicates'
import { createStudyViewmodel } from '../logic/viewmodels'

Vue.use(Vuex)

/** so we can get two pages worth and then cut off the excess, else we will have short,
 * because some studies are folded into one card if they are linked
 */
async function _queryStudies (page, query) {
  let url = `/api/data/eucan_studies?size=15&page=${page}&expand=source_catalogue,countries&sort=study_name`

  if (query) url += query

  let response = await api.get(url)

  if (response.items && response.items.length) {
    response = await AddLinkedStudies(response)
  }

  return response
}

async function AddLinkedStudies (response) {
  const linkedStudiesByAcronyms = {}
  let allLinkedStudyIds = []

  const acronymsForStudies = response.items.map(study => study.data.acronym ? study.data.acronym.split(' ')[0] : '').filter(acronym => acronym !== '') /** needs to split because rsql can not handle a space or %20 */

  const linkedStudiesResponse = await api.get(`/api/data/eucan_linkage?size=10000&expand=studies&q=acronym=in=(${acronymsForStudies.join()})`)
  const linkedStudies = linkedStudiesResponse.items

  for (const linkedStudy of linkedStudies) {
    /** need ids because acronyms are not unique */
    const linkedStudyIds = linkedStudy.data.studies.items.map(ls => ls.data.id)
    const linkedStudyAcronyms = [...new Set([linkedStudy.data.acronym, ...linkedStudy.data.studies.items.map(linkedStudy => linkedStudy.data.acronym)])]

    linkedStudyAcronyms.forEach(uniqueAcronym => {
      linkedStudiesByAcronyms[uniqueAcronym] = linkedStudyIds
      allLinkedStudyIds = allLinkedStudyIds.concat(linkedStudyIds)
    })
  }

  const allStudyIds = response.items.map(item => item.data.id)
  const missingLinkedStudies = allLinkedStudyIds.filter(alsi => !allStudyIds.includes(alsi))

  if (missingLinkedStudies.length) {
    const missingStudiesUrl = `/api/data/eucan_studies?q=id=in=(${missingLinkedStudies.join()})&expand=source_catalogue,countries`

    const missingStudiesResponse = await api.get(missingStudiesUrl)
    response.items = response.items.concat(missingStudiesResponse.items)
  }

  /** get full linked studies */
  for (const [index, studyResponse] of response.items.entries()) {
    const linkedStudiesForStudy = linkedStudiesByAcronyms[studyResponse.data.acronym]
    if (linkedStudiesForStudy) {
      response.items[index].data.linked_studies = linkedStudiesForStudy
    }
  }

  return response
}

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
      const studyData = data.items.map(item => item.data)
      /** mold into a viewmodel */
      const viewmodels = createStudyViewmodel(studyData)
      state.studies = viewmodels

      /**  Data for use in pagination. */
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
        await rsqlService.countryQuery(state.selectedCountries),
        await rsqlService.textSearchQuery(state.search),
        await rsqlService.sourceQuery(state.selectedSources),
        await rsqlService.startYearQuery(state.selectedStartYears)]

      const query = rsqlService.combineQuerys(rawQuerys)

      const studies = await _queryStudies(page, query)

      if (state.studiesPageInfo.totalPages !== page && !query) {
        const nextStudiesResponse = await _queryStudies(page + 1, query)
        studies.items = studies.items.concat(nextStudiesResponse.items)
      }

      commit('setStudies', studies)
    },
    async getStudy (_, id) {
      const url = `/api/data/eucan_studies/${id}?expand=populations,countries`
      const response = await api.get(url)
      if (response.data.populations.items.length) {
        for (const item of response.data.populations.items) {
          /** fetch one level deeper */
          const critResponse = await api.get(item.data.selection_criteria.links.self)
          item.data.selection_criteria = critResponse.items.map(r => r.data)
        }
      }

      const linkedStudiesResponse = await api.get(`/api/data/eucan_linkage?filter=studies&size=1000&expand=studies&q=acronym=in=(${response.data.acronym.split(' ')[0]})`)
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
