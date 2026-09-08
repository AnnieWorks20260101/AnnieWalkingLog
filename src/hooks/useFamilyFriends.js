import { useEffect, useMemo, useState } from 'react';
import { collection, onSnapshot, query, where } from 'firebase/firestore';
import { db } from '../services/firebase';

export function useFamilyFriends(familyId) {
  const [friends, setFriends] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!familyId) {
      setFriends([]);
      setLoading(false);
      return undefined;
    }

    setLoading(true);

    const unsubscribe = onSnapshot(
      query(collection(db, 'pet_friends'), where('familyId', '==', familyId)),
      (snapshot) => {
        const data = [];
        snapshot.forEach((friendDoc) => {
          data.push({ id: friendDoc.id, ...friendDoc.data() });
        });
        setFriends(data);
        setLoading(false);
      },
      (error) => {
        console.error('pet_friends snapshot error:', error);
        setLoading(false);
      }
    );

    return () => unsubscribe();
  }, [familyId]);

  const sortedFriends = useMemo(() => {
    return [...friends].sort((a, b) => {
      const aMs = a.createdAt?.toMillis ? a.createdAt.toMillis() : 0;
      const bMs = b.createdAt?.toMillis ? b.createdAt.toMillis() : 0;
      return aMs - bMs;
    });
  }, [friends]);

  return { friends: sortedFriends, loading };
}
