import { useEffect, useRef } from 'react';

export const useAutoFocus = (deps = []) => {
  const ref = useRef(null);
  useEffect(() => {
    ref.current?.focus?.();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, deps);
  return ref;
};

export default useAutoFocus;
