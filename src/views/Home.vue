<template>
  <div class="container-fluid pt-2 pr-0">
    <div class="row">
      <div class="col-2 pr-0">
        <div class="card w-100">
          <div class="card-header">Search</div>
          <div class="card-body filter">
            <b-input v-model="searchSelectionModel" @keyup="filter" />
            <b-button class="w-100 mt-2" variant="primary" @click="filter">Search</b-button>
            <span class="info-text">Search on title or acronym.</span>
          </div>
        </div>
        <div class="card w-100">
          <div class="card-header">Catalogues</div>
          <div class="card-body filter">
            <b-check-group
              v-model="sourceSelectionModel"
              :options="sourceCatalogues"
              stacked
              @change="filter">
            </b-check-group>
          </div>
        </div>
        <div class="card w-100">
          <div class="card-header">Start year</div>
          <div class="card-body filter">
            <label class="w-100">
              <span class="d-block pb-2">From:</span>
              <b-form-select
                v-model="fromStartYearSelectionModel"
                :options="startYears"
                @change="filter('year')"></b-form-select>
            </label>
            <label class="w-100">
              <span class="d-block py-2">To:</span>
              <b-form-select
                v-model="toStartYearSelectionModel"
                :options="startYears"
                @change="filter('year')"></b-form-select>
            </label>
          </div>
        </div>
        <div class="card w-100">
          <div class="card-header">Country</div>
          <div class="card-body filter">
            <b-check-group
              v-model="countrySelectionModel"
              :options="countries"
              stacked
              @change="filter">
            </b-check-group>
          </div>
        </div>
      </div>
      <div class="col-10 px-0">
        <div class="mt-4 mb-0">
          <div class="d-flex justify-content-center mb-2">
            <span>Number of studies: {{ studiesPageInfo.totalElements }}</span>
          </div>
          <b-pagination
            v-model="studiesPageInfo.number"
            @change="changePage"
            :total-rows="studiesPageInfo.totalElements"
            :per-page="studiesPageInfo.size"
            align="center"
            aria-controls="studies"></b-pagination>
        </div>
        <div
          class="d-flex flex-wrap justify-content-start align-items-start ml-5">
          <div class="card studies" v-for="study of studies" :key="study.id">
            <div class="card-header text-white bg-primary study-card-header">
              <router-link
                :to="study.id"
                class="text-white study-title"
                :title="study.study_name.length > 80 ? study.study_name : ''">
                {{ truncateTitle(study.study_name) }}
              </router-link>
            </div>
            <div class="card-body study-card-body">
              <study-property-table
                :studies="[study]"
                :hideProperties="[
                  'acronym',
                  'study_name',
                  'source_data',
                  'source_catalogue',
                ]"/>
              <hr />
              <div v-if="study.linked_studies.length" class="d-flex pt-1">
                <b class="">Available in:</b>
                <div>
                  <a
                    v-for="linked_study in study.linked_studies"
                    :key="linked_study.id"
                    :href="getStudyLink(linked_study)"
                    target="_blank"
                    class="d-block pl-2 pb-1">
                    <span>
                      {{ linked_study.source_catalogue.data.description }}</span>
                  </a>
                </div>
              </div>

              <div v-else class="d-flex pt-2">
                <b class="">Available in:</b>
                <div>
                  <a
                    :href="getStudyLink(study)"
                    target="_blank"
                    class="d-block pl-2 pb-1">
                    <span> {{ study.source_catalogue.data.description }}</span>
                  </a>
                </div>
              </div>
            </div>
          </div>
        </div>
        <b-pagination
          class="mt-5"
          v-model="studiesPageInfo.number"
          @change="changePage"
          :total-rows="studiesPageInfo.totalElements"
          :per-page="studiesPageInfo.size"
          align="center"
          aria-controls="studies"></b-pagination>
      </div>
    </div>
  </div>
</template>

<script>
import { mapActions, mapMutations, mapState } from 'vuex'
import StudyPropertyTable from '../components/StudyPropertyTable.vue'

export default {
  name: 'Home',
  components: {
    StudyPropertyTable
  },
  data: function () {
    return {
      expand: []
    }
  },
  computed: {
    ...mapState([
      'studies',
      'countries',
      'search',
      'sourceCatalogues',
      'studiesPageInfo',
      'selectedCountries',
      'selectedSources',
      'startYears'
    ]),
    countrySelectionModel: {
      get () {
        return this.selectedCountries
      },
      set (newValue) {
        this.setSelectedCountries(newValue)
      }
    },
    searchSelectionModel: {
      get () {
        return this.search
      },
      set (newValue) {
        this.setSearch(newValue)
      }
    },
    sourceSelectionModel: {
      get () {
        return this.selectedSources
      },
      set (newValue) {
        this.setSelectedSources(newValue)
      }
    },
    fromStartYearSelectionModel: {
      get () {
        if (!this.startYears.length) return new Date(Date.now()).getFullYear()

        return (
          this.fromStartYear ||
          this.startYears[this.startYears.length - 1].value
        )
      },
      set (newValue) {
        this.setFromStartYear(newValue)
      }
    },
    toStartYearSelectionModel: {
      get () {
        if (!this.startYears.length) return new Date(Date.now()).getFullYear()
        return this.toStartYear || this.startYears[0].value
      },
      set (newValue) {
        this.setToStartYear(newValue)
      }
    }
  },
  methods: {
    ...mapActions(['filterStudies', 'getStudies']),
    ...mapMutations([
      'setAvailableCountries',
      'setSearch',
      'setSelectedCountries',
      'setSelectedSources',
      'setFromStartYear',
      'setToStartYear',
      'activateYearFilter'
    ]),
    truncateTitle (title) {
      if (title.length > 70) {
        return title.substring(0, 70) + '...'
      }

      return title
    },
    filter (filter) {
      /** user is still busy selecting stuff and we have an invalid state */
      if (
        parseInt(this.toStartYearSelectionModel) <
        parseInt(this.fromStartYearSelectionModel)
      ) {
        return
      }

      if (filter === 'year') {
        this.activateYearFilter()
      }

      this.getStudies(0)
    },
    changePage (newPage) {
      this.getStudies(newPage - 1)
    },
    createHref (url) {
      if (url.substring(0, 4) !== 'http') {
        return `https://${url}`
      } else {
        return url
      }
    },
    getStudyLink (study) {
      if (
        !study.source_data &&
        !study.source_catalogue &&
        !study.source_catalogue.data
      ) {
        return ''
      }

      return this.createHref(
        study.source_data || study.source_catalogue.data.catalogue_url
      )
    }
  }
}
</script>

<style scoped>
.card {
  width: 30%;
  margin-top: 1.5rem;
  margin-right: 1.5rem;
}
.study-card-header,
.study-card-body {
  padding: 0.75rem;
}

.study-card-header {
  max-height: 4.5rem;
  height: 4.5rem;
  overflow: hidden;
  text-overflow: ellipsis;
}

.studies {
  min-height: 19rem;
  max-height: 19rem;
}

.study-title {
  width: 90%;
}

.study-title:hover {
  text-decoration: underline;
}

.info-text {
  font-size: 0.8rem;
  font-style: italic;
}
</style>
