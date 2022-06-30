<template>
  <div>
    <table
      v-for="study of studies"
      :key="study.name"
      class="similar-studies-table">
      <tbody>
        <tr v-for="item of properties" :key="item.prop">
          <template v-if="study[item.prop]">
            <th role="label" class="mr-3 property-header">
              {{ item.label }}
            </th>
            <td class="pl-5">
              <a v-if="item.type === 'url'" :href="createHref(study[item.prop])" target="_blank">
                {{ study[item.prop] }}</a>
              <span v-else>{{ study[item.prop] }}</span>
            </td>
          </template>
        </tr>
      </tbody>
    </table>
  </div>
</template>

<script>
export default {
  name: 'StudyPropertyTable',
  props: {
    studies: {
      type: Array,
      required: true,
      default: () => []
    }
  },
  computed: {
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
    }
  },
  methods: {
    createHref (url) {
      if (url.substring(0, 4) !== 'http') {
        return `https://${url}`
      } else {
        return url
      }
    }
  }
}
</script>

<style scoped>
.similar-studies-table:not(:first-child) {
  margin-top: 1rem;
}
</style>
