// Export the main AXIOS_INSTANCE for configuration
export { AXIOS_INSTANCE } from './utils/axios-instance.js';

export type * as Apiv1Types from './apiv1/index.js';
export type * as Apiv3Types from './apiv3/index.js';

export { default as apiv1Client } from './apiv1/index.js';
export { default as apiv3Client } from './apiv3/index.js';
