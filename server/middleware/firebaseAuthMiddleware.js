import admin from "firebase-admin";

const firebaseAuthMiddleware = async (req, res, next) => {
  const idToken = req.headers.authorization?.split("Bearer ")[1];

  if (!idToken) {
    return res.status(401).json({ error: "Unauthorized: Token missing" });
  }

  try {
    const decodedToken = await admin.auth().verifyIdToken(idToken);
    const fullUser = await admin.auth().getUser(decodedToken.uid); // ✅ Get full user info

    req.firebaseUser = {
      uid: decodedToken.uid,
      email: decodedToken.email,
      name: fullUser.displayName || "Anonymous", // ✅ Use displayName or fallback
    };

    next();
  } catch (err) {
    return res.status(401).json({ error: "Unauthorized: Invalid token" });
  }
};

export default firebaseAuthMiddleware;
