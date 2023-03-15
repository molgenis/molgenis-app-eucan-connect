
import rsqlService from '../../../src/logic/rsqlService'

describe('rsqlService', () => {
  it('can create a contact id query based on country codes', async () => {
    const query = await rsqlService.countryQuery(['NL'])
    expect(query).toBe('countries.iso2_code=in=(NL)')
  })

  it('can create a search query for title and acronym based on text input', async () => {
    const query = await rsqlService.textSearchQuery('Danish study')
    expect(query).toBe('study_name=like=Danish;study_name=like=study,acronym=like=Danish;acronym=like=study')
  })

  it('can create a source query for a selection of sources', async () => {
    const query = await rsqlService.sourceQuery(['Maelstrom', 'LifeCycle'])
    expect(query).toBe('source_catalogue.id=in=(Maelstrom,LifeCycle)')
  })

  it('can create a start year query for a selection of years', async () => {
    const query = await rsqlService.startYearQuery([2022, 2019])
    expect(query).toBe('start_year=in=(2022,2019)')
  })

  it('can combine multiple queries to one query, excluding empties', async () => {
    const query1 = await rsqlService.startYearQuery([2022, 2019])
    const query2 = await rsqlService.sourceQuery(['Maelstrom', 'LifeCycle'])

    const query = await rsqlService.combineQuerys([query1, '', query2, undefined])
    expect(query).toBe('&q=start_year=in=(2022,2019);source_catalogue.id=in=(Maelstrom,LifeCycle)')
  })
})
