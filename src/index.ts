import { createElement } from 'react'
import {
  unmountComponentAtNode,
  render,
} from 'react-dom'
import {
  SearcherContainer,
} from './SearcherContainer'
import {
  Footprint,
  classifyPage,
} from './utils'
import {
  getStorage,
  updateFootprint,
  updateFootprintOfEsaCategory,
  updateFootprintOfKibelaFolder,
} from './storage'

const storage = getStorage()

const prepareUi = (): void => {
  const searcherRootElement = document.createElement('div')
  searcherRootElement.style.display = 'none'
  document.body.appendChild(searcherRootElement)
  window.addEventListener('keydown', async (event) => {
    if ((event.ctrlKey || event.metaKey) && event.shiftKey && event.key === 'l') {
      // TODO: 二重実行の回避。
      const footprints = await storage.loadFootprints()
      render(
        createElement(SearcherContainer, {
          storage,
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
        updateFootprint(storage, newFootprint)
      }
    // NOTE: category 間の画面遷移は基本的に Ajax なので、その経路でも Footprint を保存できるように工夫している。
    } else if (pageMataData.contentKind === 'category') {
      // NOTE: 監視対象の DOM が存在しないことがある。一方で、その時に #js_autopagerize_content は存在するので、おそらくその中を非同期で描画している。
      // TODO: 非同期の描画を待つ対応が雑。
      setTimeout(() => {
        const categoryPageObserverTarget = document.querySelector('.category-heading .category-path')
        if (categoryPageObserverTarget) {
          const mo = new MutationObserver((mutations, observer) => {
            updateFootprintOfEsaCategory(storage, location.origin, location.hash)
          })
          mo.observe(categoryPageObserverTarget, {
            characterData: true,
            childList: true,
            subtree: true,
          })
        }
      }, 500)
      updateFootprintOfEsaCategory(storage, location.origin, location.hash)
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
        updateFootprint(storage, newFootprint)
      }
    // NOTE: folder 間の画面遷移は基本的に Ajax なので、その経路でも Footprint を保存できるように工夫している。
    } else if (pageMataData.contentKind === 'folder') {
      // NOTE: folder のパンくずリストの枠である .folder-breadcrumb の中には、各パンくずである .folder-breadcrumb-item-wrapper だけが入っている。
      //       folder の表記は full path 的であるため、変更されれば必ず要素が変化する。
      const folderPageObserverTarget = document.querySelector('[data-hypernova-key="FolderContainer"] .folder-breadcrumb')
      if (folderPageObserverTarget) {
        const mo = new MutationObserver((mutations, observer) => {
          // TODO: ここより後に URL が変更されるので、一拍置いてから保存している。ただ雑なので、DOM から抽出するように変更する方がより良い。
          setTimeout(() => {
            updateFootprintOfKibelaFolder(storage, location.origin, location.pathname)
          }, 100)
        })
        mo.observe(folderPageObserverTarget, {
          characterData: true,
          childList: true,
          subtree: true,
        })
      }
      updateFootprintOfKibelaFolder(storage, location.origin, location.pathname)
    }
    break
  }
}
