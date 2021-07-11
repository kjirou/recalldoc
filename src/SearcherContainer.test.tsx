import {
  getByText,
  render,
} from '@testing-library/react'
import {
  renderHook,
} from '@testing-library/react-hooks'
import userEvent from '@testing-library/user-event'
import {
  Props,
  SearcherContainer,
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

describe('SearcherContainer', () => {
  let defaultProps: Props

  beforeEach(() => {
    defaultProps = {
      storage: {
        loadFootprints: jest.fn().mockResolvedValue([]),
        saveFootprints: jest.fn().mockResolvedValue(undefined),
      },
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
    expect(queryByText('Foo/Bar')).toBeInTheDocument()
    expect(queryByText('ふー/ばー')).toBeInTheDocument()
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
