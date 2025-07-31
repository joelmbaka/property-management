const functions = require("firebase-functions/v2");
const admin = require("firebase-admin");
const { Resend } = require("resend");

admin.initializeApp();
const resend = new Resend(functions.config().resend.key);

exports.emailTourRequest = functions.firestore
  .document("properties/{propId}/tours/{tourId}")
  .onCreate(async (snap, context) => {
    const data = snap.data();
    const { propId } = context.params;

    const html = `
      <h2>New Tour Booking</h2>
      <p><strong>Property:</strong> ${propId}</p>
      <p><strong>Unit:</strong> ${data.unitNumber}</p>
      <p><strong>Name:</strong> ${data.name}</p>
      <p><strong>Email:</strong> ${data.email}</p>
      <p><strong>Phone:</strong> ${data.phone}</p>
      <p><strong>Date & Time:</strong> ${new Date(data.preferredDateTime).toLocaleString()}</p>
      ${data.notes ? `<p><strong>Notes:</strong> ${data.notes}</p>` : ""}
    `;

    await resend.emails.send({
      from: "noreply@joelmbaka.site",
      to: "mbakajoe26@gmail.com",
      subject: "New Tour Booking",
      html,
      reply_to: data.email,
    });
  });
