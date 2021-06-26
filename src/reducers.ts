import {
  Footprint,
} from './utils'

const maxFootprints = 1000 as const

export const updateFootprints = (newFootprint: Footprint) => {
  return (footprints: Footprint[]): Footprint[] => {
    const sameFootprintIndex = footprints.findIndex(e => e.url === newFootprint.url)
    let newFootprints: Footprint[]
    if (sameFootprintIndex === -1) {
      newFootprints = [newFootprint, ...footprints]
    } else {
      let copiedFootprints = footprints.slice()
      copiedFootprints.splice(sameFootprintIndex, 1)
      newFootprints = [
        newFootprint,
        ...copiedFootprints,
      ]
    }
    return newFootprints.length <= maxFootprints ? newFootprints : newFootprints.slice(0, maxFootprints)
  }
}

export const deleteFootprint = (target: Footprint) =>  {
  return (footprints: Footprint[]): Footprint[] => {
    return footprints.filter(e => e !== target)
  }
}
