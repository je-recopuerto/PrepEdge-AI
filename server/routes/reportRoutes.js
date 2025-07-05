import express from "express";
import Report from "../models/ReportModel.js";
import firebaseAuthMiddleware from "../middleware/firebaseAuthMiddleware.js";
import User from "../models/UserModel.js";

const router = express.Router();

router.get("/:interviewId", async (req, res) => {
  const report = await Report.findOne({ interviewId: req.params.interviewId });
  if (!report) {
    return res.status(404).json({ message: "Report not found" });
  }
  res.json(report);
});

router.get("/", firebaseAuthMiddleware, async(req, res) => {
  const decodedToken = req.firebaseUser;
  if (!decodedToken || !decodedToken.uid) {
    return res.status(401).json({ error: "Unauthorized" });
  }
  const user = await User.findOne({ firebase_user_id: decodedToken.uid });
  const reports = await Report.find({ userId: user._id || undefined })
			.populate("interviewId")
			.sort({ createdAt: -1 });
  res.json(reports);
});

export default router;