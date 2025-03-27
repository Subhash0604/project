import admin from "firebase-admin";
import dotenv from "dotenv";

dotenv.config();

const credentialsPath = process.env.GOOGLE_APPLICATION_CREDENTIALS;

const serviceAccount = JSON.parse(credentialsPath);

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
});

export default admin;
