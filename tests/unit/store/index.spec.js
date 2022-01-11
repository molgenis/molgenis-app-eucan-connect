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
          { id: 'test_study_1' },
          { id: 'test_study_2' }
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
