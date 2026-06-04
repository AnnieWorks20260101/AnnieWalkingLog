import { useState, useEffect } from 'react';
import { collection, query, where, orderBy, onSnapshot, limit } from 'firebase/firestore';
import { db } from '../services/firebase';

/** 家族のお散歩記録（新しい順） */
export function useFamilyWalks(familyId, options = {}) {
  const { maxCount, sinceTimestamp } = options;
  const [walks, setWalks] = useState([]);
  const [loading, setLoading] = useState(true);

  const maxCountKey = maxCount ?? '';
  const sinceKey = sinceTimestamp?.seconds ?? sinceTimestamp?.toMillis?.() ?? '';

  useEffect(() => {
    if (!familyId) {
      setWalks([]);
      setLoading(false);
      return undefined;
    }

    setLoading(true);
    const constraints = [where('familyId', '==', familyId)];
    if (sinceTimestamp) {
      constraints.push(where('startTime', '>=', sinceTimestamp));
    }
    constraints.push(orderBy('startTime', 'desc'));
    if (maxCount) {
      constraints.push(limit(maxCount));
    }
    const q = query(collection(db, 'walks'), ...constraints);

    const unsubscribe = onSnapshot(
      q,
      (querySnapshot) => {
        const walkData = [];
        querySnapshot.forEach((document) => {
          walkData.push({ id: document.id, ...document.data() });
        });
        setWalks(walkData);
        setLoading(false);
      },
      (error) => {
        console.error('useFamilyWalks snapshot error:', error);
        setWalks([]);
        setLoading(false);
      }
    );

    return unsubscribe;
  }, [familyId, maxCountKey, sinceKey]);

  return { walks, loading };
}
