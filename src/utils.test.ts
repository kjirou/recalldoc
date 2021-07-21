import {
  Footprint,
  PageMetaData,
  classifyPage,
  convertHiraganaToKatakana,
  createRomajiSearchRegexp,
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
describe('convertHiraganaToKatakana', () => {
  const table: {
    args: Parameters<typeof convertHiraganaToKatakana>,
    expected: ReturnType<typeof convertHiraganaToKatakana>,
    name: string,
  }[] = [
    {
      name: 'it works',
      args: ['ぁゔゝゞ'],
      expected: 'ァヴヽヾ',
    },
  ]
  test.each(table)('$name', ({args, expected}) => {
    expect(convertHiraganaToKatakana(...args)).toBe(expected)
  })
  test('it throws an error when it receives any non-target characters', () => {
    expect(() => {
      convertHiraganaToKatakana('a')
    }).toThrowError(/ convert the code point /)
  })
})
describe('createRomajiSearchRegexp', () => {
  const table: {
    args: Parameters<typeof createRomajiSearchRegexp>,
    expected: ReturnType<typeof createRomajiSearchRegexp>,
    name: string,
  }[] = [
    {
      name: 'it replaces one romaji',
      args: ['a'],
      expected: '(?:a|あ|ア)',
    },
    {
      name: 'it replaces two romaji',
      args: ['ka'],
      expected: '(?:ka|か|カ)',
    },
    {
      name: 'it replaces three romaji',
      args: ['kya'],
      expected: '(?:kya|きゃ|キャ)',
    },
    {
      name: 'it does not replace a character that is not a romaji',
      args: ['k'],
      expected: 'k',
    },
    {
      name: 'it escapes characters of regexp pattern',
      args: ['?'],
      expected: '\\?',
    },
    {
      name: 'it gives priority to long phrases',
      args: ['kyayaay'],
      expected: '(?:kya|きゃ|キャ)(?:ya|や|ヤ)(?:a|あ|ア)y',
    },
  ]
  test.each(table)('$name', ({args, expected}) => {
    expect(createRomajiSearchRegexp(...args)).toBe(expected)
  })
})
describe('searchFootprints', () => {
  const createFootprints = (...titles: Footprint['title'][]): Footprint[] => {
    return titles.map(title => ({title, url: ''}))
  }
  const table: {
    args: Parameters<typeof searchFootprints>,
    expected: ReturnType<typeof searchFootprints>,
    name: string,
  }[] = [
    {
      name: 'it searches by partial match',
      args: [
        createFootprints('foox', 'bar', 'baz'),
        'ba',
        false,
      ],
      expected: createFootprints('bar', 'baz'),
    },
    {
      name: 'it searches by case insensitive',
      args: [
        createFootprints('abc', 'ABC'),
        'AbC',
        false,
      ],
      expected: createFootprints('abc', 'ABC'),
    },
    {
      name: 'it returns all footprints when the search query is empty',
      args: [
        createFootprints('foo', 'bar', 'baz'),
        '',
        false,
      ],
      expected: createFootprints('foo', 'bar', 'baz'),
    },
    {
      name: 'it does not throw any regexp syntax errors',
      args: [
        createFootprints('a.*+?^${}()|[]/b', 'cd'),
        '.*+?^${}()|[]/',
        false,
      ],
      expected: createFootprints('a.*+?^${}()|[]/b'),
    },
    {
      name: 'it does not use dots as any single character',
      args: [
        createFootprints('a', '.', 'A'),
        '.',
        false,
      ],
      expected: createFootprints('.'),
    },
    {
      name: 'it can search as romaji',
      args: [
        createFootprints('nyan', 'にゃん', 'ニャン', 'にゃーん'),
        'nyaん',
        true,
      ],
      expected: createFootprints('にゃん'),
    },
  ]
  test.each(table)(`$name`, ({args, expected}) => {
    expect(searchFootprints(...args)).toStrictEqual(expected)
  })
})
