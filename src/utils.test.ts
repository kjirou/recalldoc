import {
  Footprint,
  PageMetaData,
  classifyPage,
  updateFootprints,
  searchFootprints,
  splitSearchQueryIntoMultipulKeywords,
} from './utils'

describe('utils', () => {
  describe('classifyPage', () => {
    const table: {
      expected: PageMetaData,
      url: string,
    }[] = [
      {
        url: 'https://foo.esa.io/posts/123',
        expected: {siteId: 'esa', contentKind: 'post', teamId: 'foo'},
      },
      {
        url: 'https://foo.esa.io/#path=%2FUsers',
        expected: {siteId: 'esa', contentKind: 'category', teamId: 'foo'},
      },
      {
        url: 'https://foo.esa.io/posts/123/edit',
        expected: {siteId: 'esa', contentKind: 'unknown', teamId: 'foo'},
      },
      {
        url: 'https://foo.kibe.la/notes/123',
        expected: {siteId: 'kibela', contentKind: 'note', teamId: 'foo'},
      },
      {
        url: 'https://foo.kibe.la/notes/folder/Bar?group_id=1&order_by=title',
        expected: {siteId: 'kibela', contentKind: 'folder', teamId: 'foo'},
      },
      {
        url: 'https://foo.kibe.la/notes/123/edit',
        expected: {siteId: 'kibela', contentKind: 'unknown', teamId: 'foo'},
      },
      {
        url: 'https://esa.io',
        expected: {siteId: 'unknown'},
      },
      {
        url: 'https://kibe.la',
        expected: {siteId: 'unknown'},
      },
    ]
    test.each(table)(`$url -> $expected`, ({url, expected}) => {
      expect(classifyPage(url)).toStrictEqual(expected)
    })
  })
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
    test('It returns up to 1000', () => {
      const footprints1000: Footprint[] = []
      for (let i = 0; i < 1000; i++) {
        footprints1000.push({
          title: '',
          url: `https://example.com/${i}`,
        })
      }
      expect(footprints1000).toHaveLength(1000)
      expect(updateFootprints(footprints1000, {title: '', url: 'https://not-example.com'})).toHaveLength(1000)
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
