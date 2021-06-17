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

const useVariables = (initialFootprints: Footprint[]): {
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
    const isComposing: boolean = !event.nativeEvent.isComposing
    if (event.key === 'ArrowUp' && !isComposing) {
      event.preventDefault()
      setCursoredIndex(s => s - 1)
    } else if (event.key === 'ArrowDown' && !isComposing) {
      event.preventDefault()
      setCursoredIndex(s => s + 1)
    } else if (event.key === 'Enter' && !isComposing) {
      event.preventDefault()
      // TODO: 画面遷移処理は useEffect へ移動する。
      if (cursoredFootprint) {
        window.location.href = cursoredFootprint.url
      }
    }
  }, [cursoredFootprint])

  const searcherProps: SearcherProps = {
    footprints: searchedFootprints.map((footprint) => ({
      ...footprint,
      highlighted: footprint === cursoredFootprint,
    })),
    onInput,
    // TODO: ESCキーで Searcher を閉じる。
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
  const {searcherProps} = useVariables(props.footprints)
  const shadowRoot = useShadowRoot()
  // TODO: 少なくとも @types/react は createPortal の引数に shadowRoot を許容していない。
  //       本来の仕様としても、日本語ドキュメントを読む限りは明示的に許容はしていなさそう。 https://ja.reactjs.org/docs/portals.html
  return shadowRoot ? createPortal(<Searcher {...searcherProps}/>, shadowRoot as any) : null
}