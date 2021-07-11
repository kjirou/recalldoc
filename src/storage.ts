import {
  updateFootprint as updateFootprintReducer,
} from './reducers'
import {
  Footprint,
  PageMetaData,
} from './utils'

export type Storage = {
  footprintsKey: string;
  loadFootprints: () => Promise<Footprint[]>;
  // TODO: 保存する件数に上限を設ける。
  saveFootprints: (footprints: Footprint[]) => Promise<void>;
}

export const createChromeStorage = (siteId: PageMetaData['siteId'], teamId: string): Storage => {
  const footprintsKey = `recalldoc_footprints_${siteId}_${teamId}`
  return {
    footprintsKey,
    loadFootprints: () => {
      return new Promise(resolve => {
        chrome.storage.sync.get([footprintsKey], (result) => {
          const rawFootprints = result[footprintsKey]
          resolve(rawFootprints ? JSON.parse(rawFootprints) : [])
        })
      })
    },
    saveFootprints: (footprints: Footprint[]) => {
      const serializedFootprints = JSON.stringify(footprints)
      return new Promise(resolve => {
        chrome.storage.sync.set({[footprintsKey]: serializedFootprints}, () => {
          resolve()
        })
      })
    },
  } as const
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
