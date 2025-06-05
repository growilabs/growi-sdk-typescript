// Export the main AXIOS_INSTANCE for configuration
export { AXIOS_INSTANCE } from './utils/axios-instance';

export type * as Apiv1Types from './apiv1';
export type * as Apiv3Types from './apiv3';

export { default as apiv1Client } from './apiv1';
export { default as apiv3Client } from './apiv3';
