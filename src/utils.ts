export type PageMetaData = {
  contentKind: 'category' | 'post' | 'unknown';
  siteId: 'esa';
  teamId: string;
} | {
  contentKind: 'folder' | 'note' | 'unknown';
  siteId: 'kibela';
  teamId: string;
} | {
  siteId: 'unknown';
}

export type Footprint = {
  title: string;
  url: string;
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
          : 'unknown'
    }
  } else if (host.endsWith('.kibe.la')) {
    return {
      siteId: 'kibela',
      teamId: host.replace(/\.kibe\.la$/, ''),
      contentKind: /^\/notes\/\d+$/.test(pathname)
        ? 'note'
        : pathname.startsWith('/notes/folder/')
          ? 'folder'
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

export const searchFootprints = (footprints: Footprint[], searchQuery: string): Footprint[] => {
  const keywords = splitSearchQueryIntoMultipulKeywords(searchQuery)
  return footprints.filter(footprint => {
    const upperCasedTitle = footprint.title.toUpperCase()
    return keywords.length === 0 || keywords.some(keyword => upperCasedTitle.includes(keyword.toUpperCase()))
  })
}
