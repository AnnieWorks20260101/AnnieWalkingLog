import { useState, useEffect } from 'react';
import { collection, query, where, orderBy, onSnapshot } from 'firebase/firestore';
import { db } from '../services/firebase';

/**
 * 指定お友達が friendPetIds に含まれるお散歩（新しい順）。
 * friendPetIds は今後の記録からのみ付与される。
 */
export function useFriendEncounterWalks(familyId, friendPetId) {
  const [walks, setWalks] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!familyId || !friendPetId) {
      setWalks([]);
      setLoading(false);
      return undefined;
    }

    setLoading(true);
    const q = query(
      collection(db, 'walks'),
      where('familyId', '==', familyId),
      where('friendPetIds', 'array-contains', friendPetId),
      orderBy('startTime', 'desc')
    );

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
        console.error('useFriendEncounterWalks snapshot error:', error);
        setWalks([]);
        setLoading(false);
      }
    );

    return unsubscribe;
  }, [familyId, friendPetId]);

  return { walks, loading };
}
