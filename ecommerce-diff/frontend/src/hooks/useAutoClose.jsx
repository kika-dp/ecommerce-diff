import { useEffect } from 'react';

export const useAutoClose = (isOpen, onClose, delay = 4000) => {
  useEffect(() => {
    if (!isOpen) return undefined;
    const t = setTimeout(() => onClose?.(), delay);
    return () => clearTimeout(t);
  }, [isOpen, onClose, delay]);
};

export default useAutoClose;
