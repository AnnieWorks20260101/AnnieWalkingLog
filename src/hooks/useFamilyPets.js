import { useState, useEffect, useMemo, useCallback } from 'react';
import { collection, doc, onSnapshot, query, updateDoc, where } from 'firebase/firestore';
import { db } from '../services/firebase';
import { mergePetOrderWithPets, sortPetsByOrder } from '../utils/petOrder';

export function useFamilyPets(familyId) {
  const [pets, setPets] = useState([]);
  const [petOrder, setPetOrder] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!familyId) {
      setPets([]);
      setPetOrder([]);
      setLoading(false);
      return;
    }

    setLoading(true);

    const unsubPets = onSnapshot(
      query(collection(db, 'pets'), where('familyId', '==', familyId)),
      (snapshot) => {
        const data = [];
        snapshot.forEach((petDoc) => {
          data.push({ id: petDoc.id, ...petDoc.data() });
        });
        setPets(data);
        setLoading(false);
      },
      (error) => {
        console.error('pets snapshot error:', error);
        setLoading(false);
      }
    );

    const unsubFamily = onSnapshot(
      doc(db, 'families', familyId),
      (snap) => {
        setPetOrder(snap.exists() ? snap.data().petOrder ?? [] : []);
      },
      (error) => console.error('family snapshot error:', error)
    );

    return () => {
      unsubPets();
      unsubFamily();
    };
  }, [familyId]);

  const sortedPets = useMemo(
    () => sortPetsByOrder(pets, petOrder),
    [pets, petOrder]
  );

  const mergedOrder = useMemo(
    () => mergePetOrderWithPets(pets, petOrder),
    [pets, petOrder]
  );

  const savePetOrder = useCallback(
    async (newOrder) => {
      if (!familyId) return;
      await updateDoc(doc(db, 'families', familyId), { petOrder: newOrder });
    },
    [familyId]
  );

  // 初回: petOrder 未設定の家族に現在のペット ID 順を保存
  useEffect(() => {
    if (!familyId || loading || pets.length === 0) return;
    if (petOrder.length > 0) return;

    const initialOrder = pets.map((p) => p.id);
    savePetOrder(initialOrder).catch((e) => console.error('init petOrder failed:', e));
  }, [familyId, loading, pets, petOrder.length, savePetOrder]);

  return {
    pets: sortedPets,
    petOrder: mergedOrder,
    loading,
    savePetOrder,
  };
}
