import express from "express";
import Report from "../models/ReportModel.js";

const router = express.Router();

router.get("/:interviewId", async (req, res) => {
  console.log("Fetching report for interviewId:", req.params.interviewId);
  const report = await Report.findOne({ interviewId: req.params.interviewId });
  if (!report) {
    return res.status(404).json({ message: "Report not found" });
  }
  res.json(report);
});

export default router;