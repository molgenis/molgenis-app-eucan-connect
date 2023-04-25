import { transformToRSQL } from '@molgenis/rsql'

function splitText (text) {
  return text.trim().split(' ')
}

function queryBuilder (attribute, filters, comparison) {
  if (!filters.length) return []

  switch (comparison) {
    case '=in=':
      return [{ selector: attribute, comparison, arguments: filters }]

    case '=like=':
      return splitText(filters).map(filter => ({ selector: attribute, comparison: '=like=', arguments: filter }))

    default:
      throw new Error(`Query of type ${comparison} is not implemented yet.`)
  }
}
export default {
  async countryQuery (countryCodes) {
    if (!countryCodes || !countryCodes.length) return ''

    return transformToRSQL({
      operator: 'OR',
      operands: queryBuilder('countries.iso2_code', countryCodes, '=in=')
    })
  },
  async textSearchQuery (text) {
    // the regex '/\S/gmi' means any non-whitespace character, so if a user has only spaces
    // it won't search that
    if (!text || !text.match(/\S/gmi)) return ''

    const nameQuery = transformToRSQL({
      operator: 'AND',
      operands: queryBuilder('study_name', text, '=like=')
    })

    const acronymQuery = await this.acronymSearch(text)
    // return them both concatenated as an OR

    return [nameQuery, acronymQuery].join(',')
  },
  async acronymSearch (text) {
    // the regex '/\S/gmi' means any non-whitespace character, so if a user has only spaces
    // it won't search that
    if (!text || !text.match(/\S/gmi)) return ''

    const acronymQuery = transformToRSQL({
      operator: 'AND',
      operands: queryBuilder('acronym', text, '=like=')
    })

    return acronymQuery
  },
  async sourceQuery (sources) {
    if (!sources || !sources.length) return ''

    return transformToRSQL({
      operator: 'OR',
      operands: queryBuilder('source_catalogue.id', sources, '=in=')
    })
  },
  async startYearQuery (active, start, end) {
    if (!active || !start || !end) return ''

    return `start_year=ge=${start}&start_year=le=${end}`
  },
  combineQuerys (querys) {
    let query = ''

    // check if we have querys and that not all querys are empty
    if (!querys || !querys.length || querys.filter(q => q === '').length === querys.length) return query

    query = '&q='

    // filter out empty queries
    const queryStrings = querys.filter(q => q !== '' && q !== undefined)

    // construct the complete RSQL strong
    for (const queryString of queryStrings) {
      query = `${query}${queryString};`
    }

    // cut off the excess and operator ';'
    query = query.substring(0, query.length - 1)

    return query
  }
}
