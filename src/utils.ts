export type Footprint = {
  title: string;
  url: string;
}

export const updateFootprints = (footprints: Footprint[], newFootprint: Footprint): Footprint[] => {
  const sameFootprintIndex = footprints.findIndex(e => e.url === newFootprint.url)
  if (sameFootprintIndex === -1) {
    return [newFootprint, ...footprints]
  } else {
    let copiedFootprints = footprints.slice()
    copiedFootprints.splice(sameFootprintIndex, 1)
    return [
      newFootprint,
      ...copiedFootprints,
    ]
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
