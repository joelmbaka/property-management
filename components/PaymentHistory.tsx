import React, { useEffect, useState } from 'react';
import { FlatList, Text, View } from 'react-native';
import { db } from '../lib/firebase';
import { collection, query, where, orderBy, onSnapshot } from 'firebase/firestore';
import { useAuth } from '../lib/AuthProvider';

interface Payment {
  id: string;
  unitNumber: string;
  amount: number;
  months: number;
  createdAt: any;
}

export const PaymentHistory: React.FC = () => {
  const { user } = useAuth();
  const [payments, setPayments] = useState<Payment[]>([]);

  useEffect(() => {
    if (!user) return;
    const q = query(
      collection(db, 'payments'),
      where('uid', '==', user.uid),
      orderBy('createdAt', 'desc'),
    );
    const unsub = onSnapshot(q, (snap) => {
      setPayments(snap.docs.map((d) => ({ id: d.id, ...(d.data() as any) })) as any);
    });
    return unsub;
  }, [user]);

  if (!user) return null;

  return (
    <View style={{ width: '100%' }}>
      <Text style={{ fontWeight: 'bold', fontSize: 16, marginBottom: 8 }}>Payment History</Text>
      <FlatList
        data={payments}
        keyExtractor={(p) => p.id}
        renderItem={({ item }) => (
          <View style={{ paddingVertical: 8 }}>
            <Text>Unit {item.unitNumber}</Text>
            <Text>Amount: KES {item.amount.toLocaleString()} (for {item.months} month(s))</Text>
            <Text>Date: {new Date(item.createdAt?.toDate?.() ?? item.createdAt).toLocaleDateString()}</Text>
          </View>
        )}
        ListEmptyComponent={<Text>No payments yet.</Text>}
      />
    </View>
  );
};
