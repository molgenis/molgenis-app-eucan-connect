<template>
  <div class="container-fluid pt-2">
    <div class="row">
      <div class="col-2">----</div>
      <div class="col-10">
        <div class="d-flex flex-wrap justify-content-end align-items-start">
          <div
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
      </div>
    </div>
  </div>
</template>

<script>
import { mapState } from 'vuex'
export default {
  name: 'Home',
  data: function () {
    return {
      expand: []
    }
  },
  computed: {
    ...mapState(['studies'])
  },
  methods: {
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
