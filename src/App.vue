<template>
  <div class="pb-4">
    <router-view />
  </div>
</template>

<script>
import { mapActions } from 'vuex'

export default {
  methods: {
    ...mapActions(['getStudies', 'getAvailableCountries', 'getAvailableSourceCatalogues', 'getAvailableStartYears'])
  },
  mounted () {
    this.getStudies()
    this.getAvailableSourceCatalogues()
    this.getAvailableCountries()
    this.getAvailableStartYears()
  }
}
</script>
<style>
/* Original bootstrap */
.card-header {
  background-color: rgba(0, 0, 0, 0.03);
  border-bottom: 1px solid rgba(0, 0, 0, 0.125);
}

.card-body.filter {
  max-height:250px;
  overflow-y:auto
}

body {
  background-color: #fafafa;
}
</style>
