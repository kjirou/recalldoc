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

const prepareUi = (): void => {
  const searcherRootElement = document.createElement('div')
  searcherRootElement.style.display = 'none'
  document.body.appendChild(searcherRootElement)
  window.addEventListener('keydown', (event) => {
    if ((event.ctrlKey || event.metaKey) && event.shiftKey && event.key === 'l') {
      // TODO: 重さで一瞬固まるかもしれない。
      const footprints = loadFootprints()
      render(
        createElement(SearcherContainer, {
          footprints,
          onClose: () => {
            unmountComponentAtNode(searcherRootElement)
          },
        }),
        searcherRootElement,
      )
    }
  })
}

const pageMataData = classifyPage(document.URL)
switch (pageMataData.siteId) {
  case 'esa': {
    prepareUi()
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
    // TODO: 左ナビからのカテゴリ画面への遷移は Ajax なので、その画面遷移経路だとここの分岐を通らず保存されない。
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
    prepareUi()
    if (pageMataData.contentKind === 'note') {
      const titleElement = document.querySelector('#title span')
      // NOTE: .folderIndicator の中には複数要素が含まれていおり、それを textContent で強引に結合している。
      const folderIndicatorElement = document.querySelector('.folderIndicator')
      if (titleElement && folderIndicatorElement) {
        const newFootprint: Footprint = {
          title: `${folderIndicatorElement.textContent}/${titleElement.textContent}`,
          url: location.origin + location.pathname,
        }
        // TODO: 非同期でやっても良さそう。
        const footprints = loadFootprints()
        saveFootprints(updateFootprints(footprints, newFootprint))
      }
    // TODO: folder の画面から他のフォルダーに遷移する上部のリンクが Ajax になっているので、その画面遷移経路だとここの分岐を通らず保存されない。
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
