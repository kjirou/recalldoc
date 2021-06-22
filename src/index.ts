import { createElement } from 'react'
import {
  unmountComponentAtNode,
  render,
} from 'react-dom'
import {
  Props as SearcherContainerProps,
  SearcherContainer,
} from './SearcherContainer'
import {
  Footprint,
  classifyPage,
  updateFootprints,
} from './utils'

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

// TODO: これも siteId がないと動かさない。
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

const pageMataData = classifyPage(document.URL)
switch (pageMataData.siteId) {
  case 'esa': {
    if (pageMataData.contentKind === 'post') {
      // NOTE: カテゴリは無いこともある。
      const categoryPathItems = Array.from(document.querySelectorAll('.post-header .category-path__item'))
        .map(e => (e.textContent || '').trim())
      const titleNameElement = document.querySelector('.post-header .post-title__name')
      if (titleNameElement) {
        const newFootprint: Footprint = {
          title: [...categoryPathItems, titleNameElement.textContent].join('/'),
          url: location.origin + location.pathname,
        }
        const footprints = loadFootprints()
        saveFootprints(updateFootprints(footprints, newFootprint))
      }
    } else if (pageMataData.contentKind === 'category') {
      const categoryPath = decodeURIComponent(location.hash.replace(/^#path=/, '')).replace(/^\//, '')
      if (categoryPath) {
        const newFootprint: Footprint = {
          title: categoryPath,
          url: location.origin + location.pathname + location.hash,
        }
        const footprints = loadFootprints()
        saveFootprints(updateFootprints(footprints, newFootprint))
      }
    }
    break
  }
  case 'kibela': {
    if (pageMataData.contentKind === 'note') {
      // TODO: HTML 要素がなかったときの対応をする。
      const pageTitle = document.querySelector('#title span')!.textContent
      // TODO: .folderIndicator の中には複数要素が含まれているので、それを現在は textContent で強引に結合している。
      // TODO: HTML 要素がなかったときの対応をする。
      const folderIndicatorLabel = document.querySelector('.folderIndicator')!.textContent
      const newFootprint = {
        title: `${folderIndicatorLabel}/${pageTitle}`,
        url: location.origin + location.pathname,
      }
      // TODO: 非同期でやっても良さそう。
      const footprints = loadFootprints()
      saveFootprints(updateFootprints(footprints, newFootprint))
    // TODO: folder の画面から他のフォルダーに遷移する上部のリンクが Ajax になっているので、その画面遷移経路だと保存できない。
    } else if (pageMataData.contentKind === 'folder') {
      const folder = decodeURIComponent(location.pathname.replace(/^\/notes\/folder\//, ''))
      const newFootprint: Footprint = {
        title: folder,
        url: location.origin + location.pathname,
      }
      const footprints = loadFootprints()
      saveFootprints(updateFootprints(footprints, newFootprint))
    }
    break
  }
}
