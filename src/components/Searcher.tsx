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
 * NOTE: .searcher の z-index は、esa の上部バー(nav.navbar-sub)の z-index: 3; より高くする必要がある。
 */
const styleLiteral = `
  * {
    margin: 0;
    padding: 0;
  }
  .searcher {
    --width: 600px;
    width: var(--width);
    position: fixed;
    top: 20px;
    left: calc(50% - var(--width)/2);
    z-index: 4;
  }
  input.searcher__searchQuery {
    display: block;
    padding: 0 4px;
    width: 40%;
    height: 24px;
    font-size: 14px;
  }
  ul.searcher__itemList {
    padding: 4px;
    border: 1px solid #ccc;
    list-style-type: none;
    background-color: #fff;
  }
  ul.searcher__itemList > li {
    line-height: 1;
  }
  ul.searcher__itemList > li:nth-child(n+2) {
    margin-top: 4px;
  }
  ul.searcher__itemList > li.highlighted {
    background-color: #ff0;
  }
  ul.searcher__itemList > li > a {
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
                className={footprint.highlighted ? 'highlighted' : undefined}
              >
                <a
                  href={ footprint.url }
                >{ footprint.title }</a>
              </li>
            })
          }
        </ul>
      }
    </div>
  </>
}
