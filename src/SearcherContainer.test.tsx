import {
  renderHook,
} from '@testing-library/react-hooks'
import {
  useStorageSynchronization,
} from './SearcherContainer'
import {
  Footprint,
} from './utils'
import {
  Storage,
} from './storage'

describe('useStorageSynchronization', () => {
  const renderUseStorageSynchronization = (...args: Parameters<typeof useStorageSynchronization>) => {
    return renderHook(
      ({storage, footprints}) => useStorageSynchronization(storage, footprints),
      {initialProps: {storage: args[0], footprints: args[1]}},
    )
  }
  let storage: Storage

  beforeEach(() => {
    storage = {
      loadFootprints: jest.fn(),
      saveFootprints: jest.fn(),
    }
  })

  test('it does not call saveFootprints when footprints is the same', () => {
    const footprints: Footprint[] = []
    const {rerender} = renderUseStorageSynchronization(storage, footprints)
    rerender({storage, footprints})
    expect(storage.saveFootprints).not.toHaveBeenCalled()
  })
  test('it calls saveFootprints when footprints is different', () => {
    const footprints: Footprint[] = []
    const {rerender} = renderUseStorageSynchronization(storage, footprints)
    const newFootprints: Footprint[] = [{title: '', url: ''}]
    rerender({storage, footprints: newFootprints})
    expect(storage.saveFootprints).toHaveBeenCalledTimes(1)
  })
})
