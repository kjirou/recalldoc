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

const chromeStorageFootprintsKey = 'recalldoc_footprints' as const

const chromeStorage: Storage = {
  loadFootprints: () => {
    return new Promise(resolve => {
      chrome.storage.sync.get([chromeStorageFootprintsKey], (result) => {
        const rawFootprints = result[chromeStorageFootprintsKey]
        resolve(rawFootprints ? JSON.parse(rawFootprints) : [])
      })
    })
  },
  saveFootprints: (footprints: Footprint[]) => {
    const serializedFootprints = JSON.stringify(footprints)
    return new Promise(resolve => {
      chrome.storage.sync.set({[chromeStorageFootprintsKey]: serializedFootprints}, () => {
        resolve()
      })
    })
  },
}

export const getStorage = (): Storage => {
  return chromeStorage
}

export const updateFootprint = async (storage: Storage, footprint: Footprint): Promise<void> => {
  // TODO: トランザクションになっていない。
  const footprints = await storage.loadFootprints()
  return storage.saveFootprints(updateFootprintReducer(footprint)(footprints))
}

export const updateFootprintOfEsaCategory = (storage: Storage, origin: string, hash: string): Promise<void> => {
  const categoryPath = decodeURIComponent(hash.replace(/^#path=/, '')).replace(/^\//, '')
  const newFootprint: Footprint = {
    title: categoryPath,
    url: origin + '/' + hash,
  }
  return updateFootprint(storage, newFootprint)
}

export const updateFootprintOfKibelaFolder = (storage: Storage, origin: string, pathname: string): Promise<void> => {
  const folder = decodeURIComponent(pathname.replace(/^\/notes\/folder\//, ''))
  const newFootprint: Footprint = {
    title: folder,
    url: origin + pathname,
  }
  return updateFootprint(storage, newFootprint)
}
