# `changesets` を利用したリリースワークフロー戦略

## はじめに

このドキュメントは、`changesets` を利用してSDKのリリースプロセスを自動化するための設計案をまとめたものです。

## ワークフローの概要

*   **ワークフロー名:** `Release SDK with Changesets`
*   **ファイル名:** `.github/workflows/release-sdk.yml`
*   **トリガー:**
    *   メインブランチへのプッシュ
    *   手動実行 (`workflow_dispatch`)

## 主要なステップ詳細

1.  **リポジトリのチェックアウト:**
    *   `actions/checkout@vX` を使用します。
    *   `fetch-depth: 0` を指定して、すべての履歴を取得します。

2.  **Node.js と pnpm のセットアップ:**
    *   `actions/setup-node@vX` を使用して Node.js をセットアップします。
    *   `pnpm/action-setup@vX` を使用して pnpm をセットアップします。

3.  **依存関係のインストール:**
    *   `pnpm install --frozen-lockfile` を実行します。

4.  **Changesets 初期設定:**
    *   `.changeset` ディレクトリが存在しない場合に `pnpm changeset init` を実行するステップを追加します。
        ```yaml
        - name: Initialize Changesets if not already initialized
          run: |
            if [ ! -d ".changeset" ]; then
              pnpm changeset init
            fi
        ```

5.  **バージョンアップ、CHANGELOG生成、公開:**
    *   `changesets/action@v1` を使用します。
    *   **version:** `pnpm changeset version` を実行してバージョンアップとCHANGELOG生成を行います。
    *   **publish:** `pnpm changeset publish` を実行してnpmに公開します。
    *   **commit:** バージョンアップとCHANGELOG更新をコミットする際のコミットメッセージを設定します (例: `chore: release new version(s)`)。
    *   **title:** プルリクエストのタイトルを設定します (例: `Release new version(s)`)。
    *   **環境変数:**
        *   `GITHUB_TOKEN: ${{ secrets.GITHUB_TOKEN }}`
        *   `NPM_TOKEN: ${{ secrets.NPM_TOKEN }}`

## 前提条件

*   `NPM_TOKEN` がリポジトリのシークレットに正しく設定されていること。

## 補足事項

*   このワークフローは、SDK生成ワークフロー ([`.github/workflows/generate-sdk.yml`](.github/workflows/generate-sdk.yml:1)) によって作成された変更セットファイルがメインブランチにマージされた後に実行されることを想定しています。