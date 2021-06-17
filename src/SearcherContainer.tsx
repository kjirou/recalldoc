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
    if (event.key === 'ArrowUp') {
      event.preventDefault()
      setCursoredIndex(s => s - 1)
    } else if (event.key === 'ArrowDown') {
      event.preventDefault()
      setCursoredIndex(s => s + 1)
    // TODO: IMEの変換決定でここが動いてしまう。
    } else if (event.key === 'Enter') {
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

export const SearcherContainer: VFC<Props> = (props) => {
  const {searcherProps} = useVariables(props.footprints)
  // TODO: document.body への参照が雑。
  return createPortal(<Searcher {...searcherProps}/>, document.body)
}
