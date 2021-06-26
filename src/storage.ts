import {
  updateFootprints,
} from './reducers'
import {
  Footprint,
} from './utils'

export type Storage = {
  loadFootprints: () => Promise<Footprint[]>;
  // TODO: 保存する件数に上限を設ける。
  saveFootprints: (footprints: Footprint[]) => Promise<void>;
  updateFootprints: (footprint: Footprint) => Promise<void>;
}

const localStorageFootprintsKey = 'recalldoc_footprints' as const

  // TODO: ChromeのAPIを使うようにすべきかも。要調査。
const localStorage: Storage = {
  loadFootprints: async () => {
    const rawFootprints = window.localStorage.getItem(localStorageFootprintsKey)
    return rawFootprints ? JSON.parse(rawFootprints) : []
  },
  saveFootprints: async (footprints: Footprint[]) => {
    const serializedFootprints = JSON.stringify(footprints)
    window.localStorage.setItem(localStorageFootprintsKey, serializedFootprints)
  },
  updateFootprints: async (footprint: Footprint) => {
    // TODO: トランザクションになっていない。
    const footprints = await localStorage.loadFootprints()
    return localStorage.saveFootprints(updateFootprints(footprint)(footprints))
  },
}

export const getStorage = (): Storage => {
  return localStorage
}
