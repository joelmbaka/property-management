// eslint-disable-next-line @typescript-eslint/no-var-requires
const admin = require("firebase-admin");
// eslint-disable-next-line @typescript-eslint/no-var-requires
const serviceAccount = require("../property-management-app-fc397-firebase-adminsdk-fbsvc-0c7801ff13.json");

admin.initializeApp({ credential: admin.credential.cert(serviceAccount) });
const db = admin.firestore();

const ownerUid = "akIRk1XNgMgPFsIa88nmK9NlKIE2"; // <-- set your Firebase Auth UID here

const condos = ["nyali", "bamburi", "shanzu"];


async function main() {
  // Condos
  for (const name of condos) {
    const propRef = db.collection("properties").doc(name);
    await propRef.set({
      ownerUid,
      name: name.charAt(0).toUpperCase() + name.slice(1) + " Apartment",
      location: name,
      type: "apartment",
      createdAt: new Date(),
      updatedAt: new Date(),
    });

    // Blocks A & B, units 1-8 each
    for (const block of ["A", "B"]) {
      for (let num = 1; num <= 8; num++) {
        const unitId = `${block}${num}`;
        const odd = num % 2 === 1;
        await propRef.collection("units").doc(unitId).set({
          number: unitId,
          bedrooms: odd ? 2 : 3,
          bathrooms: odd ? 2 : 3,
          rent: odd ? 20000 : 30000,
          vacant: true,
        });
      }
    }
  }


  console.log("Seed complete");
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
