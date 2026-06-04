import { useState, useEffect } from 'react';
import { collection, query, where, orderBy, onSnapshot, limit } from 'firebase/firestore';
import { db } from '../services/firebase';

/** 家族のお散歩記録（新しい順） */
export function useFamilyWalks(familyId, options = {}) {
  const { maxCount } = options;
  const [walks, setWalks] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!familyId) {
      setWalks([]);
      setLoading(false);
      return undefined;
    }

    setLoading(true);
    const constraints = [
      where('familyId', '==', familyId),
      orderBy('startTime', 'desc'),
    ];
    if (maxCount) {
      constraints.push(limit(maxCount));
    }
    const q = query(collection(db, 'walks'), ...constraints);

    const unsubscribe = onSnapshot(q, (querySnapshot) => {
      const walkData = [];
      querySnapshot.forEach((document) => {
        walkData.push({ id: document.id, ...document.data() });
      });
      setWalks(walkData);
      setLoading(false);
    });

    return unsubscribe;
  }, [familyId]);

  return { walks, loading };
}
