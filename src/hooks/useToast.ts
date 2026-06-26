import { useCallback, useState } from 'react';

export function useToast() {
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const showToast = useCallback((msg: string) => setToastMessage(msg), []);
  const hideToast = useCallback(() => setToastMessage(null), []);
  return { toastMessage, showToast, hideToast };
}
