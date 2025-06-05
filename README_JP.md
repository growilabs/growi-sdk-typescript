- [English 🇺🇸](./README.md)

# @growilabs/growi-sdk-typescript

[![npm version](https://badge.fury.io/js/%40growilabs%2Fgrowi-sdk-typescript.svg)](https://badge.fury.io/js/%40growilabs%2Fgrowi-sdk-typescript)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

`@growilabs/growi-sdk-typescript` は、[GROWI](https://growi.org/) の公式 OpenAPI 仕様書から [orval](https://orval.dev/) を使用して自動生成された TypeScript SDK です。GROWI API v1 および v3 の両方をサポートし、型安全な API 操作を可能にします。

### 主な特徴

- 🏢 **GROWI 開発チームによるオフィシャル SDK**
- 🔄 **OpenAPI 仕様書からの自動コード生成**
- 🛡️ **TypeScript による型安全な API 操作**
- 🚀 **axios ベースの HTTP クライアント**
- 🔗 **GROWI API v1 および v3 のサポート**
- 🎯 **Node.js 18+ サポート**

## 対応 GROWI バージョン

この SDK は GROWI の公式 OpenAPI 仕様書から生成されており、以下のエンドポイントから取得される仕様に対応しています：

- **API v1**: https://docs.growi.org/openapi-spec-apiv1.json
- **API v3**: https://docs.growi.org/openapi-spec-apiv3.json

SDK の対応状況は GROWI の API 仕様の互換性に依存します。新しい API バージョンがリリースされると、SDK も自動的に更新されます。

## インストール

npm、yarn、または pnpm を使用してインストールできます：

```bash
# npm
npm install @growilabs/growi-sdk-typescript

# yarn
yarn add @growilabs/growi-sdk-typescript

# pnpm
pnpm add @growilabs/growi-sdk-typescript
```

## 基本的な使用方法

### クライアントの初期化

```typescript
import { AXIOS_INSTANCE } from '@growilabs/growi-sdk-typescript';

// GROWI インスタンスのベース URL を設定
AXIOS_INSTANCE.defaults.baseURL = 'https://your-growi-instance.com';

// 認証トークンを設定（必要に応じて）
AXIOS_INSTANCE.defaults.headers.common['Authorization'] = `Bearer ${your-api-token}`;
```

### API v3 の使用例

```typescript
import { getPagesV3 } from '@growilabs/growi-sdk-typescript/apiv3';

// ページ一覧を取得
try {
  const pages = await getPagesV3();
  console.log(pages);
} catch (error) {
  console.error('ページの取得に失敗しました:', error);
}
```

### API v1 の使用例

```typescript
import { getPagesV1 } from '@growilabs/growi-sdk-typescript/apiv1';

// v1 API を使用してページを取得
try {
  const pages = await getPagesV1();
  console.log(pages);
} catch (error) {
  console.error('ページの取得に失敗しました:', error);
}
```

### 型定義の利用

```typescript
import type { Page, PageCreateRequest } from '@growilabs/growi-sdk-typescript/apiv3';

// 型安全なページ作成
const createPageData: PageCreateRequest = {
  title: '新しいページ',
  body: 'ページの内容',
  path: '/new-page'
};

const newPage: Page = await createPageV3(createPageData);
```

## API クライアント詳細

### ディレクトリ構成

```
src/
├── api/
│   └── axios-instance.ts      # カスタム axios インスタンス
├── generated/
│   ├── v1/                    # API v1 クライアント
│   │   ├── gROWIRESTAPIV1.ts
│   │   └── gROWIRESTAPIV1.schemas.ts
│   └── v3/                    # API v3 クライアント
│       ├── gROWIRESTAPIV3.ts
│       └── gROWIRESTAPIV3.schemas.ts
```

### API バージョンの使い分け

- **API v3**: 新機能や改良された API エンドポイントが含まれています。可能な限り v3 の使用を推奨します。
- **API v1**: v3 で提供されていない機能や、レガシー対応が必要な場合に使用してください。

## 型定義

すべての API リクエスト・レスポンスは型安全です：

```typescript
// 自動生成された型定義を利用
import type { 
  Page, 
  User, 
  Comment,
  PageCreateRequest,
  PageUpdateRequest 
} from '@growilabs/growi-sdk-typescript/apiv3';

// TypeScript の型チェックにより、コンパイル時にエラーを検出
const pageData: PageCreateRequest = {
  title: 'テストページ',
  body: '# Hello GROWI',
  // path: '/test' // ← この行をコメントアウトすると TypeScript エラー
};
```

## コード生成、対応する GROWI バージョンについて

このプロジェクトは、GROWI の公式 OpenAPI 仕様書から自動的にコードを生成します：

- **コード生成コマンド**: `pnpm run generate:api`
- **設定ファイル**: `orval.config.ts`
- **自動更新**: GitHub Actions により定期的に仕様書の更新をチェック



## 開発への貢献

### 開発環境のセットアップ

1. リポジトリをクローン：
```bash
git clone https://github.com/weseek/growi-sdk-typescript.git
cd growi-sdk-typescript
```

2. 依存関係をインストール：
```bash
pnpm install
```

3. API クライアントを生成：
```bash
pnpm run generate:api
```

### 開発ワークフロー

GitHub Actions により、以下のワークフローが定期実行される

1. **仕様書の更新検知**: GitHub Actions が定期的に OpenAPI 仕様書の変更をチェック
2. **自動コード生成**: 変更が検知されると、新しいクライアントコードを自動生成
3. **差分確認**: 生成されたコードの差分を確認し、破壊的変更がないかチェック
4. **プルリクエスト作成**: 変更があった場合、自動的にプルリクエストを作成

### 開発ガイドライン

- **コーディング規約**: [Biome](https://biomejs.dev/) を使用
- **リント**: `pnpm run lint`
- **ビルド**: `pnpm run build`

### 貢献方法

1. **Issue の報告**: バグや機能要求は [GitHub Issues](https://github.com/weseek/growi-sdk-typescript/issues) で報告してください
2. **プルリクエスト**: 
   - フォークしてブランチを作成
   - 変更を実装
   - テストを追加（該当する場合）
   - プルリクエストを作成

## ライセンス

このプロジェクトは [MIT License](./LICENSE) の下で公開されています。

---

## **注意**

このSDKは開発中です。API は予告なく変更される可能性があります。本番環境での使用前に十分なテストを行ってください。