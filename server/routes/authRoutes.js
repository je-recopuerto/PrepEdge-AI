import express from "express";
import User from "../models/UserModel.js";
import firebaseAuthMiddleware from "../middleware/firebaseAuthMiddleware.js";

const router = express.Router();
router.use(express.json());

router.post("/register", firebaseAuthMiddleware, async (req, res) => {
	const { uid, email, name } = req.firebaseUser;

	try {
		let user = await User.findOne({ firebase_user_id: uid });

		if (!user) {
			user = new User({
				firebase_user_id: uid,
				email,
				name: name || "Anonymous",
				tier: "basic",
			});
			await user.save();
		}

		res.status(200).json({ message: "Registration successful", user });
	} catch (err) {
		res.status(500).json({ error: err.message });
	}
});

router.post("/login", firebaseAuthMiddleware, async (req, res) => {
	const { uid } = req.firebaseUser;

	try {
		let user = await User.findOne({ firebase_user_id: uid });
		if (!user) return res.status(404).json({ error: "User not found" });
		res.status(200).json({ message: "Login successful", user });
	} catch (err) {
		return res.status(500).json({ error: err.message });
	}
});

export default router;