<template>
  <div>
    <table
      v-for="study of studies"
      :key="study.name"
      class="similar-studies-table">
      <tbody>
        <tr v-for="item of properties" :key="item.prop">
          <template>
            <th role="label" class="mr-3 property-header">
              {{ item.label }}
            </th>
            <td class="pl-5">
              <a v-if="item.type === 'url' && study[item.prop]" :href="createHref(study[item.prop])" target="_blank">
                {{ study[item.prop] || '-' }}</a>
              <a v-else-if="item.type === 'nested_url' && getNestedData(study[item.prop],item.urlProp)" :href="createHref(getNestedData(study[item.prop],item.urlProp))" target="_blank">
                {{ getNestedData(study[item.prop], item.labelProp || item.urlProp) }}</a>
              <span v-else>{{ study[item.prop] || '-' }}</span>
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
          label: 'Name:',
          prop: 'study_name'
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
          label: 'Source:',
          prop: 'source_data',
          type: 'url'
        },
        {
          label: 'Found in catalogue:',
          prop: 'source_catalogue',
          labelProp: 'description',
          urlProp: 'catalogue_url',
          type: 'nested_url'
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
    },
    getNestedData (item, nestedProp) {
      if (!item) return
      if (item.data) {
        return item.data[nestedProp]
      } else {
        return item.nestedProp
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
