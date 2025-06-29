import admin from "firebase-admin";

const firebaseAuthMiddleware = async (req, res, next) => {
  const idToken = req.headers.authorization?.split("Bearer ")[1];
  console.log("🔥 [Middleware] Received Token:", idToken);

  if (!idToken) {
    console.warn("⚠️ No token received in Authorization header");
    return res.status(401).json({ error: "Unauthorized: Token missing" });
  }

  try {
    const decodedToken = await admin.auth().verifyIdToken(idToken);
    console.log("✅ [Middleware] Token verified. UID:", decodedToken.uid);
    req.firebaseUser = decodedToken;
    next();
  } catch (err) {
     console.error("❌ [Middleware] Token verification failed:", err);
    console.error("Firebase Auth Middleware Error:", err);
    return res.status(401).json({ error: "Unauthorized: Invalid or Expired token" });
  }
};

export default firebaseAuthMiddleware;
