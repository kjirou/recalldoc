import {
  Footprint,
  updateFootprints,
} from './utils'

describe('utils', () => {
  describe('updateFootprints', () => {
    const table: {
      name: string,
      expected: Footprint[],
      footprints: Footprint[],
      newFootprint: Footprint,
    }[] = [
      {
        name: 'It appends a new footprint to the top when there is no same one',
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
        name: 'It moves the footprint to the top when there is same one',
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
        name: 'It updates a title of the new footprint',
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
      expect(updateFootprints(footprints, newFootprint)).toStrictEqual(expected)
    })
  })
})
