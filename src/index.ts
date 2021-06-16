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

const renderSearcher = (state: State, itemList: HTMLUListElement): void => {
  const searchedFootprints = searchFootprints(state.footprints, state.inputValue)
  const actualCursoredIndex = rotateIndex(searchedFootprints.length, state.cursoredIndex)
  itemList.innerHTML = ''
  // TODO: マッチしている箇所をハイライトする。
  // TODO: 全件出力してしまう。
  for (const [index, footprint] of searchedFootprints.entries()) {
    const itemLi = document.createElement('li')
    itemLi.style.lineHeight = '1'
    if (index === actualCursoredIndex) {
      itemLi.style.backgroundColor = '#ffff00'
    }
    const itemAnchor = document.createElement('a')
    itemAnchor.textContent = footprint.title
    itemAnchor.href = footprint.url
    itemAnchor.style.fontSize = '12px'
    itemLi.appendChild(itemAnchor)
    itemList.appendChild(itemLi)
  }
}

const initializeSearcher = (footprints: Footprint[]): void => {
  const container = document.createElement('div')
  container.classList.add('recalldoc-searcher')
  container.style.position = 'fixed'
  container.style.width = '600px'
  container.style.top = '20px'
  container.style.left = 'calc(50% - 600px/2)'
  container.style.zIndex = '1'
  const itemList = document.createElement('ul')
  itemList.style.padding = '5px'
  itemList.style.border = '1px solid #cccccc'
  itemList.style.backgroundColor = '#ffffff'
  const searchField: HTMLInputElement = document.createElement('input')
  searchField.style.display = 'block'
  searchField.style.width = '100%'
  searchField.style.textAlign = 'right'
  let state: State = {
    cursoredIndex: 0,
    inputValue: '',
    footprints,
  }
  searchField.addEventListener('input', (event) => {
    state = {
      ...state,
      // TODO: 型が雑だけど、Reactにするときにどうせ変わるはず。
      // TODO: event.currentTarget でも searchField: HTMLInputElement の型を引き継げないのはなぜ？
      inputValue: (event.currentTarget as HTMLInputElement).value,
      cursoredIndex: 0,
    }
    renderSearcher(state, itemList)
  })
  searchField.addEventListener('keydown', (event) => {
    if (event.key === 'ArrowUp') {
      event.preventDefault()
      state = {
        ...state,
        cursoredIndex: state.cursoredIndex - 1,
      }
      renderSearcher(state, itemList)
    } else if (event.key === 'ArrowDown') {
      event.preventDefault()
      state = {
        ...state,
        cursoredIndex: state.cursoredIndex + 1,
      }
      renderSearcher(state, itemList)
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
  container.appendChild(searchField)
  container.appendChild(itemList)
  document.body.appendChild(container)
  searchField.focus()
}

const pageKind = getPageKind(document.URL)
// TODO: 全画面でデータを読み込んでいる。
const footprints = loadFootprints()

window.addEventListener('keydown', (event) => {
  if (
      (event.ctrlKey || event.metaKey) && event.shiftKey && event.key === 'l' &&
      !document.querySelector('.recalldoc-searcher')
  ) {
    initializeSearcher(footprints)
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
