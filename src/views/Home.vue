<template>
  <div class="container-fluid pt-2">
    <div class="row">
      <div class="col-2 pr-0">
        <div class="card w-100">
          <div class="card-header">Search</div>
          <div class="card-body filter">
            <b-input v-model="searchSelectionModel" @keyup="filter" />
            <b-button class="w-100 mt-2" variant="info" @click="filter">Search</b-button>
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
                  {{ study.study_name }}</span>
                <font-awesome-icon
                  title="Study details"
                  class="float-right m-1 study-details"
                  :icon="['far', 'arrow-alt-circle-right']"/>
              </router-link>
            </div>
            <div class="card-body">
              <p v-if="!expand.includes(study.id)" class="card-text">
                {{ studyDescription(study.objectives) }}
                <b-link
                  v-if="descriptionTooLong(study.objectives)"
                  @click="toggleDescription(study.id)"
                  class="float-right mt-1">read more</b-link>
              </p>
              <p v-else class="card-text">
                {{ study.objectives }}
                <b-link
                  v-if="descriptionTooLong(study.objectives)"
                  @click="toggleDescription(study.id)"
                  class="float-right mt-1">read less</b-link>
              </p>
            </div>
            <small class="badge badge-primary catalogue-badge">{{ study.source_catalogue.data.description }}</small>
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
export default {
  name: 'Home',
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
    studyDescription (description) {
      if (this.descriptionTooLong(description)) {
        return description.substr(0, 200).trim() + '...'
      }
      return description || 'No description available'
    },
    descriptionTooLong (description) {
      return description && description.length > 200
    },
    toggleDescription (id) {
      if (this.expand.includes(id)) {
        this.expand.splice(this.expand.indexOf(id), 1)
      } else {
        this.expand.push(id)
      }
    },
    filter () {
      this.getStudies(0)
      this.currentPage = 1
    },
    changePage (newPage) {
      this.getStudies(newPage - 1)
    }
  }
}
</script>

<style scoped>
.catalogue-badge {
  border-top-left-radius: 0;
  border-top-right-radius: 0;
}

.card {
  width: 30%;
  margin-top: 1.5rem;
  margin-right: 1.5rem;
}

.studies {
  min-height: 16rem;
}

.study-title {
  width: 90%;
}

.folded {
  display: inline-block;
  max-height: 300px;
  max-width: 300px;
  text-overflow: ellipsis;
  overflow: hidden;
}

.info-text {
  font-size: 0.8rem;
  font-style: italic;
}

.study-details {
  width: 1.2rem;
  height: 1.2rem;
}
</style>
