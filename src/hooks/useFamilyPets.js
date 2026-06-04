import { useState, useEffect, useMemo, useCallback } from 'react';
import { collection, doc, getDoc, onSnapshot, query, setDoc, where } from 'firebase/firestore';
import { db } from '../services/firebase';
import { mergePetOrderWithPets, sortPetsByOrder } from '../utils/petOrder';

export function useFamilyPets(familyId, userId) {
  const [pets, setPets] = useState([]);
  const [petOrder, setPetOrder] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!familyId) {
      setPets([]);
      setPetOrder([]);
      setLoading(false);
      return undefined;
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

    return () => {
      unsubPets();
    };
  }, [familyId]);

  useEffect(() => {
    if (!userId) {
      setPetOrder([]);
      return undefined;
    }

    const unsubUser = onSnapshot(
      doc(db, 'users', userId),
      (snap) => {
        setPetOrder(snap.exists() ? snap.data().petOrder ?? [] : []);
      },
      (error) => console.error('user petOrder snapshot error:', error)
    );

    return () => unsubUser();
  }, [userId]);

  const sortedPets = useMemo(
    () => sortPetsByOrder(pets, userId ? petOrder : []),
    [pets, petOrder, userId]
  );

  const mergedOrder = useMemo(
    () => mergePetOrderWithPets(pets, userId ? petOrder : []),
    [pets, petOrder, userId]
  );

  const savePetOrder = useCallback(
    async (newOrder) => {
      if (!userId) {
        return;
      }
      await setDoc(doc(db, 'users', userId), { petOrder: newOrder }, { merge: true });
    },
    [userId]
  );

  // 初回: ユーザーごとの petOrder。旧 families.petOrder があれば一度だけ引き継ぐ
  useEffect(() => {
    if (!familyId || !userId || loading || pets.length === 0) {
      return;
    }
    if (petOrder.length > 0) {
      return;
    }

    const initPetOrder = async () => {
      let seedOrder = pets.map((p) => p.id);

      try {
        const familySnap = await getDoc(doc(db, 'families', familyId));
        const legacyOrder = familySnap.exists() ? familySnap.data().petOrder : null;
        if (Array.isArray(legacyOrder) && legacyOrder.length > 0) {
          seedOrder = mergePetOrderWithPets(pets, legacyOrder);
        }
      } catch (error) {
        console.error('legacy petOrder read failed:', error);
      }

      await savePetOrder(seedOrder);
    };

    initPetOrder().catch((e) => console.error('init user petOrder failed:', e));
  }, [familyId, userId, loading, pets, petOrder.length, savePetOrder]);

  return {
    pets: sortedPets,
    petOrder: mergedOrder,
    loading,
    savePetOrder,
  };
}
