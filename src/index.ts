import { createElement } from 'react'
import {
  unmountComponentAtNode,
  render,
} from 'react-dom'
import {
  Footprint,
  Props as SearcherContainerProps,
  SearcherContainer,
} from './SearcherContainer'

// TODO: esa対応。
const getPageKind = (url: string): 'note' | 'folder' | 'unknown' => {
  if (/\/notes\/\d+(\?|$)/.test(url)) {
    return 'note'
  } else if (/\/notes\/folder\//.test(url)) {
    return 'folder'
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

const searcherRootElement = document.createElement('div')
searcherRootElement.style.display = 'none'
document.body.appendChild(searcherRootElement)

const renderSearcher = (props: SearcherContainerProps): void => {
  render(
    createElement(SearcherContainer, props),
    searcherRootElement,
  )
}

window.addEventListener('keydown', (event) => {
  if ((event.ctrlKey || event.metaKey) && event.shiftKey && event.key === 'l') {
    // TODO: 重さで一瞬固まるかもしれない。
    const footprints = loadFootprints()
    renderSearcher({
      footprints,
      onClose: () => {
        unmountComponentAtNode(searcherRootElement)
      },
    })
  }
})

const pageKind = getPageKind(document.URL)
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
  // TODO: 非同期でやっても良さそう。
  const footprints = loadFootprints()
  // TODO: url が存在しても保存する。title を最新にし、検索時の優先順位を最大にする。
  if (footprints.every(e => e.url !== footprint.url)) {
    saveFootprints([
      ...footprints,
      footprint,
    ])
  }
} else if (pageKind === 'folder') {
}
