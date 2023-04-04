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
            <b-check-group
              v-model="startSelectionModel"
              :options="startYears"
              stacked
              @change="filter">
            </b-check-group>
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
            v-model="currentPage"
            @change="changePage"
            :total-rows="studiesPageInfo.totalElements"
            :per-page="studiesPageInfo.size"
            align="center"
            aria-controls="studies"></b-pagination>
        </div>
        <div
          class="d-flex flex-wrap justify-content-start align-items-start ml-5">
          <div class="card studies" v-for="study of studies" :key="study.id">
            <div class="card-header text-white bg-primary p-2">
              <router-link :to="study.id" class="text-white">
                <span class="d-inline-block study-title">
                  {{ study.study_name }}
                </span>
              </router-link>
            </div>
            <div class="card-body p-2">
              <study-property-table
                :studies="[study]"
                :hideProperties="[
                  'id',
                  'study_name',
                  'website',
                  'source_catalogue',
                ]"/>
            </div>

            <div v-if="study.linked_studies.length">
              <div
                v-for="linked_study in study.linked_studies"
                :key="linked_study.id"
                class="badge badge-primary catalogue-badge w-100 py-2 mt-2">
                <a
                  :href="getStudyLink(linked_study)"
                  target="_blank"
                  class="d-flex justify-content-between align-items-center text-white">
                  <span class="to-catalogue"></span>
                  <span>Go to
                    {{ linked_study.source_catalogue.data.description }}</span>
                  <font-awesome-icon
                    :title="`Go to ${linked_study.source_catalogue.data.description}`"
                    class="to-catalogue"
                    :icon="['far', 'arrow-alt-circle-right']"/>
                </a>
              </div>
            </div>
            <div v-else class="badge badge-primary catalogue-badge p-1">
              <a
                :href="getStudyLink(study)"
                target="_blank"
                class="d-flex justify-content-between align-items-center text-white">
                <span class="to-catalogue"></span>
                <span>Go to {{ study.source_catalogue.data.description }}</span>
                <font-awesome-icon
                  :title="`Go to ${study.source_catalogue.data.description}`"
                  class="to-catalogue"
                  :icon="['far', 'arrow-alt-circle-right']"/>
              </a>
            </div>
          </div>
        </div>
        <b-pagination
          class="mt-5"
          v-model="currentPage"
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
      expand: [],
      currentPage: 1
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
      'startYears',
      'selectedStartYears'
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
    startSelectionModel: {
      get () {
        return this.selectedStartYears
      },
      set (newValue) {
        this.setSelectedStartYears(newValue)
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
      'setSelectedStartYears'
    ]),
    filter () {
      this.getStudies(0)
      this.currentPage = 1
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
.catalogue-badge {
  font-size: 80%;
}

.catalogue-badge:first-child {
  border-bottom-left-radius: 0;
  border-bottom-right-radius: 0;
}

.catalogue-badge:last-child {
  border-top-left-radius: 0;
  border-top-right-radius: 0;
}

.catalogue-badge:not(:first-child):not(:last-child) {
  border-radius: 0;
}

.card {
  width: 30%;
  margin-top: 1.5rem;
  margin-right: 1.5rem;
}

.studies {
  min-height: 22rem;
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

.to-catalogue {
  width: 1.2rem;
  height: 1.2rem;
}
</style>
