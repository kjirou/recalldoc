export type PageMetaData = {
  contentKind: 'category' | 'post' | 'unknown' | 'top';
  siteId: 'esa';
  teamId: string;
} | {
  contentKind: 'folderOthers' | 'folderTop' | 'note' | 'unknown';
  siteId: 'kibela';
  teamId: string;
} | {
  siteId: 'unknown';
}

export type Footprint = {
  /**
   * 画面のタイトル。Searcher の選択肢の表示名になる。
   * Kibela の folder のときは、グループを横断した重複は可能なので一意にならない。
   */
  title: string;
  /**
   * 画面の URL。一意。
   */
  url: string;
}

type RomajiDictionaryItem = readonly [string, string, string]

/**
 * 整数を配列の要素番号へ変換する。
 * @param index 0 を除く整数。
 */
export const rotateIndex = (length: number, index: number): number => {
  return ((index % length) + length) % length
}

export const classifyPage = (url: string): PageMetaData => {
  const {host, pathname, hash} = new URL(url)
  if (host.endsWith('.esa.io')) {
    return {
      siteId: 'esa',
      teamId: host.replace(/\.esa\.io$/, ''),
      contentKind: /^\/posts\/\d+$/.test(pathname)
          ? 'post'
          : pathname === '/' && hash.startsWith('#path=')
            ? 'category'
            : pathname === '/' && hash === ''
              ? 'top'
              : 'unknown'
    }
  } else if (host.endsWith('.kibe.la')) {
    return {
      siteId: 'kibela',
      teamId: host.replace(/\.kibe\.la$/, ''),
      contentKind: /^\/notes\/\d+$/.test(pathname)
        ? 'note'
        : pathname === '/notes/folder'
          ? 'folderTop'
          : pathname.startsWith('/notes/folder/')
            ? 'folderOthers'
            : 'unknown'
    }
  } else {
    return {
      siteId: 'unknown',
    }
  }
}

export const splitSearchQueryIntoMultipulKeywords = (query: string): string[] => {
  return query.split(/[ \u3000]+/).filter(e => e !== '')
}

/**
 * @see https://developer.mozilla.org/en-US/docs/Web/JavaScript/Guide/Regular_Expressions#escaping
 */
const escapeRegExp = (str: string): string => {
  return str.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
}

/**
 * ひらがな文字をカタカナ文字へ変換する。
 * 
 * 渡せることを想定しているひらがなは、以下の範囲）
 * - http://www.unicode.org/charts/PDF/U3040.pdf の 3041-3094, 309D, 309E 。
 * - 正規表現にすると /[ぁ-ゔゝゞ]/ の範囲。
 * 
 * それらを以下のカタカナへ変換する）
 * - http://www.unicode.org/charts/PDF/U30A0.pdf の 30A0-30F4, 30FD, 30FE 。
 * - 正規表現にすると /[ァ-ヴヽヾ]/ の範囲。
 */
export const convertHiraganaToKatakana = (text: string): string => {
  let result = ''
  let pointer = 0
  let codePoint: number | undefined
  while (codePoint = text.codePointAt(pointer)) {
    if (codePoint === undefined) {
      break
    } else if (
      codePoint < 12353 ||
      codePoint > 12436 && codePoint !== 12445 && codePoint !== 12446
    ) {
      throw new Error('Can not convert the code point to a katakana.')
    }
    result += String.fromCodePoint(codePoint + 96)
    pointer++
  }
  return result
}

const hiraWithKata = (hiragana: string): [string, string] => {
  return [hiragana, convertHiraganaToKatakana(hiragana)]
}

const romajiDictionary: Readonly<RomajiDictionaryItem[]> = [
  //
  // 1 文字
  //
  ['a', ...hiraWithKata('あ')],
  ['i', ...hiraWithKata('い')],
  ['u', ...hiraWithKata('う')],
  ['e', ...hiraWithKata('え')],
  ['o', ...hiraWithKata('お')],
  ['n', ...hiraWithKata('ん')],

  //
  // 2 文字
  //
  ['la', ...hiraWithKata('ぁ')],
  ['li', ...hiraWithKata('ぃ')],
  ['lu', ...hiraWithKata('ぅ')],
  ['le', ...hiraWithKata('ぇ')],
  ['lo', ...hiraWithKata('ぉ')],
  ['xa', ...hiraWithKata('ぁ')],
  ['xi', ...hiraWithKata('ぃ')],
  ['xu', ...hiraWithKata('ぅ')],
  ['xe', ...hiraWithKata('ぇ')],
  ['xo', ...hiraWithKata('ぉ')],
  ['va', ...hiraWithKata('ゔぁ')],
  ['vi', ...hiraWithKata('ゔぃ')],
  ['vu', ...hiraWithKata('ゔ')],
  ['ve', ...hiraWithKata('ゔぇ')],
  ['vo', ...hiraWithKata('ゔぉ')],
  ['ka', ...hiraWithKata('か')],
  ['ki', ...hiraWithKata('き')],
  ['ku', ...hiraWithKata('く')],
  ['ke', ...hiraWithKata('け')],
  ['ko', ...hiraWithKata('こ')],
  ['qa', ...hiraWithKata('くぁ')],
  ['qi', ...hiraWithKata('くぃ')],
  ['qu', ...hiraWithKata('くぅ')],
  ['qe', ...hiraWithKata('くぇ')],
  ['qo', ...hiraWithKata('くぉ')],
  ['ga', ...hiraWithKata('が')],
  ['gi', ...hiraWithKata('ぎ')],
  ['gu', ...hiraWithKata('ぐ')],
  ['ge', ...hiraWithKata('げ')],
  ['go', ...hiraWithKata('ご')],
  ['sa', ...hiraWithKata('さ')],
  ['si', ...hiraWithKata('し')],
  ['su', ...hiraWithKata('す')],
  ['se', ...hiraWithKata('せ')],
  ['so', ...hiraWithKata('そ')],
  ['za', ...hiraWithKata('ざ')],
  ['zi', ...hiraWithKata('じ')],
  ['zu', ...hiraWithKata('ず')],
  ['ze', ...hiraWithKata('ぜ')],
  ['zo', ...hiraWithKata('ぞ')],
  ['ja', ...hiraWithKata('じゃ')],
  ['ji', ...hiraWithKata('じ')],
  ['ju', ...hiraWithKata('じゅ')],
  ['je', ...hiraWithKata('じぇ')],
  ['jo', ...hiraWithKata('じょ')],
  ['ta', ...hiraWithKata('た')],
  ['ti', ...hiraWithKata('ち')],
  ['tu', ...hiraWithKata('つ')],
  ['te', ...hiraWithKata('て')],
  ['to', ...hiraWithKata('と')],
  ['da', ...hiraWithKata('だ')],
  ['di', ...hiraWithKata('ぢ')],
  ['du', ...hiraWithKata('づ')],
  ['de', ...hiraWithKata('で')],
  ['do', ...hiraWithKata('ど')],
  ['na', ...hiraWithKata('な')],
  ['ni', ...hiraWithKata('に')],
  ['nu', ...hiraWithKata('ぬ')],
  ['ne', ...hiraWithKata('ね')],
  ['no', ...hiraWithKata('の')],
  ['ha', ...hiraWithKata('は')],
  ['hi', ...hiraWithKata('ひ')],
  ['hu', ...hiraWithKata('ふ')],
  ['he', ...hiraWithKata('へ')],
  ['ho', ...hiraWithKata('ほ')],
  ['fa', ...hiraWithKata('ふぁ')],
  ['fi', ...hiraWithKata('ふぃ')],
  ['fu', ...hiraWithKata('ふ')],
  ['fe', ...hiraWithKata('ふぇ')],
  ['fo', ...hiraWithKata('ふぉ')],
  ['ba', ...hiraWithKata('ば')],
  ['bi', ...hiraWithKata('び')],
  ['bu', ...hiraWithKata('ぶ')],
  ['be', ...hiraWithKata('べ')],
  ['bo', ...hiraWithKata('ぼ')],
  ['pa', ...hiraWithKata('ぱ')],
  ['pi', ...hiraWithKata('ぴ')],
  ['pu', ...hiraWithKata('ぷ')],
  ['pe', ...hiraWithKata('ぺ')],
  ['po', ...hiraWithKata('ぽ')],
  ['ma', ...hiraWithKata('ま')],
  ['mi', ...hiraWithKata('み')],
  ['mu', ...hiraWithKata('む')],
  ['me', ...hiraWithKata('め')],
  ['mo', ...hiraWithKata('も')],
  ['ya', ...hiraWithKata('や')],
  ['yu', ...hiraWithKata('ゆ')],
  ['ye', ...hiraWithKata('いぇ')],
  ['yo', ...hiraWithKata('よ')],
  ['wa', ...hiraWithKata('わ')],
  ['wi', ...hiraWithKata('うぃ')],
  ['wu', ...hiraWithKata('う')],
  ['we', ...hiraWithKata('うぇ')],
  ['wo', ...hiraWithKata('を')],
  ['nn', ...hiraWithKata('ん')],

  //
  // 3 文字
  //
  ['vya', ...hiraWithKata('ゔゃ')],
  ['vyu', ...hiraWithKata('ゔゅ')],
  ['vye', ...hiraWithKata('ゔょ')],
  ['kya', ...hiraWithKata('きゃ')],
  ['kyi', ...hiraWithKata('きぃ')],
  ['kyu', ...hiraWithKata('きゅ')],
  ['kye', ...hiraWithKata('きぇ')],
  ['kyo', ...hiraWithKata('きょ')],
  ['gya', ...hiraWithKata('ぎゃ')],
  ['gyi', ...hiraWithKata('ぎぃ')],
  ['gyu', ...hiraWithKata('ぎゅ')],
  ['gye', ...hiraWithKata('ぎぇ')],
  ['gyo', ...hiraWithKata('ぎょ')],
  ['qya', ...hiraWithKata('くゃ')],
  ['qyi', ...hiraWithKata('くぃ')],
  ['qyu', ...hiraWithKata('くゅ')],
  ['qye', ...hiraWithKata('くぇ')],
  ['qyo', ...hiraWithKata('くょ')],
  ['sya', ...hiraWithKata('しゃ')],
  ['syi', ...hiraWithKata('しぃ')],
  ['syu', ...hiraWithKata('しゅ')],
  ['sye', ...hiraWithKata('しぇ')],
  ['syo', ...hiraWithKata('しょ')],
  ['sha', ...hiraWithKata('しゃ')],
  ['shi', ...hiraWithKata('し')],
  ['shu', ...hiraWithKata('しゅ')],
  ['she', ...hiraWithKata('しぇ')],
  ['sho', ...hiraWithKata('しょ')],
  ['jya', ...hiraWithKata('じゃ')],
  ['jyi', ...hiraWithKata('じぃ')],
  ['jyu', ...hiraWithKata('じゅ')],
  ['jye', ...hiraWithKata('じぇ')],
  ['jyo', ...hiraWithKata('じょ')],
  ['zya', ...hiraWithKata('じゃ')],
  ['zyi', ...hiraWithKata('じぃ')],
  ['zyu', ...hiraWithKata('じゅ')],
  ['zye', ...hiraWithKata('じぇ')],
  ['zyo', ...hiraWithKata('じょ')],
  ['tya', ...hiraWithKata('ちゃ')],
  ['tyi', ...hiraWithKata('ちぃ')],
  ['tyu', ...hiraWithKata('ちゅ')],
  ['tye', ...hiraWithKata('ちぇ')],
  ['tyo', ...hiraWithKata('ちょ')],
  ['cya', ...hiraWithKata('ちゃ')],
  ['cyi', ...hiraWithKata('ちぃ')],
  ['cyu', ...hiraWithKata('ちゅ')],
  ['cye', ...hiraWithKata('ちぇ')],
  ['cyo', ...hiraWithKata('ちょ')],
  ['cha', ...hiraWithKata('ちゃ')],
  ['chi', ...hiraWithKata('ち')],
  ['chu', ...hiraWithKata('ちゅ')],
  ['che', ...hiraWithKata('ちぇ')],
  ['cho', ...hiraWithKata('ちょ')],
  ['dya', ...hiraWithKata('ぢゃ')],
  ['dyi', ...hiraWithKata('ぢぃ')],
  ['dyu', ...hiraWithKata('ぢゅ')],
  ['dye', ...hiraWithKata('ぢぇ')],
  ['dyo', ...hiraWithKata('ぢょ')],
  ['tsu', ...hiraWithKata('つ')],
  ['nya', ...hiraWithKata('にゃ')],
  ['nyi', ...hiraWithKata('にぃ')],
  ['nyu', ...hiraWithKata('にゅ')],
  ['nye', ...hiraWithKata('にぇ')],
  ['nyo', ...hiraWithKata('にょ')],
  ['bya', ...hiraWithKata('びゃ')],
  ['byi', ...hiraWithKata('びぃ')],
  ['byu', ...hiraWithKata('びゅ')],
  ['bye', ...hiraWithKata('びぇ')],
  ['byo', ...hiraWithKata('びょ')],
  ['fya', ...hiraWithKata('ふゃ')],
  ['fyi', ...hiraWithKata('ふぃ')],
  ['fyu', ...hiraWithKata('ふゅ')],
  ['fye', ...hiraWithKata('ふぇ')],
  ['fyo', ...hiraWithKata('ふょ')],
  ['hya', ...hiraWithKata('ひゃ')],
  ['hyi', ...hiraWithKata('ひぃ')],
  ['hyu', ...hiraWithKata('ひゅ')],
  ['hye', ...hiraWithKata('ひぇ')],
  ['hyo', ...hiraWithKata('ひょ')],
  ['pya', ...hiraWithKata('ぴゃ')],
  ['pyi', ...hiraWithKata('ぴぃ')],
  ['pyu', ...hiraWithKata('ぴゅ')],
  ['pye', ...hiraWithKata('ぴぇ')],
  ['pyo', ...hiraWithKata('ぴょ')],
  ['mya', ...hiraWithKata('みゃ')],
  ['myi', ...hiraWithKata('みぃ')],
  ['myu', ...hiraWithKata('みゅ')],
  ['mye', ...hiraWithKata('みぇ')],
  ['myo', ...hiraWithKata('みょ')],
  ['rya', ...hiraWithKata('りゃ')],
  ['ryi', ...hiraWithKata('りぃ')],
  ['ryu', ...hiraWithKata('りゅ')],
  ['rye', ...hiraWithKata('りぇ')],
  ['ryo', ...hiraWithKata('りょ')],
]
const indexedRomajiDictionary = romajiDictionary.reduce<{[k in string]: RomajiDictionaryItem}>(
  (acc, item) => {
    acc[item[0]] = item
    return acc
  },
  {},
)

if (Object.keys(indexedRomajiDictionary).length !== romajiDictionary.length) {
  throw new Error('Romaji is duplicated.')
}

export const createRomajiSearchRegexp = (keyword: string): string => {
  const createRomajiPattern = (romajiDictionaryItem: RomajiDictionaryItem): string =>
    `(?:${romajiDictionaryItem.map(escapeRegExp).join('|')})`
  let pointer = 0
  let result = ''
  let firstCharacter: string | undefined = undefined
  while (firstCharacter = keyword[pointer]) {
    if (firstCharacter === undefined) {
      break
    }
    let phrase = firstCharacter
    if (keyword[pointer + 1]) {
      phrase += keyword[pointer + 1]
    }
    if (keyword[pointer + 2]) {
      phrase += keyword[pointer + 2]
    }
    let replaced = false
    for (let phraseLength = 3; phraseLength >= 1; phraseLength--) {
      const replacement = indexedRomajiDictionary[phrase.slice(0, phraseLength)]
      if (replacement) {
        result += createRomajiPattern(replacement)
        pointer += phraseLength
        replaced = true
        break
      }
    }
    if (replaced) {
      continue
    }
    result += escapeRegExp(firstCharacter)
    pointer++
  }
  return result
}

export const searchFootprints = (footprints: Footprint[], searchQuery: string): Footprint[] => {
  const keywordMatchers = splitSearchQueryIntoMultipulKeywords(searchQuery)
    .map(e => new RegExp(escapeRegExp(e), 'i'))
  if (keywordMatchers.length === 0) {
    return footprints
  }
  return footprints.filter(footprint => {
    return keywordMatchers.some(e => e.test(footprint.title))
  })
}
