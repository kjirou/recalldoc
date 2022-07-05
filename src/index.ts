import { createElement } from 'react'
import { createRoot } from 'react-dom/client';
import {
  SearcherContainer,
} from './SearcherContainer'
import {
  Footprint,
  canStartupSearcher,
  classifyPage,
} from './utils'
import {
  Storage,
  createChromeStorage,
  loadConfig,
  loadFootprints,
  updateFootprint,
  updateFootprintOfEsaCategory,
  updateFootprintOfKibelaFolder,
} from './storage'

const prepareUi = (storage: Storage): void => {
  const searcherRootElement = document.createElement('div')
  searcherRootElement.style.display = 'none'
  document.body.appendChild(searcherRootElement)
  const root = createRoot(searcherRootElement)
  let isRunning = false
  window.addEventListener('keydown', async (event) => {
    if (isRunning) {
      return
    }
    isRunning = true
    const config = await loadConfig(storage)
    if (
      canStartupSearcher(
        config.startupKeyCombination,
        event.ctrlKey,
        event.metaKey,
        event.shiftKey,
        event.key,
      )
    ) {
      const footprints = await loadFootprints(storage)
      root.render(
        createElement(SearcherContainer, {
          portalDestination: document.body,
          enableShadowDom: true,
          storage,
          config,
          footprints,
          onClose: () => {
            root.unmount()
          },
        }),
      )
    }
    isRunning = false
  })
}

const pageMataData = classifyPage(document.URL)
if (pageMataData.siteId === 'esa') {
  const storage = createChromeStorage(pageMataData.siteId, pageMataData.teamId)
  prepareUi(storage)
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
  } else if (pageMataData.contentKind === 'top' || pageMataData.contentKind === 'category') {
    // NOTE: 監視対象の DOM が存在しないことがある。一方で、その時に #js_autopagerize_content は存在するので、おそらくその中を非同期で描画している。
    // TODO: 非同期の描画を待つ対応が雑。
    setTimeout(() => {
      const categoryPageObserverTarget = document.querySelector('#js_autopagerize_content')
      if (categoryPageObserverTarget) {
        const mo = new MutationObserver((mutations, observer) => {
          // NOTE: top ページから左ナビを操作して category ページへ遷移したときに、遷移先を保存している。
          const currentPageMataData = classifyPage(location.href)
          if (currentPageMataData.siteId === 'esa' && currentPageMataData.contentKind === 'category') {
            updateFootprintOfEsaCategory(storage, location.origin, location.hash)
          }
        })
        mo.observe(categoryPageObserverTarget, {
          characterData: true,
          childList: true,
          subtree: true,
        })
      }
    }, 500)
    if (pageMataData.contentKind === 'category') {
      updateFootprintOfEsaCategory(storage, location.origin, location.hash)
    }
  }
// TODO: グループを含めないと URL が一意にならなかった。
} else if (pageMataData.siteId === 'kibela') {
  const storage = createChromeStorage(pageMataData.siteId, pageMataData.teamId)
  prepareUi(storage)
  if (pageMataData.contentKind === 'note') {
    const titleElement = document.querySelector('#title span')
    // NOTE: .folderIndicator の中には複数要素が含まれていおり、それを textContent で強引に結合している。
    // TODO: 記事は複数グループの folder に所属できるため、以下のセレクタにマッチする要素は複数存在する。
    const folderIndicatorElement = document.querySelector('.folderIndicator')
    if (titleElement && folderIndicatorElement) {
      const newFootprint: Footprint = {
        title: `${folderIndicatorElement.textContent}/${titleElement.textContent}`,
        url: location.origin + location.pathname,
      }
      updateFootprint(storage, newFootprint)
    }
  // NOTE: folder 間の画面遷移は基本的に Ajax なので、その経路でも Footprint を保存できるように工夫している。
  } else if (pageMataData.contentKind === 'folderTop' || pageMataData.contentKind === 'folderOthers') {
    // NOTE: folder のパンくずリストの枠である .folder-breadcrumb の中には、各パンくずである .folder-breadcrumb-item-wrapper だけが入っている。
    //       folder の表記は full path 的であるため、変更されれば必ず要素が変化する。
    const folderPageObserverTarget = document.querySelector('[data-hypernova-key="FolderContainer"]')
    if (folderPageObserverTarget) {
      const mo = new MutationObserver((mutations, observer) => {
        // TODO: ここより後に URL が変更されるので、一拍置いてから保存している。ただ雑なので、DOM から抽出するように変更する方がより良い。
        setTimeout(() => {
          // NOTE: folder トップのページは保存しない。「すべて」と表記されているが、それが folder の階層構造からは無視されているので一意にならないため。
          //       また、既存 UI に遷移元がたくさんあるので、困らないはず。
          const currentPageMataData = classifyPage(location.href)
          if (currentPageMataData.siteId === 'kibela' && currentPageMataData.contentKind === 'folderOthers') {
            updateFootprintOfKibelaFolder(storage, location.href)
          }
        }, 500)
      })
      mo.observe(folderPageObserverTarget, {
        characterData: true,
        childList: true,
        subtree: true,
      })
    }
    if (pageMataData.contentKind === 'folderOthers') {
      updateFootprintOfKibelaFolder(storage, location.href)
    }
  }
}
