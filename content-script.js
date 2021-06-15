const getPageKind = (url) => {
  if (/\/notes\/\d+(\?|$)/.test(url)) {
    return 'note'
  }
  return 'unknown'
}
const loadFootprints = () => {
  const rawFootprints = window.localStorage.getItem('footprints')
  if (!rawFootprints) {
    return []
  }
  return JSON.parse(rawFootprints)
}
const saveFootprints = (footprints) => {
  const serializedFootprints = JSON.stringify(footprints)
  window.localStorage.setItem('footprints', serializedFootprints)
}

const pageKind = getPageKind(document.URL)

if (pageKind === 'note') {
  const pageTitle = document.querySelector('#title span').textContent
  // TODO: .folderIndicator の中には複数要素が含まれているので、それを現在は textContent で強引に結合している。
  const folderIndicatorLabel = document.querySelector('.folderIndicator').textContent
  const footprint = {
    title: `${folderIndicatorLabel}/${pageTitle}`,
    // TODO: Query Stringなどを落として正規化する。
    url: document.URL,
  }
  // TODO: 同じ URL を追加しない。
  const footprints = [
    ...loadFootprints(),
    footprint,
  ]
  saveFootprints(footprints)
  console.log(footprints)
}
