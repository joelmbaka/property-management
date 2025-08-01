import { Resend } from 'resend';
import { Expo } from 'expo-server-sdk';
import { getApps, initializeApp, cert } from 'firebase-admin/app';
import { getFirestore } from 'firebase-admin/firestore';

export default async function handler(req, res) {
  // CORS
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  if (req.method === 'OPTIONS') {
    return res.status(200).end(); // preflight
  }
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method Not Allowed' });
  }

  const {
    propertyId,
    unitNumber,
    name,
    email,
    phone,
    preferredDateTime,
    notes,
  } = req.body;

  if (!name || !email || !phone || !unitNumber) {
    return res.status(400).json({ error: 'Missing required fields' });
  }

  const resend = new Resend(process.env.RESEND_API_KEY);

  const dateStr = preferredDateTime ? new Date(preferredDateTime).toLocaleString() : 'Not specified';

  const html = `
    <h2>New Tour Booking</h2>
    <p><strong>Property:</strong> ${propertyId}</p>
    <p><strong>Unit:</strong> ${unitNumber}</p>
    <p><strong>Name:</strong> ${name}</p>
    <p><strong>Email:</strong> ${email}</p>
    <p><strong>Phone:</strong> ${phone}</p>
    <p><strong>Date & Time:</strong> ${dateStr}</p>
    ${notes ? `<p><strong>Notes:</strong> ${notes}</p>` : ''}
  `;

  try {
    await resend.emails.send({
      from: 'noreply@joelmbaka.site',
      to: 'mbakajoe26@gmail.com',
      subject: 'New Tour Booking',
      html,
      reply_to: email,
    });

    // push notifications to all registered device tokens in Firestore
    try {
      // initialize admin SDK lazily
      if (!getApps().length) {
        initializeApp({
          credential: cert({
            projectId: process.env.FIREBASE_PROJECT_ID,
            clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
            privateKey: process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, '\n'),
          }),
        });
      }
      const adminDb = getFirestore();
      const snapshot = await adminDb.collection('deviceTokens').get();
      const tokens = snapshot.docs
        .map((d) => d.id)
        .filter((t) => Expo.isExpoPushToken(t));
      console.log('Device tokens fetched:', tokens);
      if (tokens.length) {
        const expo = new Expo();
        const messages = tokens.map((to) => ({
          to,
          sound: 'default',
          title: 'New Tour Booking',
          body: `${name} booked unit ${unitNumber}`,
          data: { propertyId, unitNumber, name },
        }));
        const receipts = await expo.sendPushNotificationsAsync(messages);
        console.log('Expo push receipts:', receipts);
      }
    } catch (pushErr) {
      console.error('Push notification error', pushErr);
    }
    return res.status(200).json({ ok: true });
    } catch (e) {
    console.error('Resend error', e);
    return res.status(500).json({ error: 'Failed to send email' });
  }
}
