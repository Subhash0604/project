import admin from "../firebase.js";

export const verifyToken = async (req, res, next) => {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return res
      .status(401)
      .json({ error: "Unauthorized: No valid token provided" });
  }

  const idToken = authHeader.split(" ")[1];

  console.log(idToken);

  try {
    const decodedToken = await admin.auth().verifyIdToken(idToken);

    req.user = decodedToken;
    req.user.name = req.body.name || decodedToken.name;
    req.user.photoURL = req.body.photoURL || decodedToken.picture;

    next();
  } catch (error) {
    console.error("Token verification failed:", error);
    return res.status(401).json({ error: "Unauthorized: Invalid token" });
  }
};
