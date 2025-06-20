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

		res.json({ user });
	} catch (err) {
		res.status(500).json({ error: err.message });
	}
});

export default router;