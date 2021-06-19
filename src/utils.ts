export type Footprint = {
  title: string;
  url: string;
}

export const updateFootprints = (footprints: Footprint[], newFootprint: Footprint): Footprint[] => {
  const sameFootprintIndex = footprints.findIndex(e => e.url === newFootprint.url)
  if (sameFootprintIndex === -1) {
    return [newFootprint, ...footprints]
  } else {
    const sameFootprint = footprints[sameFootprintIndex]
    return [
      {
        ...newFootprint,
        title: sameFootprint.title,
      },
      ...footprints.slice().splice(sameFootprintIndex, 1),
    ]
  }
}
