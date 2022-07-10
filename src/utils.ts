import {convertToRegExp} from 'romaji-fuzzy-search'

export type Config = {
  enableRomajiSearch: boolean;
  startupKeyCombination: '1' | '2' | '99';
}

export const isStartupKeyCombinationType = (value: any): value is Config['startupKeyCombination'] =>
  ['1', '2', '99'].indexOf(value) !== -1

export type PageMetaData = {
  contentKind: 'category' | 'post' | 'unknown' | 'top';
  siteId: 'esa';
  teamId: string;
} | {
  contentKind: 'folderOthers' | 'folderTop' | 'note' | 'unknown';
  siteId: 'kibela';
  teamId: string;
} | {
  siteId: 'unknown';
}

export type Footprint = {
  /**
   * 記事パスをディレクトリ単位で分割したリスト。
   * esa では category、Kibela では folder と命名されている。
   */
  directories: string[];
  /**
   * 記事名。undefined のときはディレクトリの情報であることを示す。
   */
  name?: string;
  /**
   * 記事パス + 記事名。
   * かつて Kibela では、グループをまたぐと「記事パス + 記事名」の重複が可能だったので、この値が一意にならなかった。
   *   今はグループ名が記事パスに含まれているから一意になっているのかもしれない。詳細不明。
   */
  title: string;
  /**
   * 記事 URL。一意。
   */
  url: string;
}

export const createDefaultConfig = (): Config => {
  return {
    enableRomajiSearch: false,
    startupKeyCombination: '99',
  }
}

/**
 * 整数を配列の要素番号へ変換する。
 * @param index 0 を除く整数。
 */
export const rotateIndex = (length: number, index: number): number => {
  return ((index % length) + length) % length
}

export const classifyPage = (url: string): PageMetaData => {
  const {host, pathname, hash} = new URL(url)
  if (host.endsWith('.esa.io')) {
    return {
      siteId: 'esa',
      teamId: host.replace(/\.esa\.io$/, ''),
      contentKind: /^\/posts\/\d+$/.test(pathname)
          ? 'post'
          : pathname === '/' && hash.startsWith('#path=')
            ? 'category'
            : pathname === '/' && hash === ''
              ? 'top'
              : 'unknown'
    }
  } else if (host.endsWith('.kibe.la')) {
    return {
      siteId: 'kibela',
      teamId: host.replace(/\.kibe\.la$/, ''),
      contentKind: /^\/notes\/\d+$/.test(pathname)
        ? 'note'
        : pathname === '/notes/folder'
          ? 'folderTop'
          : pathname.startsWith('/notes/folder/')
            ? 'folderOthers'
            : 'unknown'
    }
  } else {
    return {
      siteId: 'unknown',
    }
  }
}

/**
 * esa の category 画面の path 値をディレクトリ単位へ分割する。
 * @param categoryPath - URL エンコーディングされていない値。"/" が子 category の区切りとして機能する。
 *                       なお、esa は記事タイトルに "/" を含めようとすると、それを自動的に区切りとして認識するので、結果として "/" が入力できない仕組み。
 */
export const splitEsaCategoryPath = (categoryPath: string): string[] => {
  return categoryPath.split('/')
}

/**
 * Kibela の folder 画面のパスをディレクトリ単位へ分割する。
 * @param folderWithTitle - "/" が子 category の区切りとして機能する。
 *                          なお、Kibela は記事タイトルに "/" を含めようとすると、入力エラーになる。
 */
export const splitKibelaFolderPath = (folderPath: string): string[] => {
  return folderPath.split('/')
}

// TODO: alt や option 同時押しも考慮した上で除外した方が丁寧。
export const canStartupSearcher = (
  startupKeyCombination: Config['startupKeyCombination'],
  ctrlKey: boolean,
  metaKey: boolean,
  shiftKey: boolean,
  key: string,
): boolean => {
  // NOTE: Windows だと、Shift を同時押ししているときは key が大文字になっていた。
  const lowerCaseKey = key.toLocaleLowerCase()
  return (
    (startupKeyCombination === '1' || startupKeyCombination === '99') &&
      ctrlKey && !metaKey && !shiftKey && lowerCaseKey === 'r' ||
      (startupKeyCombination === '2' || startupKeyCombination === '99') &&
        (ctrlKey && !metaKey || !ctrlKey && metaKey) && shiftKey && lowerCaseKey === 'l'
  )
}

export const splitSearchQueryIntoMultipulKeywords = (query: string): string[] => {
  return query.split(/[ \u3000]+/).filter(e => e !== '')
}

/**
 * @see https://developer.mozilla.org/en-US/docs/Web/JavaScript/Guide/Regular_Expressions#escaping
 */
const escapeRegExp = (str: string): string => {
  return str.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
}

export const searchFootprints = (footprints: Footprint[], searchQuery: string, enableRomajiSearch: boolean): Footprint[] => {
  const keywordMatchers = splitSearchQueryIntoMultipulKeywords(searchQuery)
    .map(keyword => {
      if (enableRomajiSearch) {
        return new RegExp(convertToRegExp(keyword), 'i')
      } else {
        return new RegExp(escapeRegExp(keyword), 'i')
      }
    })
  if (keywordMatchers.length === 0) {
    return footprints
  }
  return footprints.filter(footprint => {
    return keywordMatchers.every(e => e.test(footprint.title))
  })
}
