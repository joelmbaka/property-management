import { Resend } from 'resend';

export default async function handler(req, res) {
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
    return res.status(200).json({ ok: true });
  } catch (e) {
    console.error('Resend error', e);
    return res.status(500).json({ error: 'Failed to send email' });
  }
}
