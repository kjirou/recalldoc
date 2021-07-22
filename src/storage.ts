import {
  updateFootprint as updateFootprintReducer,
} from './reducers'
import {
  Config,
  Footprint,
  PageMetaData,
  createDefaultConfig,
} from './utils'

// TODO: saveItem と loadItem にまとめる。
export type Storage = {
  footprintsKey: string;
  // TODO: 設定値が足りない時に初期値で補完する。
  loadConfig: () => Promise<Config>;
  loadFootprints: () => Promise<Footprint[]>;
  saveConfig: (config: Config) => Promise<void>;
  /**
   * @param footprints 件数の上限は考慮しない。呼び出し元で調整する。
   */
  saveFootprints: (footprints: Footprint[]) => Promise<void>;
}

const configKey = 'config' as const

export const createChromeStorage = (siteId: PageMetaData['siteId'], teamId: string): Storage => {
  const footprintsKey = `footprints_${siteId}_${teamId}`
  return {
    footprintsKey,
    loadConfig: () => {
      return new Promise(resolve => {
        chrome.storage.local.get([configKey], (result) => {
          const rawConfig = result[configKey]
          resolve(rawConfig ? JSON.parse(rawConfig) : createDefaultConfig())
        })
      })
    },
    saveConfig: (config: Config) => {
      const serializedConfig = JSON.stringify(config)
      return new Promise(resolve => {
        chrome.storage.local.set({[configKey]: serializedConfig}, () => {
          resolve()
        })
      })
    },
    loadFootprints: () => {
      return new Promise(resolve => {
        chrome.storage.local.get([footprintsKey], (result) => {
          const rawFootprints = result[footprintsKey]
          resolve(rawFootprints ? JSON.parse(rawFootprints) : [])
        })
      })
    },
    saveFootprints: (footprints: Footprint[]) => {
      // TODO: chrome.storage.local の最大容量（5mb）を超えたときのことを考慮する。 
      const serializedFootprints = JSON.stringify(footprints)
      return new Promise(resolve => {
        chrome.storage.local.set({[footprintsKey]: serializedFootprints}, () => {
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

export const updateFootprintOfKibelaFolder = (storage: Storage, url: string): Promise<void> => {
  const urlObj = new URL(url)
  const folder = decodeURIComponent(urlObj.pathname.replace(/^\/notes\/folder\//, ''))
  const groupId = urlObj.searchParams.get('group_id')
  const queryString = groupId ? `?group_id=${encodeURIComponent(groupId)}` : ''
  const newFootprint: Footprint = {
    title: folder,
    url: urlObj.origin + urlObj.pathname + queryString,
  }
  return updateFootprint(storage, newFootprint)
}
