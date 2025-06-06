# GROWI SDK コード自動生成・自動更新方針

## 1. 自動生成の方針

### 入力

*   **OpenAPI 仕様書の取得元:**
    *   `apiv1`: [`https://docs.growi.org/openapi-spec-apiv1.json`](https://docs.growi.org/openapi-spec-apiv1.json)
    *   `apiv3`: [`https://docs.growi.org/openapi-spec-apiv3.json`](https://docs.growi.org/openapi-spec-apiv3.json)
*   **仕様書のバージョン対応:**
    *   `apiv1` と `apiv3` の両方を使用し、それぞれ別のクライアントとして生成する。
    *   `apiv3` をメインターゲットとしつつ、`apiv1` にしか存在しない API もサポートする。

### 出力

*   **出力先ディレクトリ構造:**
    *   `apiv1` 用: `src/generated/v1/`
    *   `apiv3` 用: `src/generated/v3/`
*   **ファイル名・モジュール命名規則:** orval のデフォルトに従う。

### `orval` の設定

*   **クライアントの種類:** `axios`
*   **型定義のスタイル:** orval のデフォルト
*   **API リクエスト/レスポンスの加工:** 共通ヘッダー追加のための Interceptor を利用する。
*   **その他:** (特記事項なし)

### 生成コードの品質

*   **Linter/Formatter との連携:**
    *   `orval` コマンドによるコード生成時、`--biome` オプションを有効化し、Biome によるフォーマットを適用する。
*   **テストの方針:**
    *   orval が生成するコードは信頼するため、生成されたコードに対する個別のテストは記述しない。

## 2. 自動更新の方針

### トリガー

*   **仕様書更新検知:** GitHub Actions を利用し、毎日定期的に `apiv1` および `apiv3` の OpenAPI 仕様書の URL をチェックする。
*   **コード再生成タイミング:** 仕様書に変更があった場合、GitHub Actions 上で自動的に `generate:api` スクリプトを実行する。

### プロセス

*   **差分確認:** 生成されたコードの差分をコミットし、プルリクエストを自動作成する。プルリクエスト上で開発者が差分内容を確認する。
*   **破壊的変更への対応:** プルリクエストのレビュー時に破壊的変更が確認された場合、手動でマージ判断を行う。必要に応じて SDK のメジャーバージョンを上げることを検討する。
*   **CI/CD パイプライン:** 上記のチェック、生成、PR作成プロセスを GitHub Actions のワークフローとして実装する。

### バージョン管理

*   **SDK と仕様書の関連付け:** SDK のマイナーバージョンまたはパッチバージョンが上がる際に、CHANGELOG ファイルに対応する OpenAPI 仕様書のバージョン (取得した日時や、もし仕様書内にバージョン情報があればそのバージョン) を明記する。