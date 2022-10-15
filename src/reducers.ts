import { Footprint } from "./utils";

const maxFootprints = 1000 as const;

/**
 * Footprintを追加または更新する。識別子はURL。
 */
export const updateFootprint = (newFootprint: Footprint) => {
  return (footprints: Footprint[]): Footprint[] => {
    const sameFootprintIndex = footprints.findIndex(
      (e) => e.url === newFootprint.url
    );
    let newFootprints: Footprint[];
    if (sameFootprintIndex === -1) {
      newFootprints = [newFootprint, ...footprints];
    } else {
      let copiedFootprints = footprints.slice();
      copiedFootprints.splice(sameFootprintIndex, 1);
      newFootprints = [newFootprint, ...copiedFootprints];
    }
    return newFootprints.length <= maxFootprints
      ? newFootprints
      : newFootprints.slice(0, maxFootprints);
  };
};

export const deleteFootprint = (target: Footprint) => {
  return (footprints: Footprint[]): Footprint[] => {
    return footprints.filter((e) => e !== target);
  };
};
