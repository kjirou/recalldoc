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
        {directories: [], title: 'Foo', url: 'https://example.com/foo'},
      ],
      newFootprint: {directories: [], title: 'Bar', url: 'https://example.com/bar'},
      expected: [
        {directories: [], title: 'Bar', url: 'https://example.com/bar'},
        {directories: [], title: 'Foo', url: 'https://example.com/foo'},
      ],
    },
    {
      name: 'it moves the footprint to the top when there is same one',
      footprints: [
        {directories: [], title: 'Foo', url: 'https://example.com/foo'},
        {directories: [], title: 'Bar', url: 'https://example.com/bar'},
        {directories: [], title: 'Baz', url: 'https://example.com/baz'},
      ],
      newFootprint: {directories: [], title: 'Bar', url: 'https://example.com/bar'},
      expected: [
        {directories: [], title: 'Bar', url: 'https://example.com/bar'},
        {directories: [], title: 'Foo', url: 'https://example.com/foo'},
        {directories: [], title: 'Baz', url: 'https://example.com/baz'},
      ],
    },
    {
      name: 'it updates a title of the new footprint',
      footprints: [
        {directories: [], title: 'Foo', url: 'https://example.com/foo'},
      ],
      newFootprint: {directories: [], title: 'Foo2', url: 'https://example.com/foo'},
      expected: [
        {directories: [], title: 'Foo2', url: 'https://example.com/foo'},
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
        title: '',
        url: `https://example.com/${i}`,
      })
    }
    expect(footprints1000).toHaveLength(1000)
    expect(updateFootprint({directories: [], title: '', url: 'https://not-example.com'})(footprints1000)).toHaveLength(1000)
  })
})
