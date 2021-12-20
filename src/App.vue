<template>
  <div class="pb-4">
    <router-view />
  </div>
</template>

<script>
import { mapActions } from 'vuex'

export default {
  methods: {
    ...mapActions(['getStudies', 'getAvailableCountries'])
  },
  mounted () {
    this.getStudies()
    this.getAvailableCountries()
  }
}
</script>
<style>
/* Original bootstrap */
.card-header {
  background-color: rgba(0, 0, 0, 0.03);
  border-bottom: 1px solid rgba(0, 0, 0, 0.125);
}
</style>
