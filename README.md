- [日本語 🇯🇵](./README_JP.md)

# @growilabs/growi-sdk-typescript

[![npm version](https://badge.fury.io/js/%40growilabs%2Fgrowi-sdk-typescript.svg)](https://badge.fury.io/js/%40growilabs%2Fgrowi-sdk-typescript)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

`@growilabs/growi-sdk-typescript` is a TypeScript SDK automatically generated from the official [GROWI](https://growi.org/) OpenAPI specifications using [orval](https://orval.dev/). It supports both GROWI API v1 and v3, enabling type-safe API operations.

### Key Features

- 🏢 **Official SDK by the GROWI Development Team**
- 🔄 **Automatic code generation from OpenAPI specifications**
- 🛡️ **Type-safe API operations with TypeScript**
- 🚀 **axios-based HTTP client**
- 🔗 **Support for GROWI API v1 and v3**
- 🎯 **Node.js 18+ support**

## Supported GROWI Versions

This SDK is generated from GROWI's official OpenAPI specifications and supports the specifications obtained from the following endpoints:

- **API v1**: https://docs.growi.org/openapi-spec-apiv1.json
- **API v3**: https://docs.growi.org/openapi-spec-apiv3.json

The SDK's compatibility depends on the compatibility of GROWI's API specifications. When new API versions are released, the SDK will be automatically updated.

## Installation

You can install it using npm, yarn, or pnpm:

```bash
# npm
npm install @growilabs/growi-sdk-typescript

# yarn
yarn add @growilabs/growi-sdk-typescript

# pnpm
pnpm add @growilabs/growi-sdk-typescript
```

## Basic Usage

### Client Initialization

```typescript
import { AXIOS_INSTANCE } from '@growilabs/growi-sdk-typescript';

// Set the base URL of your GROWI instance
AXIOS_INSTANCE.defaults.baseURL = 'https://your-growi-instance.com';

// Set authentication token (if needed)
AXIOS_INSTANCE.defaults.headers.common['Authorization'] = `Bearer ${your-api-token}`;
```

### API v3 Usage Example

```typescript
import apiv3 from '@growilabs/growi-sdk-typescript/v3';

// Get page list
try {
  const pages = await apiv3.getPagesList();
  console.log(pages);
} catch (error) {
  console.error('Failed to fetch pages:', error);
}

// Get recent pages
try {
  const recentPages = await apiv3.getPagesRecent();
  console.log(recentPages);
} catch (error) {
  console.error('Failed to fetch recent pages:', error);
}

// Using with parameters
const pagesWithParams = await apiv3.getPagesList({
  limit: 20,
  offset: 0
});
```

### API v1 Usage Example

```typescript
import apiv1 from '@growilabs/growi-sdk-typescript/v1';

// Search pages
try {
  const searchResult = await apiv1.searchPages({ q: 'search term' });
  console.log(searchResult);
} catch (error) {
  console.error('Failed to search pages:', error);
}

// Get comments
try {
  const comments = await apiv1.getComments({ page_id: 'your-page-id' });
  console.log(comments);
} catch (error) {
  console.error('Failed to fetch comments:', error);
}
```

## API Client Details

### Directory Structure

```
src/
├── api/
│   └── axios-instance.ts      # Custom axios instance
├── generated/
│   ├── v1/                    # API v1 client
│   │   ├── gROWIRESTAPIV1.ts
│   │   └── gROWIRESTAPIV1.schemas.ts
│   └── v3/                    # API v3 client
│       ├── gROWIRESTAPIV3.ts
│       └── gROWIRESTAPIV3.schemas.ts
```

### API Version Selection

- **API v3**: Contains new features and improved API endpoints. We recommend using v3 whenever possible.
- **API v1**: Use when you need features not available in v3 or for legacy compatibility.

## Code Generation and Supported GROWI Versions

This project automatically generates code from GROWI's official OpenAPI specifications:

- **Code generation command**: `pnpm run generate:api`
- **Configuration file**: `orval.config.ts`
- **Automatic updates**: GitHub Actions periodically checks for specification updates

## Contributing to Development

### Development Environment Setup

1. Clone the repository:
```bash
git clone https://github.com/weseek/growi-sdk-typescript.git
cd growi-sdk-typescript
```

2. Install dependencies:
```bash
pnpm install
```

3. Generate API client:
```bash
pnpm run generate:api
```

### Development Workflow

The following workflows are automatically executed by GitHub Actions:

1. **Specification update detection**: GitHub Actions periodically checks for changes in OpenAPI specifications
2. **Automatic code generation**: When changes are detected, new client code is automatically generated
3. **Diff review**: Review the generated code differences and check for breaking changes
4. **Pull request creation**: Automatically create pull requests when changes are found

### Development Guidelines

- **Coding standards**: Uses [Biome](https://biomejs.dev/)
- **Linting**: `pnpm run lint`
- **Build**: `pnpm run build`

### How to Contribute

1. **Report Issues**: Report bugs and feature requests on [GitHub Issues](https://github.com/weseek/growi-sdk-typescript/issues)
2. **Pull Requests**: 
   - Fork and create a branch
   - Implement changes
   - Add tests (if applicable)
   - Create a pull request

## License

This project is released under the [MIT License](./LICENSE).

---

## **Notice**

This SDK is under development. APIs may change without notice. Please thoroughly test before using in production environments.

