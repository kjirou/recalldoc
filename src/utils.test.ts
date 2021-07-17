import {
  Footprint,
  PageMetaData,
  classifyPage,
  rotateIndex,
  searchFootprints,
  splitSearchQueryIntoMultipulKeywords,
} from './utils'

describe('rotateIndex', () => {
  const table: {
    expected: number,
    index: number,
    length: number,
  }[] = [
    {
      length: 1,
      index: 0,
      expected: 0,
    },
    {
      length: 3,
      index: 4,
      expected: 1,
    },
    {
      length: 3,
      index: -1,
      expected: 2,
    },
  ]
  test.each(table)(`($length, $index) -> $expected`, ({length, index, expected}) => {
    expect(rotateIndex(length, index)).toBe(expected)
  })
})
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
      url: 'https://foo.esa.io/',
      expected: {siteId: 'esa', contentKind: 'top', teamId: 'foo'},
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
      expected: {siteId: 'kibela', contentKind: 'folderOthers', teamId: 'foo'},
    },
    {
      url: 'https://foo.kibe.la/notes/folder?order_by=title&group_id=1',
      expected: {siteId: 'kibela', contentKind: 'folderTop', teamId: 'foo'},
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
      name: 'it searches by partial match',
      footprints: createFootprints('foox', 'bar', 'baz'),
      searchQuery: 'ba',
      expected: createFootprints('bar', 'baz'),
    },
    {
      name: 'it searches by case insensitive',
      footprints: createFootprints('abc', 'ABC'),
      searchQuery: 'AbC',
      expected: createFootprints('abc', 'ABC'),
    },
    {
      name: 'it returns all footprints when the search query is empty',
      footprints: createFootprints('foo', 'bar', 'baz'),
      searchQuery: '',
      expected: createFootprints('foo', 'bar', 'baz'),
    },
    {
      name: 'it does not throw any regexp syntax errors',
      footprints: createFootprints('a.*+?^${}()|[]/b', 'cd'),
      searchQuery: '.*+?^${}()|[]/',
      expected: createFootprints('a.*+?^${}()|[]/b'),
    },
    {
      name: 'it does not use dots as any single character',
      footprints: createFootprints('a', '.', 'A'),
      searchQuery: '.',
      expected: createFootprints('.'),
    },
  ]
  test.each(table)(`$name`, ({footprints, searchQuery, expected}) => {
    expect(searchFootprints(footprints, searchQuery)).toStrictEqual(expected)
  })
})
