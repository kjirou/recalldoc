import {
  updateFootprint as updateFootprintReducer,
} from './reducers'
import {
  Footprint,
} from './utils'

export type Storage = {
  loadFootprints: () => Promise<Footprint[]>;
  // TODO: 保存する件数に上限を設ける。
  saveFootprints: (footprints: Footprint[]) => Promise<void>;
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
}

export const getStorage = (): Storage => {
  return localStorage
}

export const updateFootprint = async (storage: Storage, footprint: Footprint): Promise<void> => {
  // TODO: トランザクションになっていない。
  const footprints = await storage.loadFootprints()
  return storage.saveFootprints(updateFootprintReducer(footprint)(footprints))
}

export const updateFootprintOfEsaCategory = (storage: Storage, origin: string, hash: string): void => {
  const categoryPath = decodeURIComponent(hash.replace(/^#path=/, '')).replace(/^\//, '')
  const newFootprint: Footprint = {
    title: categoryPath,
    url: origin + '/' + hash,
  }
  updateFootprint(storage, newFootprint)
}

export const updateFootprintOfKibelaFolder = (storage: Storage, origin: string, pathname: string): void => {
  const folder = decodeURIComponent(pathname.replace(/^\/notes\/folder\//, ''))
  const newFootprint: Footprint = {
    title: folder,
    url: origin + pathname,
  }
  updateFootprint(storage, newFootprint)
}
