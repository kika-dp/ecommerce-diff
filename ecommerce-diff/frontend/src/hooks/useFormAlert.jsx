import { useCallback, useState } from 'react';
import toast from 'react-hot-toast';

export const useFormAlert = () => {
  const [errors, setErrors] = useState({});

  const setError = useCallback((field, message) => {
    setErrors((prev) => ({ ...prev, [field]: message }));
  }, []);

  const clearError = useCallback((field) => {
    setErrors((prev) => {
      const next = { ...prev };
      delete next[field];
      return next;
    });
  }, []);

  const reset = useCallback(() => setErrors({}), []);

  const fromApiError = useCallback((error) => {
    const data = error?.response?.data;
    const message = Array.isArray(data?.message) ? data.message.join(', ') : data?.message;
    if (message) toast.error(message);
    return message;
  }, []);

  return { errors, setError, clearError, reset, fromApiError };
};

export default useFormAlert;
