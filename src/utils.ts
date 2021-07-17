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
   * 画面のタイトル。Searcher の選択肢の表示名になる。
   * Kibela の folder のときは、グループを横断した重複は可能なので一意にならない。
   */
  title: string;
  /**
   * 画面の URL。一意。
   */
  url: string;
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

export const splitSearchQueryIntoMultipulKeywords = (query: string): string[] => {
  return query.split(/[ \u3000]+/).filter(e => e !== '')
}

/**
 * @see https://developer.mozilla.org/en-US/docs/Web/JavaScript/Guide/Regular_Expressions#escaping
 */
const escapeRegExp = (str: string): string => {
  return str.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
}

export const searchFootprints = (footprints: Footprint[], searchQuery: string): Footprint[] => {
  const keywordMatchers = splitSearchQueryIntoMultipulKeywords(searchQuery)
    .map(e => new RegExp(escapeRegExp(e), 'i'))
  if (keywordMatchers.length === 0) {
    return footprints
  }
  return footprints.filter(footprint => {
    return keywordMatchers.some(e => e.test(footprint.title))
  })
}
