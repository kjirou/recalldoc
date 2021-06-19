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
