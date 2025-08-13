import Stripe from "stripe";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY, {
  apiVersion: "2023-10-16",
});

const ALLOW_ORIGIN = process.env.CORS_ORIGIN || '*';

export default async function handler(req, res) {
  // CORS preflight
  if (req.method === 'OPTIONS') {
    res.setHeader('Access-Control-Allow-Origin', ALLOW_ORIGIN);
    res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
    return res.status(200).end();
  }
  if (req.method !== "POST") {
    res.setHeader('Access-Control-Allow-Origin', ALLOW_ORIGIN);
    res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
    res.setHeader("Allow", "POST");
    return res.status(405).json({ error: "Method not allowed" });
  }

  const { propId, unitId, unitNumber, amount, uid } = req.body || {};
  if (!unitId || !amount || !uid) {
    return res.status(400).json({ error: "Missing parameters" });
  }

  try {
    const session = await stripe.checkout.sessions.create({
      mode: "payment",
      line_items: [
        {
          price_data: {
            currency: "kes",
            unit_amount: amount,
            product_data: {
              name: `Rent payment for unit ${unitNumber ?? unitId}`,
            },
          },
          quantity: 1,
        },
      ],
      success_url: `${process.env.APP_SCHEME || "propertyapp"}://checkout-success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${process.env.APP_SCHEME || "propertyapp"}://checkout-cancel`,
      metadata: {
        uid,
        unitId,
        unitNumber: unitNumber || "",
        rent: String(amount / 100),
      }
    });

    res.setHeader('Access-Control-Allow-Origin', ALLOW_ORIGIN);
    return res.status(200).json({ url: session.url });
  } catch (err) {
    console.error("Stripe error", err);
    res.setHeader('Access-Control-Allow-Origin', ALLOW_ORIGIN);
    return res.status(500).json({ error: "Stripe session creation failed" });
  }
}
