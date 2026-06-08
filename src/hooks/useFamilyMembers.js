import { useEffect, useMemo, useState } from 'react';
import { collection, onSnapshot, query, where } from 'firebase/firestore';
import { db } from '../services/firebase';
import { getDisplayNameOrNull } from '../utils/displayName';

export function useFamilyMembers(familyId, currentUserId) {
  const [members, setMembers] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!familyId) {
      setMembers([]);
      setLoading(false);
      return undefined;
    }

    setLoading(true);

    const unsubscribe = onSnapshot(
      query(collection(db, 'users'), where('activeFamilyId', '==', familyId)),
      (snapshot) => {
        const rows = [];
        snapshot.forEach((memberDoc) => {
          const data = memberDoc.data();
          rows.push({
            userId: memberDoc.id,
            displayName: data.displayName ?? '',
            displayLabel: getDisplayNameOrNull(data.displayName),
          });
        });
        setMembers(rows);
        setLoading(false);
      },
      (error) => {
        console.error('family members snapshot error:', error);
        setLoading(false);
      }
    );

    return unsubscribe;
  }, [familyId]);

  const sortedMembers = useMemo(() => {
    const copy = [...members];
    copy.sort((a, b) => {
      if (a.userId === currentUserId) {
        return -1;
      }
      if (b.userId === currentUserId) {
        return 1;
      }
      const nameA = a.displayLabel ?? '';
      const nameB = b.displayLabel ?? '';
      return nameA.localeCompare(nameB, 'ja');
    });
    return copy;
  }, [members, currentUserId]);

  return { members: sortedMembers, loading };
}
