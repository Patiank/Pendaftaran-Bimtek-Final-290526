const { initializeApp } = require("firebase/app");
const { getFirestore, doc, getDoc } = require("firebase/firestore");
const firebaseConfig = require("./firebase-applet-config.json");

const app = initializeApp(firebaseConfig);
const db = getFirestore(app, firebaseConfig.firestoreDatabaseId || "(default)");

async function inspect() {
  try {
    const docSnap = await getDoc(doc(db, "settings", "default"));
    if (docSnap.exists()) {
      console.log("===DATA_START===");
      console.log(JSON.stringify(docSnap.data()));
      console.log("===DATA_END===");
    } else {
      console.log("No default settings found.");
    }
    process.exit(0);
  } catch (e) {
    console.error("Error:", e.message);
    process.exit(1);
  }
}

inspect();
