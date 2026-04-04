const functions = require("firebase-functions");
const admin = require("firebase-admin");

admin.initializeApp();

exports.createTaskViewerUser = functions.https.onCall(async (data, context) => {

  // 🔐 MUST BE LOGGED IN
  if (!context.auth) {
    throw new functions.https.HttpsError("unauthenticated", "Not logged in");
  }

  const uid = context.auth.uid;

  // 🔐 CHECK IF ADMIN
  const snap = await admin.database().ref("config/taskviewUsers/admin").once("value");

  let isAdmin = false;

  snap.forEach(child => {
    if (child.key === uid && child.val().active) {
      isAdmin = true;
    }
  });

  if (!isAdmin) {
    throw new functions.https.HttpsError("permission-denied", "Not admin");
  }

  const email = (data.email || "").toLowerCase();
  const password = data.password;
  const role = data.role; // "admin" or "viewer"

  if (!email || !password || !role) {
    throw new functions.https.HttpsError("invalid-argument", "Missing fields");
  }

  try {
    // ✅ CREATE AUTH USER
    const userRecord = await admin.auth().createUser({
      email,
      password
    });

    const newUid = userRecord.uid;

    // ✅ SAVE TO DB
    await admin.database().ref(`config/taskviewUsers/${role}/${newUid}`).set({
      email,
      active: true
    });

    return { success: true };

  } catch (err) {
    throw new functions.https.HttpsError("internal", err.message);
  }
});
