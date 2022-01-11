
import { sortAsc, sortDesc, unique } from '../../../src/logic/predicates'

const testArrayData = [
  {
    testProp: 'c'
  },
  {
    testProp: 'a'
  },
  {
    testProp: 'b'
  }
]

describe('predicates', () => {
  let testArray = []
  beforeEach(() => {
    // make a copy because some functions are 'in place'
    testArray = JSON.parse(JSON.stringify(testArrayData))
  })

  it('can sort an an array with objects in ascending order based on a property', () => {
    testArray.sort(sortAsc('testProp'))
    expect(testArray[0].testProp).toBe('a')
    expect(testArray[2].testProp).toBe('c')
  })

  it('can sort an an array with objects in descending order based on a property', () => {
    testArray.sort(sortDesc('testProp'))
    expect(testArray[0].testProp).toBe('c')
    expect(testArray[2].testProp).toBe('a')
  })

  it('can deduplicate an array', () => {
    testArray.push({ testProp: 'a' })
    testArray = testArray.filter(unique('testProp'))

    const onlyA = testArray.filter(obj => !['b', 'c'].includes(obj.testProp))
    expect(onlyA.length).toBe(1)
  })
})
