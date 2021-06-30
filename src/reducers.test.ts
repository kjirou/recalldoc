import {
  updateFootprints,
} from './reducers'
import {
  Footprint,
} from './utils'

describe('updateFootprints', () => {
  const table: {
    name: string,
    expected: Footprint[],
    footprints: Footprint[],
    newFootprint: Footprint,
  }[] = [
    {
      name: 'it appends a new footprint to the top when there is no same one',
      footprints: [
        {title: 'Foo', url: 'https://example.com/foo'},
      ],
      newFootprint: {title: 'Bar', url: 'https://example.com/bar'},
      expected: [
        {title: 'Bar', url: 'https://example.com/bar'},
        {title: 'Foo', url: 'https://example.com/foo'},
      ],
    },
    {
      name: 'it moves the footprint to the top when there is same one',
      footprints: [
        {title: 'Foo', url: 'https://example.com/foo'},
        {title: 'Bar', url: 'https://example.com/bar'},
        {title: 'Baz', url: 'https://example.com/baz'},
      ],
      newFootprint: {title: 'Bar', url: 'https://example.com/bar'},
      expected: [
        {title: 'Bar', url: 'https://example.com/bar'},
        {title: 'Foo', url: 'https://example.com/foo'},
        {title: 'Baz', url: 'https://example.com/baz'},
      ],
    },
    {
      name: 'it updates a title of the new footprint',
      footprints: [
        {title: 'Foo', url: 'https://example.com/foo'},
      ],
      newFootprint: {title: 'Foo2', url: 'https://example.com/foo'},
      expected: [
        {title: 'Foo2', url: 'https://example.com/foo'},
      ],
    },
  ]
  test.each(table)('$name', ({footprints, newFootprint, expected}) => {
    expect(updateFootprints(newFootprint)(footprints)).toStrictEqual(expected)
  })
  test('it returns up to 1000', () => {
    const footprints1000: Footprint[] = []
    for (let i = 0; i < 1000; i++) {
      footprints1000.push({
        title: '',
        url: `https://example.com/${i}`,
      })
    }
    expect(footprints1000).toHaveLength(1000)
    expect(updateFootprints({title: '', url: 'https://not-example.com'})(footprints1000)).toHaveLength(1000)
  })
})
