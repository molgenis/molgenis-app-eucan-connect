import { mount, createLocalVue } from '@vue/test-utils'
import study from '../../../src/views/Study.vue'
import Vuex from 'vuex'

const localVue = createLocalVue()

localVue.use(Vuex)

const store = new Vuex.Store({
  state: {},
  actions: {
    getStudy: () => {
      return new Promise((resolve) => {
        resolve({
          data: {
            id: 'this_id',
            populations: {
              items: [{
                data: {
                  name: 'Some selection criteria',
                  selection_criteria: ['a', 'b', 'c']
                }
              }]
            }
          }
        })
      })
    }
  }
})

describe('Study.vue', () => {
  it('can render a study screen', async () => {
    const wrapper = mount(study, { localVue, store, propsData: { studyId: 'test_study' }, stubs: ['router-link'] })
    expect(wrapper.html().length).toBeTruthy()
  })
})
