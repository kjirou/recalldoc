import classNames from 'classnames'
import {
  VFC,
  useEffect,
  useRef,
} from 'react'
import {
  Footprint
} from '../utils'

export type FootprintProps = {
  highlighted: boolean;
  title: Footprint['title'];
  url: Footprint['url'];
}

export type Props = {
  enableRomajiSearch: boolean,
  footprints: FootprintProps[];
  onChangeCheckboxOfRomajiSearch: (checked: boolean) => void;
  onClickDeleteButton: (url: FootprintProps['url']) => void;
  onClickPageCover: () => void;
  onInput: (inputValue: string, stopPropagation: () => void) => void;
  /**
   * @todo key へキーリストの型付けをする。どこかに定義があった記憶がある。
   */
  onKeyDown: (key: string, isComposing: boolean, stopPropagation: () => void, preventDefault: () => void) => void;
  onMount: (searchFieldElement: HTMLInputElement) => void;
  totalCount: number,
}

/**
 * NOTE: .searcher の z-index は、既存サイトの以下の要素を考慮する必要がある。
 *       - esa の上部ナビゲーションバー(nav.navbar-sub)の z-index: 3;
 *       - kibela の上部ナビゲーションバー(div.sticky-inner-wrapper)の z-index: 6;
 *         - このスタイル定義は、DOM の style 属性へ記載されている。 
 *       - kibela の記事上部のユーザーアイコン画像の枠(div.profilePopup-container)の z-index: 5;
 */
const styleLiteral = `
  * {
    margin: 0;
    padding: 0;
    box-sizing: border-box;
  }
  .searcher {
    --width: 600px;
    width: var(--width);
    position: fixed;
    top: 20px;
    left: calc(50% - var(--width)/2);
    z-index: 8;
    border: 4px solid #ddd;
  }
  .searcher__upper {
    padding: 8px;
    display: flex;
    background-color: #eee;
  }
  .searcher__searchQuery {
    display: block;
    padding: 0 4px;
    width: 40%;
    height: 24px;
    font-size: 14px;
  }
  .searcher__romajiSearch {
    margin-left: 8px;
    line-height: 24px;
  }
  .searcher__romajiSearch > label {
    margin-left: 2px;
    font-size: 14px;
    color: #666;
    cursor: pointer;
    user-select: none;
  }
  .searcher__startupKeyCombinations {
    margin-left: 8px;
    line-height: 24px;
  }
  .searcher__startupKeyCombinations > label {
    font-size: 14px;
    color: #666;
    cursor: pointer;
    user-select: none;
  }
  .searcher__startupKeyCombinations > select {
    margin-left: 4px;
  }
  .searcher__totalCount {
    flex: 1;
    margin-right: 4px;
    line-height: 24px;
    font-size: 14px;
    text-align: right;
    color: #666;
  }
  .searcher__itemList {
    list-style-type: none;
    background-color: #fff;
  }
  .searcher__itemListItem {
    min-height: 32px;
    display: flex;
    align-items: center;
    line-height: 1;
  }
  .searcher__itemListItem > :first-child {
    flex: 1;
    padding: 4px;
  }
  .searcher__itemListItem.searcher__itemListItem--highlighted {
    background-color: #ff0;
  }
  .searcher__itemListItem > :first-child > a {
    font-size: 12px;
  }
  .searcher__itemListItem > :last-child {
    width: 40px;
    text-align: center;
  }
  .searcher__itemListItem > :last-child > button {
    font-size: 12px;
  }
  .backdrop {
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    z-index: 7;
  }
`

// TODO: 検索キーワードがマッチしている箇所をハイライトする。
export const Searcher: VFC<Props> = (props) => {
  const searchFieldRef = useRef<HTMLInputElement>(null)
  const onMount = props.onMount

  // TODO: onMount が変更しただけで発火する。
  useEffect(() => {
    if (searchFieldRef.current) {
      onMount(searchFieldRef.current)
    }
  }, [onMount])

  return <>
    <style>{styleLiteral}</style>
    <div className="searcher">
      <div className="searcher__upper">
        <input
          className="searcher__searchQuery"
          ref={searchFieldRef}
          data-testid="recalldoc-searcher-input"
          placeholder="キーワード検索"
          onInput={event => {
            props.onInput(event.currentTarget.value, () => event.stopPropagation())
          }}
          onKeyDown={(event) => {
            const key: string = event.key
            const isComposing: boolean = event.nativeEvent.isComposing
            props.onKeyDown(key, isComposing, () => event.stopPropagation(), () => event.preventDefault())
          }}
        />
        <div className="searcher__romajiSearch">
          <input
            type="checkbox"
            id="recalldoc_romaji_search"
            checked={props.enableRomajiSearch}
            onChange={(event) => {
              props.onChangeCheckboxOfRomajiSearch(event.target.checked)
            }}
          />
          <label htmlFor="recalldoc_romaji_search">ローマ字検索</label>
        </div>
        <div className="searcher__startupKeyCombinations">
          <label htmlFor="recalldoc_startup_key_combinations">起動</label>
          <select id="recalldoc_startup_key_combinations">
            <option value="1">Ctrl+R</option>
            <option value="2">Ctrl|Cmd+Shift+L</option>
            <option value="99">全て</option>
          </select>
        </div>
        <div className="searcher__totalCount">{props.footprints.length}/{props.totalCount} 件</div>
      </div>
      {
        props.footprints.length > 0 && <ul className="searcher__itemList">
          {
            props.footprints.map(footprint => {
              const titlePaths = footprint.title.split('/')
              const lastPath = titlePaths[titlePaths.length - 1]
              const otherPaths = titlePaths.slice(0, titlePaths.length - 1)
              return <li
                key={ footprint.url }
                className={classNames('searcher__itemListItem', {'searcher__itemListItem--highlighted': footprint.highlighted})}
              >
                <div>
                  <a href={footprint.url}>
                    {otherPaths.length > 0 && <span>{otherPaths.join('/')}/</span>}
                    <strong>{lastPath}</strong>
                  </a>
                </div>
                <div>
                  <button onClick={() => {
                    props.onClickDeleteButton(footprint.url)
                  }}>削除</button>
                </div>
              </li>
            })
          }
        </ul>
      }
    </div>
    <div
      className="backdrop"
      data-testid="recalldoc-searcher-backdrop"
      onClick={props.onClickPageCover}
    />
  </>
}
