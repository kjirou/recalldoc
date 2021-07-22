import {
  render,
} from '@testing-library/react'
import {
  act,
  renderHook,
} from '@testing-library/react-hooks'
import userEvent from '@testing-library/user-event'
import {
  Props,
  SearcherContainer,
  usePortalRoot,
  useStorageSynchronization,
  useVariables,
} from './SearcherContainer'
import {
  Config,
  Footprint,
  createDefaultConfig,
} from './utils'
import {
  Storage,
} from './storage'

describe('useVariables', () => {
  const renderUseVariables = (...args: Parameters<typeof useVariables>) => {
    return renderHook(
      (args) => useVariables(...args),
      {initialProps: args},
    )
  }

  describe('searcherProps', () => {
    describe('enableRomajiSearch, onChangeCheckboxOfRomajiSearch', () => {
      test('it works', () => {
        const {result} = renderUseVariables(createDefaultConfig(), [], () => {})
        expect(result.current.searcherProps.enableRomajiSearch).toBe(false)
        act(() => {
          result.current.searcherProps.onChangeCheckboxOfRomajiSearch(true)
        })
        expect(result.current.searcherProps.enableRomajiSearch).toBe(true)
      })
    })
  })
})

describe('useStorageSynchronization', () => {
  const renderUseStorageSynchronization = (...args: Parameters<typeof useStorageSynchronization>) => {
    return renderHook(
      (args) => useStorageSynchronization(...args),
      {initialProps: args},
    )
  }
  let storage: Storage

  beforeEach(() => {
    storage = {
      footprintsKey: 'key',
      loadConfig: jest.fn().mockResolvedValue(createDefaultConfig()),
      saveConfig: jest.fn().mockResolvedValue(undefined),
      loadFootprints: jest.fn(),
      saveFootprints: jest.fn(),
    }
  })

  test('it does not call save methods when all args are the same', () => {
    const config = createDefaultConfig()
    const footprints: Footprint[] = []
    const {rerender} = renderUseStorageSynchronization(storage, config, footprints)
    rerender([storage, config, footprints])
    expect(storage.saveConfig).not.toHaveBeenCalled()
    expect(storage.saveFootprints).not.toHaveBeenCalled()
  })
  test('it calls save methods when `config` is different', () => {
    const config = createDefaultConfig()
    const footprints: Footprint[] = []
    const {rerender} = renderUseStorageSynchronization(storage, config, footprints)
    const newConfig: Config = {...config, enableRomajiSearch: true}
    rerender([storage, newConfig, footprints])
    expect(storage.saveConfig).toHaveBeenCalledTimes(1)
    expect(storage.saveFootprints).toHaveBeenCalledTimes(1)
  })
  test('it calls save methods when `footprints` is different', () => {
    const config = createDefaultConfig()
    const footprints: Footprint[] = []
    const {rerender} = renderUseStorageSynchronization(storage, config, footprints)
    const newFootprints: Footprint[] = [{title: '', url: ''}]
    rerender([storage, config, newFootprints])
    expect(storage.saveConfig).toHaveBeenCalledTimes(1)
    expect(storage.saveFootprints).toHaveBeenCalledTimes(1)
  })
})

describe('usePortalRoot', () => {
  const renderUsePortalRoot = (...args: Parameters<typeof usePortalRoot>) => {
    return renderHook(
      (args) => usePortalRoot(...args),
      {initialProps: args},
    )
  }

  test('it returns a ShadowRoot when `enableShadowDom` is true', () => {
    const portalDestination = document.createElement('div')
    const enableShadowDom = true
    const {result} = renderUsePortalRoot(portalDestination, enableShadowDom)
    expect(result.current).toBeInstanceOf(ShadowRoot)
  })
  test('it returns a HTMLDivElement when `enableShadowDom` is false', () => {
    const portalDestination = document.createElement('div')
    const enableShadowDom = false
    const {result} = renderUsePortalRoot(portalDestination, enableShadowDom)
    expect(result.current).toBeInstanceOf(HTMLDivElement)
  })
})

describe('SearcherContainer', () => {
  let defaultProps: Props

  beforeEach(() => {
    defaultProps = {
      storage: {
        footprintsKey: 'key',
        loadConfig: jest.fn().mockResolvedValue(createDefaultConfig()),
        saveConfig: jest.fn().mockResolvedValue(undefined),
        loadFootprints: jest.fn().mockResolvedValue([]),
        saveFootprints: jest.fn().mockResolvedValue(undefined),
      },
      config: createDefaultConfig(),
      footprints: [],
      portalDestination: document.createElement('div'),
      enableShadowDom: false,
      onClose: jest.fn(),
    }
    document.body.appendChild(defaultProps.portalDestination)
  })
  afterEach(() => {
    document.body.innerHTML = ''
  })

  test('it renders the footprints passed', () => {
    const {queryByText} = render(
      <SearcherContainer {...{
        ...defaultProps,
        footprints: [
          {
            title: 'Foo/Bar',
            url: 'https://nowhere.esa.io/posts/1',
          },
          {
            title: 'ふー/ばー',
            url: 'https://nowhere.esa.io/posts/2',
          },
        ],
      }} />,
    )
    expect(queryByText('Bar')).toBeInTheDocument()
    expect(queryByText('ばー')).toBeInTheDocument()
  })
  test('it can search the footprints', () => {
    const {queryByText, getByTestId} = render(
      <SearcherContainer {...{
        ...defaultProps,
        footprints: [
          {
            title: 'FooItem',
            url: 'https://nowhere.esa.io/posts/1',
          },
          {
            title: 'BarItem',
            url: 'https://nowhere.esa.io/posts/2',
          },
          {
            title: 'BazItem',
            url: 'https://nowhere.esa.io/posts/3',
          },
        ],
      }} />,
    )
    const input = getByTestId('recalldoc-searcher-input')
    userEvent.type(input, 'Foo')
    expect(queryByText('FooItem')).toBeInTheDocument()
    expect(queryByText('BarItem')).not.toBeInTheDocument()
    expect(queryByText('BazItem')).not.toBeInTheDocument()
    userEvent.clear(input)
    userEvent.type(input, 'Ba')
    expect(queryByText('FooItem')).not.toBeInTheDocument()
    expect(queryByText('BarItem')).toBeInTheDocument()
    expect(queryByText('BazItem')).toBeInTheDocument()
  })
  test('it calls props.onClose when the user clicks the backdrop', () => {
    const {getByTestId} = render(
      <SearcherContainer {...defaultProps} />,
    )
    userEvent.click(getByTestId('recalldoc-searcher-backdrop'))
    expect(defaultProps.onClose).toHaveBeenCalledTimes(1)
  })
  test('it calls props.onClose when the user types the ESC key', () => {
    const {getByTestId} = render(
      <SearcherContainer {...defaultProps} />,
    )
    userEvent.type(getByTestId('recalldoc-searcher-backdrop'), '{esc}')
    expect(defaultProps.onClose).toHaveBeenCalledTimes(1)
  })
})
