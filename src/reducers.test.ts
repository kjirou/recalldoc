import {
  updateFootprint,
} from './reducers'
import {
  Footprint,
} from './utils'

describe('updateFootprint', () => {
  const table: {
    name: string,
    expected: Footprint[],
    footprints: Footprint[],
    newFootprint: Footprint,
  }[] = [
    {
      name: 'it appends a new footprint to the top when there is no same one',
      footprints: [
        {directories: ['foo'], url: 'https://example.com/foo'},
      ],
      newFootprint: {directories: ['bar'], url: 'https://example.com/bar'},
      expected: [
        {directories: ['bar'], url: 'https://example.com/bar'},
        {directories: ['foo'], url: 'https://example.com/foo'},
      ],
    },
    {
      name: 'it moves the footprint to the top when there is same one',
      footprints: [
        {directories: ['foo'], url: 'https://example.com/foo'},
        {directories: ['bar'], url: 'https://example.com/bar'},
        {directories: ['baz'], url: 'https://example.com/baz'},
      ],
      newFootprint: {directories: ['bar'], url: 'https://example.com/bar'},
      expected: [
        {directories: ['bar'], url: 'https://example.com/bar'},
        {directories: ['foo'], url: 'https://example.com/foo'},
        {directories: ['baz'], url: 'https://example.com/baz'},
      ],
    },
    {
      name: 'it updates a title of the new footprint',
      footprints: [
        {directories: ['foo'], url: 'https://example.com/foo'},
      ],
      newFootprint: {directories: ['foo2'], url: 'https://example.com/foo'},
      expected: [
        {directories: ['foo2'], url: 'https://example.com/foo'},
      ],
    },
  ]
  test.each(table)('$name', ({footprints, newFootprint, expected}) => {
    expect(updateFootprint(newFootprint)(footprints)).toStrictEqual(expected)
  })
  test('it returns up to 1000', () => {
    const footprints1000: Footprint[] = []
    for (let i = 0; i < 1000; i++) {
      footprints1000.push({
        directories: [],
        url: `https://example.com/${i}`,
      })
    }
    expect(footprints1000).toHaveLength(1000)
    expect(updateFootprint({directories: [], url: 'https://not-example.com'})(footprints1000)).toHaveLength(1000)
  })
})
