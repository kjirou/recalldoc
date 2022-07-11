# <img src="https://github.com/kjirou/recalldoc/raw/main/icons/icon-128x128-original.png" width="32" height="32" /> Recalldoc

![Run tests](https://github.com/kjirou/recalldoc/workflows/Run%20tests/badge.svg)

ドキュメント管理ツールへ閲覧履歴のインクリメンタル検索機能を付与する Chrome 拡張です。  
現在は、[esa](https://esa.io/) と [Kibela](https://kibe.la/) で使うことができます。

## 💁 Chrome 拡張のユーザーの方へ

ご質問・ご意見・ご要望は、以下のいずれかで受け付けております。

- [GitHub Issues](https://github.com/kjirou/recalldoc/issues)
  - 利用可能な言語は、日本語または英語です。
  - 公開されます。
- `sorenariblog[at]gmail[dot]com`

## 🔧 開発
### 事前にインストールをするソフトウェア

- [Node.js](https://nodejs.org/)
  - バージョンは [.nvmrc](/.nvmrc) へ記載している値です。

### インストール

```
npm install
```

### 開発手順の例
#### 動作確認をしながら実装する

以下のコマンドで、ビルド用のサーバを起動します。
```
npm run develop
```

Chrome の機能である「パッケージ化されてない拡張機能を読み込む」の対象へ、本リポジトリをローカルへ clone したディレクトリを指定します。

#### Chrome Web Store用のアイコンを更新する

元となる [icons/icon-128x128-original.png](/icons/icon-128x128-original.png) を上書き更新します。

以下のコマンドで、他のサイズの画像を生成します。
```
npm run generate-icons
```

#### Chrome Web Store登録用の.zipを生成する

```
npm run zip
```

#### Chrome 拡張として公開や更新をする

- [#48](https://github.com/kjirou/recalldoc/pull/48) に最初に行った時のメモをしてある。
  - 何か調べたことがあったら、一旦はそこにまとめる。
