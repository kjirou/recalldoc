import classNames from 'classnames'
import {
  KeyboardEvent,
  VFC,
  useEffect,
  useRef,
} from 'react'

type FootprintProps = {
  highlighted: boolean;
  title: string;
  url: string;
}

export type Props = {
  footprints: FootprintProps[];
  onInput: (inputValue: string) => void;
  onKeyDown: (event: KeyboardEvent) => void;
  onMount: (searchFieldElement: HTMLInputElement) => void;
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
    z-index: 7;
  }
  .searcher__searchQuery {
    display: block;
    padding: 0 4px;
    width: 40%;
    height: 24px;
    font-size: 14px;
  }
  .searcher__itemList {
    border: 1px solid #ccc;
    list-style-type: none;
    background-color: #fff;
  }
  .searcher__itemListItem {
    min-height: 28px;
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
`

// TODO: 最大表示件数を設定する。
// TODO: 検索キーワードがマッチしている箇所をハイライトする。
export const Searcher: VFC<Props> = (props) => {
  const searchFieldRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    if (searchFieldRef.current) {
      props.onMount(searchFieldRef.current)
    }
  }, [props, props.onMount])

  return <>
    <style>{styleLiteral}</style>
    <div className="searcher">
      <input
        className="searcher__searchQuery"
        ref={searchFieldRef}
        placeholder="キーワード検索"
        onInput={event => {
          props.onInput(event.currentTarget.value)
        }}
        onKeyDown={props.onKeyDown}
      />
      {
        props.footprints.length > 0 && <ul className="searcher__itemList">
          {
            props.footprints.map(footprint => {
              return <li
                key={ footprint.url }
                className={classNames('searcher__itemListItem', {'searcher__itemListItem--highlighted': footprint.highlighted})}
              >
                <div>
                  <a
                    href={ footprint.url }
                  >{ footprint.title }</a>
                </div>
                <div>
                  <button>削除</button>
                </div>
              </li>
            })
          }
        </ul>
      }
    </div>
  </>
}
