---
"@growi/sdk-typescript": patch
---

Add authorization header override functionality

- Add `authorizationHeader` option to `AxiosInstanceManager.addAxiosInstance()`
- Allow custom authorization headers instead of default Bearer token authentication
- When `authorizationHeader` is specified, GROWI access token is sent via `X-GROWI-ACCESS-TOKEN` header
- Support for Digest authentication, Basic authentication, and custom proxy authentication
- Add detailed usage examples and documentation to README
- Add comprehensive test cases covering error handling and edge cases
