import {
  updateFootprint as updateFootprintReducer,
} from './reducers'
import {
  Config,
  Footprint,
  PageMetaData,
  createDefaultConfig,
} from './utils'

export type Storage = {
  footprintsKey: string;
  loadItem: (key: string) => Promise<string | undefined>;
  saveItem: (key: string, value: string) => Promise<void>;
}

const configKey = 'config' as const

export const createChromeStorage = (siteId: PageMetaData['siteId'], teamId: string): Storage => {
  const footprintsKey = `footprints_${siteId}_${teamId}`
  return {
    footprintsKey,
    loadItem: (key) => {
      return new Promise(resolve => {
        chrome.storage.local.get([key], (result) => {
          resolve(result[key])
        })
      })
    },
    saveItem: (key, value) => {
      return new Promise(resolve => {
        chrome.storage.local.set({[key]: value}, () => {
          resolve()
        })
      })
    },
  } as const
}

export const loadConfig = async (storage: Storage): Promise<Config> => {
  const rawConfig = await storage.loadItem(configKey)
  // TODO: 設定値が足りない時に初期値で補完する。
  return rawConfig ? JSON.parse(rawConfig) : createDefaultConfig()
}

export const saveConfig = (storage: Storage, config: Config): Promise<void> => {
  return storage.saveItem(configKey, JSON.stringify(config))
}

export const loadFootprints = async (storage: Storage): Promise<Footprint[]> => {
  const rawFootprints = await storage.loadItem(storage.footprintsKey)
  return rawFootprints ? JSON.parse(rawFootprints) : []
}

/**
 * @param footprints 件数の上限は考慮しない。呼び出し元で調整する。
 */
export const saveFootprints = (storage: Storage, footprints: Footprint[]): Promise<void> => {
  // TODO: chrome.storage.local の最大容量（5mb）を超えたときのことを考慮する。 
  const serializedFootprints = JSON.stringify(footprints)
  return storage.saveItem(storage.footprintsKey, serializedFootprints)
}

export const updateFootprint = async (storage: Storage, footprint: Footprint): Promise<void> => {
  // TODO: トランザクションになっていない。
  const footprints = await loadFootprints(storage)
  return saveFootprints(storage, updateFootprintReducer(footprint)(footprints))
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
