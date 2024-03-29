import store from '../../../src/store'
import storeMockData from './storeMockData'

jest.mock('@molgenis/molgenis-api-client', () => ({
  get: (url) => {
    switch (url) {
      case 'study_population_link':
        return new Promise((resolve) => {
          resolve({
            items: [{
              data: 'fake criteria'
            }]
          })
        })
      case '/api/data/eucan_studies/test_id?expand=populations': {
        return new Promise((resolve) =>
          resolve(
            {
              data: {
                id: 'test_study_1',
                acronym: 'ts1',
                populations: {
                  items: [{
                    data: {
                      selection_criteria: {
                        links: {
                          self: 'study_population_link'
                        }
                      }
                    }
                  }]
                }
              }
            }
          ))
      }
      case '/api/data/eucan_linkage?filter=studies&size=1000&expand=studies&q=acronym=in=(ts1)': {
        return new Promise((resolve) =>
          resolve(
            {
              items: [{
                data: {
                  id: 'test_study_1',
                  acronym: 'ts1',
                  studies: {
                    items: [{
                      data: {
                        id: 'test_Study_1',
                        selection_criteria: {
                          links: {
                            self: 'study_population_link'
                          }
                        }
                      }
                    }]
                  }
                }
              }]
            }
          ))
      }

      case '/api/data/eucan_studies?q=id=in=(test_Study_1)&expand=source_catalogue': {
        return new Promise((resolve) =>
          resolve(
            {
              items: [{
                data: {
                  id: 'test_study_1',
                  acronym: 'ts1'
                }
              }]
            }
          ))
      }

      default:
        return new Promise((resolve) => resolve(
          {
            data: {
              id: 'test_study_1',
              populations: {
                items: [{
                  data: {
                    selection_criteria: {
                      links: {
                        self: 'study_population_link'
                      }
                    }
                  }
                }]
              }
            }
          }
        ))
    }
  }
}))

describe('store', () => {
  describe('mutations', () => {
    it('can set studies based on response', () => {
      store.commit('setStudies', storeMockData.studyDataResponse)
      expect(store.state.studies).toStrictEqual(
        [
          { id: 'test_study_1', linked_studies: [] },
          { id: 'test_study_2', linked_studies: [] }
        ])
    })

    it('can set catalogue sources based on response in ascending order', () => {
      store.commit('setCatalogueSources', storeMockData.studySourcesResponse)
      expect(store.state.sourceCatalogues).toStrictEqual(
        [
          { value: 'test_source_2', text: 'a' },
          { value: 'test_source_1', text: 'z' }
        ])
    })

    it('can set unique start years based on response in descending order', () => {
      store.commit('setStartYears', storeMockData.studyStartYearResponse)
      expect(store.state.startYears).toStrictEqual(
        [
          { value: 2021, text: 2021 },
          { value: 2000, text: 2000 },
          { value: 1999, text: 1999 }
        ])
    })

    it('can set unique countries based on response in ascending order', () => {
      store.commit('setAvailableCountries', storeMockData.studyCountryResponse)
      expect(store.state.countries).toStrictEqual(
        [
          { value: 'UK', text: 'England' },
          { value: 'DE', text: 'Germany' },
          { value: 'NL', text: 'The Netherlands' }
        ])
    })
  })

  describe('actions', () => {
    it('can add selection criteria to population data to the study data', async () => {
      const response = await store.dispatch('getStudy', 'test_id')
      expect(response.data.populations.items[0].data.selection_criteria[0]).toBe('fake criteria')
    })
  })
})
