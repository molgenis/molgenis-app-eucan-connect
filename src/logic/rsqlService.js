import api from '@molgenis/molgenis-api-client'
import { transformToRSQL } from '@molgenis/rsql'

// move these later to molgenis/rsql
const queryBuilder = (attribute, filters, comparison) => filters.length > 0
  ? [{ selector: attribute, comparison, arguments: filters }]
  : []

export default {
  async contactIdQuery (countryCodes) {
    if (!countryCodes || !countryCodes.length) return ''

    const contactRsql = transformToRSQL({
      operator: 'OR',
      operands: queryBuilder('country.iso2_code', countryCodes, '=in=')
    })

    // get id's of contacts of country.
    const contactResponse = await api.get(`/api/data/eucan_persons?q=${contactRsql}`)

    // Get unique id's
    const contactIds = [...new Set(contactResponse.items.map(item => item.data.id))]

    return transformToRSQL({
      operator: 'OR',
      operands: queryBuilder('contacts.id', contactIds, '=in=')
    })
  },
  async textSearchQuery (text) {
    if (!text) return ''

    const searchTerms = text.split(' ')

    let operands = queryBuilder('study_name', searchTerms, '=like=')
    operands = operands.concat(queryBuilder('acronym', searchTerms, '=like='))

    return transformToRSQL({
      operator: 'OR',
      operands
    })
  },
  combineQuerys (querys) {
    let query = ''

    // check if we have querys and that not all querys are empty
    if (!querys || !querys.length || querys.filter(q => q === '').length === querys.length) return query

    query = '&q='

    // filter out empty queries
    const queryStrings = querys.filter(q => q !== '')

    // construct the complete RSQL strong
    for (const queryString of queryStrings) {
      query = `${query}${queryString};`
    }

    // cut off the excess and operator ';'
    query = query.substring(0, query.length - 1)

    return query
  }
}
