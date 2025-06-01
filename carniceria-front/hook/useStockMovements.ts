import { useEffect, useState } from 'react';
import { collection, onSnapshot, query, orderBy } from 'firebase/firestore';
import { db } from '../helpers/firebaseClient'; 

interface StockMovement {
  movementId: string;
  tipo: 'entrada' | 'salida';
  peso_kg: number;
  producto: string;
  location: string;
  user: string;
  fecha: string;
  updated?: boolean;
}

export function useStockMovements() {
  const [movements, setMovements] = useState<StockMovement[]>([]);

  useEffect(() => {
    const q = query(collection(db, 'stock_movements'), orderBy('fecha', 'desc'));

    const unsubscribe = onSnapshot(q, (snapshot) => {
      snapshot.docChanges().forEach((change) => {
        const data = change.doc.data() as StockMovement;

        if (change.type === 'added') {
          setMovements((prev) => {
            const exists = prev.find((m) => m.movementId === data.movementId);
            return exists ? prev : [data, ...prev];
          });
        }

        if (change.type === 'modified') {
          setMovements((prev) =>
            prev.map((m) =>
              m.movementId === data.movementId ? { ...m, ...data } : m
            )
          );
        }
      });
    });

    return () => unsubscribe();
  }, []);

  return movements;
}
