import {
  Footprint,
  PageMetaData,
  adjustOldFootprints,
  classifyPage,
  canStartupSearcher,
  rotateIndex,
  searchFootprints,
  splitSearchQueryIntoMultipulKeywords,
} from "./utils";

describe("rotateIndex", () => {
  const table: {
    expected: number;
    index: number;
    length: number;
  }[] = [
    {
      length: 1,
      index: 0,
      expected: 0,
    },
    {
      length: 3,
      index: 4,
      expected: 1,
    },
    {
      length: 3,
      index: -1,
      expected: 2,
    },
  ];
  test.each(table)(
    `($length, $index) -> $expected`,
    ({ length, index, expected }) => {
      expect(rotateIndex(length, index)).toBe(expected);
    }
  );
});
describe("classifyPage", () => {
  const table: {
    expected: PageMetaData;
    url: string;
  }[] = [
    {
      url: "https://foo.esa.io/posts/123",
      expected: { siteId: "esa", contentKind: "post", teamId: "foo" },
    },
    {
      url: "https://foo.esa.io/#path=%2FUsers",
      expected: { siteId: "esa", contentKind: "category", teamId: "foo" },
    },
    {
      url: "https://foo.esa.io/",
      expected: { siteId: "esa", contentKind: "top", teamId: "foo" },
    },
    {
      url: "https://foo.esa.io/posts/123/edit",
      expected: { siteId: "esa", contentKind: "unknown", teamId: "foo" },
    },
    {
      url: "https://foo.kibe.la/notes/123",
      expected: { siteId: "kibela", contentKind: "note", teamId: "foo" },
    },
    {
      url: "https://foo.kibe.la/notes/folder/Bar?group_id=1&order_by=title",
      expected: {
        siteId: "kibela",
        contentKind: "folderOthers",
        teamId: "foo",
      },
    },
    {
      url: "https://foo.kibe.la/notes/folder?order_by=title&group_id=1",
      expected: { siteId: "kibela", contentKind: "folderTop", teamId: "foo" },
    },
    {
      url: "https://foo.kibe.la/notes/123/edit",
      expected: { siteId: "kibela", contentKind: "unknown", teamId: "foo" },
    },
    {
      url: "https://esa.io",
      expected: { siteId: "unknown" },
    },
    {
      url: "https://kibe.la",
      expected: { siteId: "unknown" },
    },
  ];
  test.each(table)(`$url -> $expected`, ({ url, expected }) => {
    expect(classifyPage(url)).toStrictEqual(expected);
  });
});
describe("canStartupSearcher", () => {
  const table: {
    args: Parameters<typeof canStartupSearcher>;
    expected: ReturnType<typeof canStartupSearcher>;
  }[] = [
    {
      args: ["1", true, false, false, "r"],
      expected: true,
    },
    {
      args: ["99", true, false, false, "r"],
      expected: true,
    },
    {
      args: ["1", false, false, false, "r"],
      expected: false,
    },
    {
      args: ["1", true, true, false, "r"],
      expected: false,
    },
    {
      args: ["1", true, false, true, "r"],
      expected: false,
    },
    {
      args: ["1", true, false, false, "a"],
      expected: false,
    },
    {
      args: ["2", true, false, true, "l"],
      expected: true,
    },
    {
      args: ["2", true, false, true, "L"],
      expected: true,
    },
    {
      args: ["2", false, true, true, "l"],
      expected: true,
    },
    {
      args: ["99", true, false, true, "l"],
      expected: true,
    },
    {
      args: ["99", false, true, true, "l"],
      expected: true,
    },
    {
      args: ["2", true, true, true, "l"],
      expected: false,
    },
    {
      args: ["2", false, false, true, "l"],
      expected: false,
    },
    {
      args: ["2", true, false, false, "l"],
      expected: false,
    },
    {
      args: ["2", true, false, true, "a"],
      expected: false,
    },
  ];
  test.each(table)(
    'Config="$args.0",Ctrl=$args.1,Cmd=$args.2,Shift=$args.3,Key="$args.4" => $expected',
    ({ args, expected }) => {
      expect(canStartupSearcher(...args)).toBe(expected);
    }
  );
});
describe("splitSearchQueryIntoMultipulKeywords", () => {
  const table: {
    expected: string[];
    query: string;
  }[] = [
    {
      query: "foo",
      expected: ["foo"],
    },
    {
      query: "  foo  ",
      expected: ["foo"],
    },
    {
      query: "\u3000\u3000foo\u3000\u3000",
      expected: ["foo"],
    },
    {
      query: "\u3000 \u3000foo \u3000 ",
      expected: ["foo"],
    },
    {
      query: "foo bar \u3000baz",
      expected: ["foo", "bar", "baz"],
    },
    {
      query: "",
      expected: [],
    },
    {
      query: " ",
      expected: [],
    },
  ];
  test.each(table)(`"$query" -> $expected`, ({ query, expected }) => {
    expect(splitSearchQueryIntoMultipulKeywords(query)).toStrictEqual(expected);
  });
});
describe("searchFootprints", () => {
  const table: {
    args: Parameters<typeof searchFootprints>;
    expected: ReturnType<typeof searchFootprints>;
    name: string;
  }[] = [
    {
      name: "it searches footprints by partial matching",
      args: [
        [
          { directories: [], name: "foo", url: "" },
          { directories: [], name: "bar", url: "" },
          { directories: [], name: "baz", url: "" },
        ],
        "ba",
        false,
      ],
      expected: [
        { directories: [], name: "bar", url: "" },
        { directories: [], name: "baz", url: "" },
      ],
    },
    {
      name: 'it joins directories and name with "/"',
      args: [[{ directories: ["x", "y"], name: "z", url: "" }], "x/y/z", false],
      expected: [{ directories: ["x", "y"], name: "z", url: "" }],
    },
    {
      name: "it searches footprints including only directory",
      args: [[{ directories: ["foo"], url: "" }], "foo/", false],
      expected: [{ directories: ["foo"], url: "" }],
    },
    {
      name: "it evaluates multiple keywords with AND logic",
      args: [
        [
          { directories: [], name: "ab", url: "" },
          { directories: [], name: "bc", url: "" },
        ],
        "b c",
        false,
      ],
      expected: [{ directories: [], name: "bc", url: "" }],
    },
    {
      name: "it searches footprints by case insensitive",
      args: [
        [
          { directories: [], name: "abc", url: "" },
          { directories: [], name: "ABC", url: "" },
        ],
        "AbC",
        false,
      ],
      expected: [
        { directories: [], name: "abc", url: "" },
        { directories: [], name: "ABC", url: "" },
      ],
    },
    {
      name: "it returns all footprints when search query is empty",
      args: [
        [
          { directories: [], name: "foo", url: "" },
          { directories: [], name: "bar", url: "" },
        ],
        "",
        false,
      ],
      expected: [
        { directories: [], name: "foo", url: "" },
        { directories: [], name: "bar", url: "" },
      ],
    },
    {
      name: "it does not throw any regexp syntax errors",
      args: [
        [
          { directories: [], name: "a.*+?^${}()|[]/b", url: "" },
          { directories: [], name: "cd", url: "" },
        ],
        ".*+?^${}()|[]/",
        false,
      ],
      expected: [{ directories: [], name: "a.*+?^${}()|[]/b", url: "" }],
    },
    {
      name: "it does not use dots as any single character",
      args: [
        [
          { directories: [], name: "a", url: "" },
          { directories: [], name: ".", url: "" },
          { directories: [], name: "A", url: "" },
        ],
        ".",
        false,
      ],
      expected: [{ directories: [], name: ".", url: "" }],
    },
    {
      name: "it can search footprints as romaji",
      args: [
        [
          { directories: [], name: "nyan", url: "" },
          { directories: [], name: "にゃん", url: "" },
          { directories: [], name: "ニャン", url: "" },
          { directories: [], name: "にゃーん", url: "" },
        ],
        "nyaん",
        true,
      ],
      expected: [{ directories: [], name: "にゃん", url: "" }],
    },
  ];
  test.each(table)(`$name`, ({ args, expected }) => {
    expect(searchFootprints(...args)).toStrictEqual(expected);
  });
});
describe("adjustOldFootprints", () => {
  const table: {
    args: Parameters<typeof adjustOldFootprints>;
    expected: ReturnType<typeof adjustOldFootprints>;
    name: string;
  }[] = [
    {
      name: "it converts an old footprint",
      args: [[{ title: "foo", url: "https://example.com" }]],
      expected: [{ directories: [], name: "foo", url: "https://example.com" }],
    },
    {
      name: "it converts a new footprint",
      args: [
        [{ directories: ["foo"], name: "bar", url: "https://example.com" }],
      ],
      expected: [
        { directories: ["foo"], name: "bar", url: "https://example.com" },
      ],
    },
  ];
  test.each(table)(`$name`, ({ args, expected }) => {
    expect(adjustOldFootprints(...args)).toStrictEqual(expected);
  });
});
