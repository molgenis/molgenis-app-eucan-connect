<template>
  <div class="container-fluid pt-2">
    <div class="row">
      <div class="col-2">
        <div class="card w-100">
          <div class="card-header">Country</div>
          <div class="card-body">
            <b-check-group
              v-model="selectedCountries"
              :options="countries"
              stacked
              @change="filter">
            </b-check-group>
          </div>
        </div>
      </div>
      <div class="col-10">
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
        <div class="d-flex flex-wrap justify-content-end align-items-start">
          <div
            id="studies"
            class="card border-dark"
            v-for="study of studies"
            :key="study.id">
            <div class="card-header text-white bg-primary">
              {{ study.study_name }}
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
import { mapActions, mapState } from 'vuex'
export default {
  name: 'Home',
  data: function () {
    return {
      expand: [],
      currentPage: 1,
      selectedCountries: []
    }
  },
  computed: {
    ...mapState(['studies', 'countries', 'studiesPageInfo'])
  },
  methods: {
    ...mapActions(['filterStudies', 'getStudies']),
    studyDescription (description) {
      if (this.descriptionTooLong(description)) {
        return description.substr(0, 300) + '...'
      }
      return description
    },
    descriptionTooLong (description) {
      return description && description.length > 300
    },
    toggleDescription (id) {
      if (this.expand.includes(id)) {
        this.expand.splice(this.expand.indexOf(id), 1)
      } else {
        this.expand.push(id)
      }
    },
    filter () {
      this.filterStudies({ countryCodes: this.selectedCountries })
    },
    changePage (newPage) {
      this.getStudies(newPage - 1)
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

.folded {
  display: inline-block;
  max-height: 300px;
  max-width: 300px;
  text-overflow: ellipsis;
  overflow: hidden;
}
</style>
