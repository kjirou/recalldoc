import { createElement } from 'react'
import { createPortal, render } from 'react-dom'
import {
  FootprintProps as SearcherFootprintProps,
  Props as SearcherProps,
  Searcher,
} from './components/Searcher'

type Footprint = {
  title: string;
  url: string;
}

type State = {
  cursoredIndex: number;
  footprints: Footprint[];
  inputValue: string;
}

const getPageKind = (url: string): 'note' | 'unknown' => {
  if (/\/notes\/\d+(\?|$)/.test(url)) {
    return 'note'
  }
  return 'unknown'
}

const loadFootprints = (): Footprint[] => {
  const rawFootprints = window.localStorage.getItem('recalldoc_footprints')
  if (!rawFootprints) {
    return []
  }
  return JSON.parse(rawFootprints)
}

// TODO: 保存する件数に上限を設ける。
const saveFootprints = (footprints: Footprint[]): void => {
  const serializedFootprints = JSON.stringify(footprints)
  // TODO: 開発者モードだからか、普通に kibe.la の localStorage として保存されている。
  window.localStorage.setItem('recalldoc_footprints', serializedFootprints)
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

const pageKind = getPageKind(document.URL)
// TODO: 全画面でデータを読み込んでいる。
const footprints = loadFootprints()
let state: State = {
  cursoredIndex: 0,
  inputValue: '',
  footprints,
}
const searcherRootElement = document.createElement('div')
searcherRootElement.style.display = 'none'
document.body.appendChild(searcherRootElement)

const renderSearcher = (props: SearcherProps): void => {
  render(
    createPortal(
      createElement(Searcher, props),
      document.body,
    ),
    searcherRootElement,
  )
}

const generateSearcherProps = (state: State): SearcherProps => {
  const searchedFootprints = searchFootprints(state.footprints, state.inputValue)
  const actualCursoredIndex = rotateIndex(searchedFootprints.length, state.cursoredIndex)
  return {
    footprints: searchedFootprints.map((footprint, index) => ({
      ...footprint,
      highlighted: index === actualCursoredIndex,
    })),
    onInput: ((inputValue: string) => {
      state = {
        ...state,
        inputValue,
        cursoredIndex: 0,
      }
      renderSearcher(generateSearcherProps(state))
    }),
    // TODO: ESCキーで Searcher を閉じる。
    onKeyDown: ((event) => {
      if (event.key === 'ArrowUp') {
        event.preventDefault()
        state = {
          ...state,
          cursoredIndex: state.cursoredIndex - 1,
        }
        renderSearcher(generateSearcherProps(state))
      } else if (event.key === 'ArrowDown') {
        event.preventDefault()
        state = {
          ...state,
          cursoredIndex: state.cursoredIndex + 1,
        }
        renderSearcher(generateSearcherProps(state))
      // TODO: IMEの変換決定でここが動いてしまう。
      } else if (event.key === 'Enter') {
        event.preventDefault()
        const searchedFootprints = searchFootprints(state.footprints, state.inputValue)
        const cursoredFootprint = searchedFootprints[rotateIndex(searchedFootprints.length, state.cursoredIndex)]
        if (cursoredFootprint) {
          window.location.href = cursoredFootprint.url
        }
      }
    })
  }
}

window.addEventListener('keydown', (event) => {
  if ((event.ctrlKey || event.metaKey) && event.shiftKey && event.key === 'l') {
    renderSearcher(generateSearcherProps(state))
  }
})

// TODO: ディレクトリのページも検索対象に含める。
if (pageKind === 'note') {
  // TODO: HTML 要素がなかったときの対応をする。
  const pageTitle = document.querySelector('#title span')!.textContent
  // TODO: .folderIndicator の中には複数要素が含まれているので、それを現在は textContent で強引に結合している。
  // TODO: HTML 要素がなかったときの対応をする。
  const folderIndicatorLabel = document.querySelector('.folderIndicator')!.textContent
  const footprint = {
    title: `${folderIndicatorLabel}/${pageTitle}`,
    // TODO: Query Stringなどを落として正規化する。
    url: document.URL,
  }
  if (footprints.every(e => e.url !== footprint.url)) {
    saveFootprints([
      ...footprints,
      footprint,
    ])
  }
}
