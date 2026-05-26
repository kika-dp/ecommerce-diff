import { lazy } from 'react';

// Wrapper around React.lazy that retries a transient chunk-load failure once.
export const lazyLoad = (importer) =>
  lazy(async () => {
    try {
      return await importer();
    } catch (err) {
      console.warn('[lazyLoad] retrying chunk load', err);
      return importer();
    }
  });

export default lazyLoad;
