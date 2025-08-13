import Stripe from "stripe";
import { buffer } from "micro";
import { cert, getApps, initializeApp } from "firebase-admin/app";
import { getFirestore, FieldValue } from "firebase-admin/firestore";

// Disables the default body parser so we can access raw body for Stripe signature check
export const config = {
  api: {
    bodyParser: false,
  },
};

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY, {
  apiVersion: "2023-10-16",
});

export default async function handler(req, res) {
  if (req.method !== "POST") {
    res.setHeader("Allow", "POST");
    return res.status(405).end("Method Not Allowed");
  }

  const sig = req.headers["stripe-signature"];
  if (!sig) return res.status(400).send("Missing stripe signature");

  let event;
  try {
    const rawBody = await buffer(req);
    event = stripe.webhooks.constructEvent(
      rawBody.toString(),
      sig,
      process.env.STRIPE_WEBHOOK_SECRET
    );
  } catch (err) {
    console.error("Webhook signature verification failed:", err);
    return res.status(400).send(`Webhook Error: ${err.message}`);
  }

  if (event.type === "checkout.session.completed") {
    const session = event.data.object;
    const metadata = session.metadata || {};

    const uid = metadata.uid;
    const propId = metadata.propId || "";
    const unitId = metadata.unitId;
    const unitNumber = metadata.unitNumber || "";
    const rent = Number(metadata.rent) || 0; // monthly rent
    const amount = session.amount_total / 100; // in KES

    // months paid = amount / rent (rounded)
    const months = rent ? Math.round(amount / rent) : 1;

    try {
      if (!getApps().length) {
        initializeApp({
          credential: cert({
            projectId: process.env.FIREBASE_PROJECT_ID,
            clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
            privateKey: process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, "\n"),
          }),
        });
      }
      const adminDb = getFirestore();

      // store payment record
      await adminDb.collection("payments").add({
        uid,
        propId,
        unitId,
        unitNumber,
        amount,
        months,
        createdAt: FieldValue.serverTimestamp(),
      });

      // accumulate months paid for unit
      const paymentsSnap = await adminDb
        .collection("payments")
        .where("unitId", "==", unitId)
        .get();
      const totalMonths = paymentsSnap.docs.reduce((sum, d) => sum + (d.data().months || 0), 0);

      // fetch unit doc to check requirement
      const unitRef = adminDb.doc(`properties/${propId}/units/${unitId}`);
      const unitSnap = await unitRef.get();
      if (unitSnap.exists) {
        const unitData = unitSnap.data();
        const requiredMonths = unitData.requiredMonths ?? 6; // default 6
        if (totalMonths >= requiredMonths) {
          await unitRef.update({ vacant: false });
        }
      }
    } catch (err) {
      console.error("Failed to record payment", err);
    }
  }

  res.status(200).json({ received: true });
}
