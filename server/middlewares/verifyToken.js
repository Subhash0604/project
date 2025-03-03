import admin from "../firebase.js";

export const verifyToken = async (req, res, next) => {
  const authHeader = req.headers.authorization;

  if (!authHeader) {
    return res.status(401).json({ error: "Unauthorized NO token" });
  }

  const idToken = authHeader.split(" ")[1];
  console.log(idToken);
  try {
    const decodedToken = await admin.auth().verifyIdToken(idToken);
    req.user = decodedToken;
    if (req.body.name) {
      req.user.name = req.body.name;
    }
    if (req.body.photoURL) {
      req.user.photoURL = req.body.photoURL;
    } else {
      req.user.photoURL = decodedToken.picture;
    }

    next();
  } catch (error) {
    console.error("Token verification failed:", error);
    return res.status(401).json({ error: "Unauthorized" });
  }
};
