import { useEffect, useState } from 'react';
import { isShutdownPurchaseFreezeActive } from '../services/shutdownPurchaseFreeze';

export { isShutdownPurchaseFreezeActive, shutdownFreezeFromRows } from '../services/shutdownPurchaseFreeze';

export function useShutdownPurchaseFreeze() {
  const [frozen, setFrozen] = useState(false);

  useEffect(() => {
    let cancelled = false;
    isShutdownPurchaseFreezeActive().then((next) => {
      if (!cancelled) {
        setFrozen(next);
      }
    });
    return () => {
      cancelled = true;
    };
  }, []);

  return frozen;
}
