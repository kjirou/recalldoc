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
  onInput: (inputValue: string) => void,
  onKeyDown: (event: KeyboardEvent) => void,
}

// TODO: 最大表示件数を設定する。
// TODO: 検索キーワードがマッチしている箇所をハイライトする。
// TODO: 既存サイトのスタイルの影響を受けないようにする。
export const Searcher: VFC<Props> = (props) => {
  const searchFieldRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    searchFieldRef.current?.focus()
  }, [])

  return <div
    style={{
      width: '600px',
      position: 'fixed',
      top: '20px',
      left: 'calc(50% - 600px/2)',
      zIndex: 1,
    }}
  >
    <input
      ref={searchFieldRef}
      onInput={event => {
        props.onInput(event.currentTarget.value)
      }}
      onKeyDown={props.onKeyDown}
      style={{
        display: 'block',
        textAlign: 'right',
        width: '100%',
      }}
    />
    {
      props.footprints.length > 0 && <ul
        style={{
          border: '1px solid #cccccc',
          backgroundColor: '#ffffff',
          padding: '5px',
        }}
      >
        {
          props.footprints.map(footprint => {
            return <li
              key={ footprint.url }
              style={{
                lineHeight: '1',
                ...(footprint.highlighted ? { backgroundColor: '#ffff00' } : {}),
              }}
            >
              <a
                href={ footprint.url }
                style={{
                  fontSize: '12px',
                }}
              >{ footprint.title }</a>
            </li>
          })
        }
      </ul>
    }
  </div>
}
