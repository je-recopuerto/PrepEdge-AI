import mongoose from "mongoose";
const reportSchema = new mongoose.Schema({
  interviewId: { type: mongoose.Schema.Types.ObjectId, ref: "Interview", required: true },
  userId: { type: String, required: true },
  answers: [
    {
      question: String,
      userAnswer: String,
      preferredAnswer: String,
      score: Number,
      feedback: String,
    },
  ],
  finalScore: Number,
  summary: String,
  areaOfImprovement: String,
  strengths: String,
  createdAt: { type: Date, default: Date.now },
});

const Report = mongoose.model("Report", reportSchema);

export default Report;