import {
  Footprint,
  createDefaultConfig,
} from './utils'
import {
  Storage,
  updateFootprintOfEsaCategory,
  updateFootprintOfKibelaFolder,
} from './storage'

type UpdateFootprintOfEsaCategoryParameters = Parameters<typeof updateFootprintOfEsaCategory>
type UpdateFootprintOfKibelaFolderParameters = Parameters<typeof updateFootprintOfKibelaFolder>

describe('updateFootprintOfEsaCategory', () => {
  let storage: Storage

  beforeEach(() => {
    storage = {
      footprintsKey: 'key',
      loadItem: jest.fn().mockResolvedValue(undefined),
      saveItem: jest.fn().mockResolvedValue(undefined),
    }
  })

  const table: {
    args: {
      hash: UpdateFootprintOfEsaCategoryParameters[2];
      origin: UpdateFootprintOfEsaCategoryParameters[1];
    },
    name: string,
    expected: Footprint[],
  }[] = [
    {
      name: 'it works',
      args: {
        origin: 'https://nowhere.esa.io',
        hash: '#path=%2Ffoo%2F%E3%81%B0%E3%83%BC',
      },
      expected: [{
        directories: [],
        title: 'foo/ばー',
        url: 'https://nowhere.esa.io/#path=%2Ffoo%2F%E3%81%B0%E3%83%BC',
      }],
    },
  ]
  test.each(table)('$name', async ({args, expected}) => {
    await updateFootprintOfEsaCategory(storage, args.origin, args.hash)
    expect(storage.saveItem).toHaveBeenCalledTimes(1)
    expect(storage.saveItem).toHaveBeenCalledWith(storage.footprintsKey, JSON.stringify(expected))
  })
})

describe('updateFootprintOfKibelaFolder', () => {
  let storage: Storage

  beforeEach(() => {
    storage = {
      footprintsKey: 'key',
      loadItem: jest.fn().mockResolvedValue(undefined),
      saveItem: jest.fn().mockResolvedValue(undefined),
    }
  })

  const table: {
    args: {
      url: UpdateFootprintOfKibelaFolderParameters[1];
    },
    name: string,
    expected: Footprint[],
  }[] = [
    {
      name: 'it works',
      args: {
        url: 'https://nowhere.kibe.la/notes/folder/foo/%E3%81%B0%E3%83%BC',
      },
      expected: [{
        directories: [],
        title: 'foo/ばー',
        url: 'https://nowhere.kibe.la/notes/folder/foo/%E3%81%B0%E3%83%BC',
      }],
    },
    {
      name: 'it appends "group_id" param to url when the passed url includes it',
      args: {
        url: 'https://nowhere.kibe.la/notes/folder/foo?group_id=2&order_by=title',
      },
      expected: [{
        directories: [],
        title: 'foo',
        url: 'https://nowhere.kibe.la/notes/folder/foo?group_id=2',
      }],
    },
  ]
  test.each(table)('$name', async ({args, expected}) => {
    await updateFootprintOfKibelaFolder(storage, args.url)
    expect(storage.saveItem).toHaveBeenCalledTimes(1)
    expect(storage.saveItem).toHaveBeenCalledWith(storage.footprintsKey, JSON.stringify(expected))
  })
})
