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
    expect(updateFootprint(newFootprint)(footprints)).toStrictEqual(expected)
  })
  test('it returns up to 10000', () => {
    const footprints10001: Footprint[] = []
    for (let i = 0; i < 10001; i++) {
      footprints10001.push({
        title: '',
        url: `https://example.com/${i}`,
      })
    }
    expect(footprints10001).toHaveLength(10001)
    expect(updateFootprint({title: '', url: 'https://not-example.com'})(footprints10001)).toHaveLength(10000)
  })
})
