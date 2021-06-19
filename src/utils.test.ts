import {
  Footprint,
  updateFootprints,
  searchFootprints,
  splitSearchQueryIntoMultipulKeywords,
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
  describe('splitSearchQueryIntoMultipulKeywords', () => {
    const table: {
      expected: string[],
      query: string,
    }[] = [
      {
        query: 'foo',
        expected: ['foo'],
      },
      {
        query: '  foo  ',
        expected: ['foo'],
      },
      {
        query: '\u3000\u3000foo\u3000\u3000',
        expected: ['foo'],
      },
      {
        query: '\u3000 \u3000foo \u3000 ',
        expected: ['foo'],
      },
      {
        query: 'foo bar \u3000baz',
        expected: ['foo', 'bar', 'baz'],
      },
      {
        query: '',
        expected: [],
      },
      {
        query: ' ',
        expected: [],
      },
    ]
    test.each(table)(`"$query" -> $expected`, ({query, expected}) => {
      expect(splitSearchQueryIntoMultipulKeywords(query)).toStrictEqual(expected)
    })
  })
  describe('searchFootprints', () => {
    const createFootprints = (...titles: Footprint['title'][]): Footprint[] => {
      return titles.map(title => ({title, url: ''}))
    }
    const table: {
      expected: Footprint[],
      footprints: Footprint[],
      name: string,
      searchQuery: string,
    }[] = [
      {
        name: 'It searches by partial match',
        footprints: createFootprints('foox', 'bar', 'baz'),
        searchQuery: 'ba',
        expected: createFootprints('bar', 'baz'),
      },
      {
        name: 'It searches by case insensitive',
        footprints: createFootprints('abc', 'ABC'),
        searchQuery: 'AbC',
        expected: createFootprints('abc', 'ABC'),
      },
      {
        name: 'It returns all footprints when the search query is empty',
        footprints: createFootprints('foo', 'bar', 'baz'),
        searchQuery: '',
        expected: createFootprints('foo', 'bar', 'baz'),
      },
    ]
    test.each(table)(`$name`, ({footprints, searchQuery, expected}) => {
      expect(searchFootprints(footprints, searchQuery)).toStrictEqual(expected)
    })
  })
})
