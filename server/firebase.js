import admin from "firebase-admin";
import dotenv from "dotenv";
import fs from "fs";

dotenv.config();

const credentialsPath = process.env.GOOGLE_APPLICATION_CREDENTIALS;

if (!credentialsPath) {
  throw new Error("GOOGLE_APPLICATION_CREDENTIALS is not set in the environment variables.");
}
let serviceAccount;
try {
  if (credentialsPath.startsWith("{")) {
    serviceAccount = JSON.parse(credentialsPath);
  } else {
    serviceAccount = JSON.parse(fs.readFileSync(credentialsPath, "utf-8"));
  }
} catch (error) {
  console.error("Error parsing GOOGLE_APPLICATION_CREDENTIALS:", error.message);
  process.exit(1);
}

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
});

export default admin;
