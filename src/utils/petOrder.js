/** Firestore families.petOrder と pets 一覧を突き合わせて並べる */

export function mergePetOrderWithPets(pets, petOrder = []) {
  const ids = pets.map((p) => p.id);
  const merged = [...petOrder.filter((id) => ids.includes(id))];
  ids.forEach((id) => {
    if (!merged.includes(id)) {
      merged.push(id);
    }
  });
  return merged;
}

export function sortPetsByOrder(pets, petOrder = []) {
  const order = mergePetOrderWithPets(pets, petOrder);
  const orderMap = Object.fromEntries(order.map((id, index) => [id, index]));

  return [...pets].sort((a, b) => {
    const ai = orderMap[a.id] ?? 9999;
    const bi = orderMap[b.id] ?? 9999;
    if (ai !== bi) return ai - bi;
    const aTime = a.createdAt?.seconds ?? 0;
    const bTime = b.createdAt?.seconds ?? 0;
    return bTime - aTime;
  });
}

export function movePetInOrder(petOrder, petId, direction) {
  const order = [...petOrder];
  const index = order.indexOf(petId);
  if (index === -1) return order;

  const targetIndex = direction === 'up' ? index - 1 : index + 1;
  if (targetIndex < 0 || targetIndex >= order.length) return order;

  [order[index], order[targetIndex]] = [order[targetIndex], order[index]];
  return order;
}
