<template>
  <div>
    <router-link class="d-inline-block ml-4 mt-3" to="/">Back</router-link>
    <div class="card mx-auto w-75 mt-4 pb-2">
      <div class="card-header text-white bg-primary p-3 pl-4">
        <h1>{{ study.study_name }}</h1>
        <h2 class="subtitle">Acronym: {{ study.acronym || "-" }}</h2>
      </div>
      <div class="card-body">
        <h3>Objectives</h3>
        <p class="card-text text-justify">
          {{ study.objectives || "-" }}
        </p>
        <study-property-table
          :studies="[study]"
          :hideProperties="['study_name', 'acronym', 'source_data']"/>
        <div v-if="similarStudies.length">
          <h3 class="mt-3">This study is also found in other catalogues:</h3>
          <study-property-table
            :studies="similarStudies"
            :hideProperties="['acronym', 'source_data']"/>
        </div>
        <div v-else>
          <i class="mt-3 d-block">This study was not found in other catalogues.</i>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { mapActions } from 'vuex'
import StudyPropertyTable from '../components/StudyPropertyTable.vue'
export default {
  components: { StudyPropertyTable },
  props: {
    studyId: {
      type: String,
      required: true,
      default: () => ''
    }
  },
  computed: {
    study () {
      return this.studyData ? this.studyData.data : {}
    },
    populations () {
      if (!this.study || !this.study.populations) return []
      return this.study.populations.items.map((i) => i.data)
    },
    similarStudies () {
      if (!this.studyData || !this.studyData.data.linked_studies) return []
      else {
        return this.studyData.data.linked_studies.map((ls) => ls.data)
      }
    }
  },
  data () {
    return {
      studyData: undefined
    }
  },
  methods: {
    ...mapActions(['getStudy']),
    createHref (url) {
      if (url.substring(0, 4) !== 'http') {
        return `https://${url}`
      } else {
        return url
      }
    }
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
