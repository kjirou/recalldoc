import {
  Dispatch,
  KeyboardEvent,
  VFC,
  useCallback,
  useEffect,
  useRef,
  useState,
} from 'react'
import {
  createPortal,
} from 'react-dom'
import {
  Props as SearcherProps,
  Searcher,
} from './components/Searcher'

export type Footprint = {
  title: string;
  url: string;
}

export type Props = {
  footprints: Footprint[],
  onClose: () => void,
}

const searchFootprints = (footprints: Footprint[], inputValue: string): Footprint[] => {
  return footprints.filter(footprint => {
    // TODO: スペース区切りによる複数キーワード指定。
    return footprint.title.toUpperCase().includes(inputValue.toUpperCase())
  })
}

// TODO: 負のcursoredIndexの値を正の数へ変換する方法が雑。
const rotateIndex = (length: number, index: number): number => {
  return (length * 1000 + index) % length
}

const useVariables = (initialFootprints: Footprint[], onClose: Props['onClose']): {
  searcherProps: SearcherProps;
} => {
  const [footprints, setFootprints] = useState<Footprint[]>(initialFootprints)
  const [cursoredIndex, setCursoredIndex] = useState(0)
  const [inputValue, setInputValue] = useState('')

  const searchedFootprints = searchFootprints(footprints, inputValue)
  const cursoredFootprint = searchedFootprints[rotateIndex(searchedFootprints.length, cursoredIndex)]

  const onInput = useCallback((newInputValue: string) => {
    setInputValue(newInputValue)
    setCursoredIndex(0)
  }, [])
  const onKeyDown = useCallback((event) => {
    // TODO: キーリストの型付け方法があった気がする。
    const key: string = event.key
    const isComposing: boolean = event.nativeEvent.isComposing
    const preventDefault: () => void = () => event.preventDefault()
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

  const searcherProps: SearcherProps = {
    footprints: searchedFootprints.map((footprint) => ({
      ...footprint,
      highlighted: footprint === cursoredFootprint,
    })),
    onInput,
    onKeyDown,
  }

  return {
    searcherProps,
  }
}

const useShadowRoot = (): ShadowRoot | undefined => {
  const [shadowRoot, setShadowRoot] = useState<ShadowRoot | undefined>(undefined)
  useEffect(() => {
    const shadowContainer = document.createElement('div')
    document.body.appendChild(shadowContainer)
    const sr = shadowContainer.attachShadow({mode: 'open'})
    setShadowRoot(sr)
    return () => {
      document.body.removeChild(shadowContainer)
    }
  }, [])
  return shadowRoot
}

export const SearcherContainer: VFC<Props> = (props) => {
  const {searcherProps} = useVariables(props.footprints, props.onClose)
  const shadowRoot = useShadowRoot()
  // TODO: 少なくとも @types/react は createPortal の引数に shadowRoot を許容していない。
  //       本来の仕様としても、日本語ドキュメントを読む限りは明示的に許容はしていなさそう。 https://ja.reactjs.org/docs/portals.html
  return shadowRoot ? createPortal(<Searcher {...searcherProps}/>, shadowRoot as any) : null
}
