<template>
  <div>
    <router-link class="d-inline-block ml-4 mt-3" to="/">Back</router-link>
    <div class="card border-dark mx-auto w-75 mt-4">
      <div
        class="card-header text-white bg-primary p-2"
        v-if="Object.keys(study)">
        <h1>{{ study.study_name }}</h1>
        <h2 class="subtitle">Acronym: {{ study.acronym }}</h2>
      </div>
      <div class="card-body">
        <h3>Objectives</h3>
        <p class="card-text w-50 text-justify">
          {{ study.objectives }}
        </p>
        <table class="mb-4">
          <tr v-for="item of properties" :key="item.prop">
            <template v-if="study[item.prop]">
              <th role="label" class="mr-3 property-header">
                {{ item.label }}
              </th>
              <td class="pl-5">
                <a v-if="item.type === 'url'" :href="study[item.prop]">
                  {{ study[item.prop] }}</a>
                <span v-else>{{ study[item.prop] }}</span>
              </td>
            </template>
          </tr>
        </table>
        <div v-if="populations.length">
          <h3>Populations</h3>
          <div>
            <table
              v-for="population of populations"
              :key="population.name"
              class="population-table mb-4">
              <tbody>
                <tr
                  v-for="item of populationProperties"
                  :key="`${population.id}${population[item.prop]}`">
                  <template
                    v-if="
                      population &&
                      population[item.prop] &&
                      population[item.prop].length
                    ">
                    <th role="label" class="mr-3 property-header">
                      {{ item.label }}
                    </th>
                    <td class="pl-5">
                      <span v-if="item.type === 'array'">
                        {{
                          population[item.prop].map((m) => m.label).join(", ")
                        }}</span>
                      <span v-else>{{ population[item.prop] }}</span>
                    </td>
                  </template>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
        <div v-if="similarStudies.length">
          <h3>Possible related studies:</h3>
          <div>
            <table
              v-for="similarStudy of similarStudies"
              :key="similarStudy.name"
              class="population-table">
              <tbody>
                <tr v-for="item of properties" :key="item.prop">
                  <template v-if="similarStudy[item.prop]">
                    <th role="label" class="mr-3 property-header">
                      {{ item.label }}
                    </th>
                    <td class="pl-5">
                      <a
                        v-if="item.type === 'url'"
                        :href="similarStudy[item.prop]">
                        {{ similarStudy[item.prop] }}</a>
                      <span v-else>{{ similarStudy[item.prop] }}</span>
                    </td>
                  </template>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { mapActions } from 'vuex'
export default {
  props: {
    studyId: {
      type: String,
      required: true,
      default: () => ''
    }
  },
  watch: {
    async study (newValue) {
      this.similars = await this.getSimilarStudies(newValue.acronym)
    }
  },
  computed: {
    study () {
      return this.studyData ? this.studyData.data : {}
    },
    populations () {
      if (!this.study || !this.study.populations) return {}
      return this.study.populations.items.map((i) => i.data)
    },
    similarStudies () {
      if (!this.similars.length) return []
      return this.similars.map((i) => i.data)
    },
    properties () {
      return [
        {
          label: 'Id:',
          prop: 'id'
        },
        {
          label: 'Acronym:',
          prop: 'acronym'
        },
        {
          label: 'Start year:',
          prop: 'start_year'
        },
        {
          label: 'Website:',
          prop: 'website',
          type: 'url'
        },
        {
          label: 'Data source:',
          prop: 'source_data',
          type: 'url'
        }
      ]
    },
    populationProperties () {
      return [
        {
          label: 'Name:',
          prop: 'name'
        },
        {
          label: 'Selection criteria:',
          prop: 'selection_criteria',
          type: 'array'
        }
      ]
    }
  },
  data () {
    return {
      studyData: undefined,
      similars: []
    }
  },
  methods: {
    ...mapActions(['getStudy', 'getSimilarStudies'])
  },
  async mounted () {
    this.studyData = await this.getStudy(this.studyId)
  }
}
</script>

<style scoped>
.subtitle {
  font-style: italic;
  font-size: 1.2rem;
}

.property-header {
  max-width: 10rem;
  width: 10rem;
}

.population-table:not(:first-child) {
  margin-top: 1rem;
}
</style>
