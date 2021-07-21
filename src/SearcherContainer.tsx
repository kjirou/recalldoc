import {
  VFC,
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react'
import {
  createPortal,
} from 'react-dom'
import {
  FootprintProps as SearcherFootprintProps,
  Props as SearcherProps,
  Searcher,
} from './components/Searcher'
import {
  deleteFootprint,
} from './reducers'
import {
  Storage,
} from './storage'
import {
  Footprint,
  rotateIndex,
  searchFootprints,
} from './utils'

export type Props = {
  /**
   * 描画先を Shadow DOM にするか。Shadow DOM を介すとテストが動かないので追加した。
   * @see https://github.com/kjirou/recalldoc/pull/29
   */
  enableShadowDom: boolean,
  footprints: Footprint[];
  onClose: () => void;
  portalDestination: HTMLElement,
  storage: Storage;
}

export const useVariables = (initialFootprints: Footprint[], onClose: Props['onClose']): {
  footprints: Footprint[];
  searcherProps: SearcherProps;
} => {
  const defaultCursoredIndex = 0

  const [footprints, setFootprints] = useState<Footprint[]>(initialFootprints)
  const [cursoredIndex, setCursoredIndex] = useState(defaultCursoredIndex)
  const [inputValue, setInputValue] = useState('')
  // TODO: 設定値を永続化
  const [enableRomajiSearch, setEnableRomajiSearch] = useState(false)

  const searchedFootprints = useMemo(() => searchFootprints(footprints, inputValue, enableRomajiSearch), [footprints, inputValue])
  const displayableFootprints = searchedFootprints.slice(0, 10)
  const cursoredFootprint = displayableFootprints[rotateIndex(displayableFootprints.length, cursoredIndex)]

  const onInput = useCallback<SearcherProps['onInput']>((newInputValue, stopPropagation) => {
    stopPropagation()
    setInputValue(newInputValue)
    setCursoredIndex(defaultCursoredIndex)
  }, [])
  const onKeyDown = useCallback<SearcherProps['onKeyDown']>((key, isComposing, stopPropagation, preventDefault) => {
    stopPropagation()
    if (key === 'ArrowUp' && !isComposing) {
      preventDefault()
      setCursoredIndex(s => s - 1)
    } else if (key === 'ArrowDown' && !isComposing) {
      preventDefault()
      setCursoredIndex(s => s + 1)
    } else if (key === 'Enter' && !isComposing) {
      preventDefault()
      // TODO: 画面遷移処理は useEffect へ移動する。
      if (cursoredFootprint) {
        window.location.href = cursoredFootprint.url
      }
    } else if (key === 'Escape' && !isComposing) {
      preventDefault()
      onClose()
    }
  }, [onClose, cursoredFootprint])
  const onClickDeleteButton = useCallback((url: SearcherFootprintProps['url']) => {
    const deleted = displayableFootprints.find(e => e.url === url)
    if (deleted) {
      setFootprints(deleteFootprint(deleted))
      setCursoredIndex(defaultCursoredIndex)
    } else {
      throw new Error('The deleted footprint must exist in searched footprints.')
    }
  }, [displayableFootprints])
  const onChangeButtonOfRomajiSearch = useCallback<SearcherProps['onChangeButtonOfRomajiSearch']>((checked) => {
    setEnableRomajiSearch(checked)
  }, [])
  const onMount = useCallback((searchFieldElement: HTMLInputElement) => {
    searchFieldElement.focus()
  }, [])
  const onClickPageCover = useCallback(() => {
    onClose()
  }, [onClose])

  const searcherProps: SearcherProps = {
    footprints: displayableFootprints.map((footprint) => ({
      ...footprint,
      highlighted: footprint === cursoredFootprint,
    })),
    enableRomajiSearch,
    onInput,
    onKeyDown,
    onClickDeleteButton,
    onChangeButtonOfRomajiSearch,
    onClickPageCover,
    onMount,
    totalCount: searchedFootprints.length,
  }

  return {
    footprints,
    searcherProps,
  }
}

export const useStorageSynchronization = (storage: Storage, footprints: Footprint[]): void => {
  const previousFootprints = useRef<Footprint[]>(footprints)
  useEffect(() => {
    if (footprints !== previousFootprints.current) {
      // TODO: 処理順序保証、二重実行回避。
      // TODO: ummount時のキャンセル。
      storage.saveFootprints(footprints)
      previousFootprints.current = footprints
    }
  }, [storage.saveFootprints, footprints])
}

/**
 * @todo 正常系のテストしか書いていない。引数が変わった時の処理が危ない。
 */
export const usePortalRoot = (
  portalDestination: Props['portalDestination'],
  enableShadowDom: Props['enableShadowDom'],
): HTMLDivElement | ShadowRoot | undefined => {
  const shadowHostRef = useRef<HTMLDivElement | undefined>(undefined)
  const [portalRoot, setPortalRoot] = useState<HTMLDivElement | ShadowRoot | undefined>(undefined)
  useEffect(() => {
    if (shadowHostRef.current) {
      portalDestination.removeChild(shadowHostRef.current)
      shadowHostRef.current = undefined
    }
    if (!shadowHostRef.current) {
      shadowHostRef.current = document.createElement('div')
      portalDestination.appendChild(shadowHostRef.current)
      if (enableShadowDom) {
        const shadowRoot = shadowHostRef.current.attachShadow({mode: 'open'})
        setPortalRoot(shadowRoot)
      } else {
        setPortalRoot(shadowHostRef.current)
      }
    }
    return () => {
      if (shadowHostRef.current) {
        portalDestination.removeChild(shadowHostRef.current)
      }
    }
  }, [portalDestination, enableShadowDom])
  return portalRoot
}

export const SearcherContainer: VFC<Props> = (props) => {
  const {footprints, searcherProps} = useVariables(props.footprints, props.onClose)
  useStorageSynchronization(props.storage, footprints)
  const portalRoot = usePortalRoot(props.portalDestination, props.enableShadowDom)
  // NOTE: 少なくとも @types/react は createPortal の引数に ShadowRoot を許容していない。
  //       本来の仕様としても、日本語ドキュメントを読む限りは明示的に許容はしていなさそう。 https://ja.reactjs.org/docs/portals.html
  return portalRoot ? createPortal(<Searcher {...searcherProps}/>, portalRoot as any) : null
}
