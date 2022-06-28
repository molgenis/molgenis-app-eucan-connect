<template>
  <div>
    <router-link class="d-inline-block ml-4 mt-3" to="/">Back</router-link>
    <div class="card mx-auto w-75 mt-4">
      <div
        class="card-header text-white bg-primary p-2"
        v-if="Object.keys(study)">
        <h1>{{ study.study_name }}</h1>
        <h2 class="subtitle">Acronym: {{ study.acronym }}</h2>
      </div>
      <div class="card-body">
        <h3 v-if="study.objectives">Objectives</h3>
        <p class="card-text w-50 text-justify">
          {{ study.objectives }}
        </p>
        <study-property-table :studies="[study]" />
        <div v-if="populations.length">
          <h3 class="mt-3">Populations</h3>
          <populations-table :populations="populations" />
        </div>
        <div v-if="similarStudies.length">
          <h3 class="mt-3" >Possible related studies</h3>
          <study-property-table :studies="similarStudies" />
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { mapActions } from 'vuex'
import PopulationsTable from '../components/PopulationsTable.vue'
import StudyPropertyTable from '../components/StudyPropertyTable.vue'
export default {
  components: { PopulationsTable, StudyPropertyTable },
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
</style>
