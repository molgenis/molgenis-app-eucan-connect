<template>
  <div>
    <table
      v-for="population of populations"
      :key="population.name"
      class="population-table mb-4">
      <tbody>
        <tr
          v-for="item of populationProperties"
          :key="`${population.id}${population[item.prop]}`">
          <template>
            <th role="label" class="mr-3 property-header">
              {{ item.label }}
            </th>
            <td class="pl-5">
              <span v-if="item.type === 'array'">
                {{ population[item.prop].map((m) => m.label).join(", ") || "-" }}</span>
              <span v-else>{{ population[item.prop] || "-" }}</span>
            </td>
          </template>
        </tr>
      </tbody>
    </table>
  </div>
</template>

<script>
export default {
  name: 'PopulationsTable',
  props: {
    populations: {
      type: Array,
      required: true,
      default: () => []
    }
  },
  computed: {
    populationProperties () {
      return [
        {
          label: 'Name:',
          prop: 'name'
        },
        {
          label: 'Selection criteria:',
          prop: 'selection_criteria',
          type: 'array'
        }
      ]
    }
  }
}
</script>
<style scoped>
.population-table:not(:first-child) {
  margin-top: 1rem;
}
</style>
