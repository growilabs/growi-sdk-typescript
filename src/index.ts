// Legacy single-instance support (backward compatibility)
export { AXIOS_DEFAULT } from './utils/axios-default-instance.js';

// Legacy API exports (backward compatibility)
export type * as Apiv1Types from './apiv1/index.js';
export type * as Apiv3Types from './apiv3/index.js';

// New multi-instance client
export { GrowiClient, type GrowiClientConfig } from './client.js';
export { getGrowirestapiv1 } from './generated/v1/index.js';
export { getGrowirestapiv3 } from './generated/v3/index.js';

// Default export for convenience
export { GrowiClient as default } from './client.js';
