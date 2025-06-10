# `changesets` を利用したバージョン管理・CHANGELOG生成戦略

## 1. はじめに

このドキュメントは、`changesets` ライブラリを導入し、効率的なバージョン管理とCHANGELOG自動生成を実現するための計画をまとめたものです。`changesets` は、特に複数のパッケージを管理するモノレポ構成において強力な機能を提供し、`npm publish` との連携も考慮されています。

## 2. `changesets` の特徴

### 2.1. 主な機能

*   **変更セットファイル (.md):** 開発者が変更を加えた際に、その変更内容（patch, minor, major）と概要を記述するファイル。
*   **モノレポ対応:** 複数パッケージ間の依存関係を考慮したバージョン管理とCHANGELOG生成。
*   **柔軟なバージョン管理:** 各パッケージのバージョンを個別に、または一括で管理可能。
*   **CHANGELOG自動生成:** 変更セットファイルからCHANGELOGを自動で生成・更新。
*   **CI/CD連携:** GitHub Actionsなどを利用して、バージョンアップ、CHANGELOG生成、npm publishまでを自動化。

### 2.2. 他のツールとの比較

*   **`standard-version` / `conventional-changelog` との比較:**
    *   **利点:**
        *   モノレポのサポートが手厚い。
        *   変更の意図を開発者が直接記述できるため、CHANGELOGの質が向上しやすい。
        *   リリースプロセスがより明示的になる。
    *   **欠点:**
        *   Conventional Commits に完全に準拠しているわけではないため、コミットメッセージ規約との連携は別途考慮が必要な場合がある。
        *   変更セットファイルの作成という一手間が増える。

## 3. 導入と設定

### 3.1. `package.json` への追加

```json
{
  "devDependencies": {
    "@changesets/cli": "^2.x.x"
    // 必要に応じて @changesets/changelog-github などの関連パッケージも追加
  }
}
```

### 3.2. 初期設定コマンド

```bash
pnpm changeset init
# または yarn changeset init / npx @changesets/cli init
```
これにより、`.changeset` ディレクトリと設定ファイルが生成されます。

### 3.3. 設定ファイル (`.changeset/config.json`) の概要

```json
{
  "$schema": "https://unpkg.com/@changesets/config@2.x.x/schema.json",
  "changelog": "@changesets/changelog-github", // CHANGELOGの形式 (GitHub形式を推奨)
  "commit": false, // changeset version 実行時にコミットするかどうか
  "fixed": [], // 固定バージョン管理するパッケージ群
  "linked": [], // リンクされたパッケージ群 (一方が更新されたら他方も更新)
  "access": "public", // npm publish 時のアクセスレベル
  "baseBranch": "main", // 変更セットを比較するベースブランチ
  "updateInternalDependencies": "patch", // 内部依存関係の更新時の最小bumpタイプ
  "ignore": [] // changesets の対象外とするパッケージ
}
```
*   `changelog`: CHANGELOGの生成方法を指定します。`@changesets/changelog-github` を使用すると、コミットハッシュやPRへのリンクが含まれる形式になります。
*   `commit`: `changeset version` 実行時に、変更内容（バージョンアップ、CHANGELOG更新）を自動でコミットするかどうか。CIで管理する場合は `false` にして、Action側でコミット・PR作成するのが一般的です。
*   `baseBranch`: 通常は開発のメインラインとなるブランチ（例: `main`, `master`）を指定します。
*   `access`: `npm publish` 時のデフォルトのアクセスレベル。

## 4. 基本的なワークフロー

1.  **開発者が変更を加える:**
    *   コード変更後、以下のコマンドを実行して変更セットファイルを作成します。
        ```bash
        pnpm changeset add
        # または yarn changeset add / npx @changesets/cli add
        # (引数なしの pnpm changeset でも可)
        ```
    *   対話形式で、変更があったパッケージ、バージョンアップの種類（patch, minor, major）、変更内容のサマリーを入力します。
    *   これにより、`.changeset/UNIQUE_ID.md` というファイルが生成されます。
        ```markdown
        ---
        "my-package-a": patch
        "my-package-b": minor
        ---

        Fix a bug in package-a and add a new feature to package-b.
        ```
2.  **変更セットファイルのコミット:**
    *   生成された変更セットファイルをGitにコミットし、プルリクエストに含めます。
3.  **バージョンアップとCHANGELOG生成 (リリース準備):**
    *   リリース担当者またはCIが、メインブランチで以下のコマンドを実行します。
        ```bash
        pnpm changeset version
        # または yarn changeset version / npx @changesets/cli version
        ```
    *   これにより、`.changeset` ディレクトリ内のすべての変更セットファイルが消費されます。
    *   各パッケージの `package.json` のバージョンが更新されます。
    *   各パッケージの `CHANGELOG.md` が更新されます。
    *   消費された変更セットファイルは削除されます。
4.  **リリース (タグ付けと公開):**
    *   バージョンアップされた内容をコミットし、タグを打ちます。
    *   その後、以下のコマンドでnpmに公開します。
        ```bash
        pnpm changeset publish
        # または yarn changeset publish / npx @changesets/cli publish
        ```
    *   このコマンドは、ローカルのバージョンがnpmレジストリ上のバージョンよりも新しいパッケージのみを公開します。

## 5. CIワークフローへの組み込み案 ([`.github/workflows/generate-sdk.yml`](.github/workflows/generate-sdk.yml:1) を想定)

### 5.1. SDKコード自動生成後の変更セット作成・コミット

*   **課題:** SDKコードの自動生成は、通常、人間が意図するセマンティックな変更（バグ修正、機能追加など）とは直接結びつきません。自動生成されたコードの差分だけを見て、機械的に `patch`, `minor`, `major` を判断するのは困難です。
*   **提案:**
    1.  **手動での変更セット作成を推奨:** SDK生成後、開発者がその変更内容を確認し、適切なバージョンアップの種類（通常は `patch` か、APIの互換性に影響があれば `minor` や `major`）と変更概要を記述した変更セットファイルを手動で作成・コミットする。
    2.  **自動化の試み (限定的):**
        *   もしOpenAPIの仕様変更に特定のルール（例: `x-semver-bump: minor`のようなカスタムフィールド）を設けられるなら、それを読み取って変更セットを自動生成することも考えられますが、柔軟性に欠ける可能性があります。
        *   単純に「SDKが更新された」という固定のメッセージで `patch` の変更セットを自動生成することも可能ですが、CHANGELOGの価値は下がります。
*   **コミット:** 生成された変更セットファイルは、SDKの自動生成コードと一緒にコミットします。

### 5.2. プルリクエストマージ後のリリースワークフロー

`changesets/action` GitHub Action を利用して、メインブランチへのマージをトリガーにリリースプロセスを自動化します。

```yaml
# .github/workflows/release.yml
name: Release

on:
  push:
    branches:
      - main # メインブランチ名を指定

concurrency: ${{ github.workflow }}-${{ github.ref }}

jobs:
  release:
    name: Release
    runs-on: ubuntu-latest
    steps:
      - name: Checkout Repo
        uses: actions/checkout@v4
        with:
          # Fetch all history for all tags and branches
          fetch-depth: 0

      - name: Setup Node.js
        uses: actions/setup-node@v4
        with:
          node-version: '20.x' # プロジェクトのNode.jsバージョンに合わせる
          # cache: 'pnpm' # pnpm を使用する場合

      - name: Install Dependencies
        run: pnpm install # プロジェクトのパッケージマネージャーに合わせて変更 (yarn install, npm ci)

      # - name: Build Packages (必要な場合)
      #   run: pnpm build # プロジェクトのビルドコマンド

      - name: Create Release Pull Request or Publish to npm
        id: changesets
        uses: changesets/action@v1
        with:
          # npm publish を実行するスクリプトを指定 (例: pnpm release)
          # publish: pnpm run release # "scripts": { "release": "pnpm build && pnpm changeset publish" } のようなスクリプトを想定
          publish: pnpm changeset publish # ビルドが不要、または別ステップで行う場合
          version: pnpm changeset version
          commit: "chore: version packages"
          title: "chore: version packages"
          # createGithubReleases: true # デフォルトでtrue。GitHub Releasesを作成する
        env:
          GITHUB_TOKEN: ${{ secrets.GITHUB_TOKEN }}
          NPM_TOKEN: ${{ secrets.NPM_TOKEN }} # npm publish に必要

      # - name: Output published packages (Optional)
      #   if: steps.changesets.outputs.published == 'true'
      #   run: echo "Published packages: ${{ steps.changesets.outputs.publishedPackages }}"
```

*   **`changesets/action@v1`:**
    *   メインブランチにプッシュされた変更セットを元に、**直接 `version` と `publish` を実行する** のが一般的な使い方です。
    *   `publish` 入力: `pnpm changeset publish` を直接指定するか、ビルドステップを含むリリーススクリプト（例: `pnpm run release` で内部的に `pnpm build && pnpm changeset publish` を実行）を指定します。
    *   `version` 入力: `pnpm changeset version` を指定します。
    *   `commit` と `title`: バージョンアップ時のコミットメッセージとPRのタイトルを指定します。
*   **`NPM_TOKEN`:**
    *   npmに公開するために必要な認証トークンです。
    *   事前にnpmでアクセストークンを作成し、リポジトリの `Settings > Secrets and variables > Actions` で `NPM_TOKEN` という名前のシークレットとして登録しておく必要があります。
    *   トークンには適切な公開権限が必要です。

## 6. `npm publish` との連携

*   `pnpm changeset publish` コマンドは、内部的に各パッケージディレクトリで `npm publish` (または `yarn publish`, `pnpm publish`) を実行します。
*   `.changeset/config.json` の `access` プロパティで公開範囲（`public` または `restricted`）を指定できます。
*   **公開前のビルドステップ:**
    *   多くのプロジェクトでは、公開前にトランスパイルやバンドルなどのビルド処理が必要です。
    *   `changeset publish` コマンド自体にはビルド機能は含まれていません。
    *   対応方法:
        1.  `package.json` の `prepublishOnly` スクリプトにビルドコマンドを記述する。
            ```json
            "scripts": {
              "prepublishOnly": "pnpm build"
            }
            ```
        2.  CIワークフローの `changesets/action` の `publish` 入力で、ビルドと公開を両方行うスクリプトを指定する。
            ```yaml
            # ...
            with:
              publish: pnpm run release-ci # "release-ci": "pnpm build && pnpm changeset publish"
            # ...
            ```

## 7. 考慮事項

*   **モノレポではない単一パッケージプロジェクトでの利用:**
    *   `changesets` はモノレポ向けに多くの機能が最適化されていますが、単一パッケージプロジェクトでも利用可能です。
    *   変更セットファイルによるバージョンアップ意図の明確化や、CHANGELOG生成の自動化といった恩恵は受けられます。
    *   設定はシンプルになります（`linked`, `fixed` などの設定が不要）。
*   **Conventional Commits との併用:**
    *   `changesets` は、コミットメッセージの規約（Conventional Commitsなど）とは独立して動作します。
    *   変更セットファイルに変更内容のサマリーを記述するため、コミットメッセージの粒度とCHANGELOGの粒度を分離できます。
    *   併用は可能ですが、運用ルールを明確にする必要があります。
        *   例1: コミットメッセージはConventional Commitsに従い、変更セットのサマリーはよりユーザーフレンドリーな言葉で記述する。
        *   例2: 変更セットファイルに十分な情報があれば、コミットメッセージの規約は緩める。
    *   `@changesets/changelog-git` を使うとコミットメッセージベースのCHANGELOG生成も可能ですが、`@changesets/changelog-github` の方が一般的です。