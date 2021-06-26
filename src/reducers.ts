import {
  Footprint,
} from './utils'

export const deleteFootprint = (target: Footprint) =>  {
  return (footprints: Footprint[]): Footprint[] => {
    return footprints.filter(e => e !== target)
  }
}
