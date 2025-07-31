# Firebase Cloud Functions – Rental Property App

This directory contains backend functions for notifications.

## emailTourRequest
Triggered when a **tour** document is created under:
```
/properties/{propId}/tours/{tourId}
```
Sends an email via Resend to the admin.

### Setup
```
cd functions
npm install
firebase functions:secrets:set RESEND_API_KEY
firebase deploy --only functions
```
Make sure `noreply@joelmbaka.site` is verified on Resend.
