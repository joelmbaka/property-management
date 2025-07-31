import React, { useState } from 'react';
import {
  Modal,
  View,
  Text,
  TextInput,
  StyleSheet,
  Pressable,
  Platform,
  ScrollView,
} from 'react-native';
import DateTimePicker from '@react-native-community/datetimepicker';
import Constants from 'expo-constants';
import { AppButton } from './AppButton';
import { db } from '../lib/firebase';
import { addDoc, collection, serverTimestamp } from 'firebase/firestore';
import type { Unit } from './UnitCard';

interface Props {
  visible: boolean;
  onClose: () => void;
  propId: string;
  unit: Unit | null;
}

export const BookTourModal: React.FC<Props> = ({ visible, onClose, propId, unit }) => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [date, setDate] = useState<Date | null>(null);
  const [time, setTime] = useState<Date | null>(null);
  const [notes, setNotes] = useState('');
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [showTimePicker, setShowTimePicker] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const canSubmit =
    !!unit &&
    name.trim() &&
    email.trim() &&
    phone.trim() &&
    !submitting;

  const reset = () => {
    setName('');
    setEmail('');
    setPhone('');
    setDate(null);
    setTime(null);
    setNotes('');
  };

  const handleSubmit = async () => {
    if (!canSubmit || !unit) return;
    try {
      setSubmitting(true);
      let preferredIso: string | null = null;
      if (date) {
        const tourDate = new Date(date);
        if (time) {
          tourDate.setHours(time.getHours());
          tourDate.setMinutes(time.getMinutes());
        }
        preferredIso = tourDate.toISOString();
      }

      await addDoc(collection(db, 'properties', propId, 'tours'), {
        unitId: unit.id,
        unitNumber: unit.number,
        name: name.trim(),
        email: email.trim(),
        phone: phone.trim(),
        preferredDateTime: preferredIso,
        notes: notes.trim(),
        createdAt: serverTimestamp(),
      });

      // fire email via Vercel function (non-blocking & logged)
      const apiUrl = (Constants as any)?.expoConfig?.extra?.apiEndpoint ?? 'https://property-management-snowy-rho.vercel.app/api/book-tour';
      try {
        const emailRes = await fetch(apiUrl, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            propertyId: propId,
            unitNumber: unit.number,
            name: name.trim(),
            email: email.trim(),
            phone: phone.trim(),
            preferredDateTime: preferredIso,
            notes: notes.trim(),
          }),
        });
        console.log('Email function status', emailRes.status);
        const emailJson = await emailRes.json().catch(() => ({}));
        console.log('Email function response', emailJson);
      } catch (err) {
        console.error('Email API call failed', err);
      }
      


      reset();
      onClose();
      // In real app add Alert to confirm
    } catch (e) {
      console.error('Failed to save tour request', e);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Modal visible={visible} animationType="slide" onRequestClose={onClose} presentationStyle="pageSheet">
      <ScrollView contentContainerStyle={styles.container} keyboardShouldPersistTaps="handled">
        <Text style={styles.heading}>Book Tour – Unit {unit?.number}</Text>
        <TextInput
          placeholder="Name *"
          value={name}
          onChangeText={setName}
          style={styles.input}
        />
        <TextInput
          placeholder="Email *"
          keyboardType="email-address"
          autoCapitalize="none"
          value={email}
          onChangeText={setEmail}
          style={styles.input}
        />
        <TextInput
          placeholder="Phone *"
          keyboardType="phone-pad"
          value={phone}
          onChangeText={setPhone}
          style={styles.input}
        />
        {/* Date Picker */}
        <Pressable onPress={() => setShowDatePicker(true)} style={styles.pickerButton}>
          <Text style={styles.pickerText}>{date ? date.toDateString() : 'Select Date *'}</Text>
        </Pressable>
        {/* Time Picker */}
        <Pressable
          onPress={() => {
            if (!date) return;
            setShowTimePicker(true);
          }}
          style={styles.pickerButton}
        >
          <Text style={styles.pickerText}>{time ? time.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : 'Select Time *'}</Text>
        </Pressable>
        {showDatePicker && (
          <DateTimePicker
            mode="date"
            value={date || new Date()}
            onChange={(_, selected) => {
              setShowDatePicker(false);
              if (selected) setDate(selected as Date);
            }}
            minimumDate={new Date()}
          />
        )}
        {showTimePicker && (
          <DateTimePicker
            mode="time"
            value={time || new Date()}
            onChange={(_, selected) => {
              setShowTimePicker(false);
              if (selected) setTime(selected as Date);
            }}
          />
        )}
        <TextInput
          placeholder="Additional details (optional)"
          value={notes}
          onChangeText={setNotes}
          style={[styles.input, { height: 100 }]}
          multiline
        />
        <AppButton title="Submit" disabled={!canSubmit} onPress={handleSubmit} style={{ marginTop: 12 }} />
        <AppButton title="Cancel" variant="secondary" onPress={onClose} style={{ marginTop: 8 }} />
      </ScrollView>
    </Modal>
  );
};

const styles = StyleSheet.create({
  container: {
    padding: 20,
  },
  heading: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 16,
  },
  input: {
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 6,
    padding: 10,
    marginBottom: 12,
  },
  pickerButton: {
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 6,
    padding: 12,
    marginBottom: 12,
  },
  pickerText: {
    color: '#555',
  },
});
