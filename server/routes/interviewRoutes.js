/*
 * @license MIT License
 * Copyright (c) 2025 Abhinav Mishra
 /*

import express from "express";
import Interview from "../models/InterviewModel.js";
import Report from "../models/ReportModel.js";
import User from "../models/UserModel.js";
import firebaseAuthMiddleware from "../middleware/firebaseAuthMiddleware.js";
import multer from "multer";
import cloudinary from "../utils/cloudinary.js";
import streamifier from "streamifier";
import pdfParse from "pdf-parse";
import {
	summarizeResumeText,
	generateQuestions,
	analyzeAnswer,
	interviewSummary,
} from "../services/aiService.js";

const upload = multer({ storage: multer.memoryStorage() });
const router = express.Router();

router.post(
	"/setup",
	firebaseAuthMiddleware,
	upload.single("resume"),
	async (req, res) => {
		try {
			if (!req.body || !req.body.interviewName) {
				return res
					.status(400)
					.json({ error: "Incomplete form submission" });
			}
			const {
				interviewName,
				numOfQuestions,
				interviewType,
				role,
				experienceLevel,
				companyName,
				companyDescription,
				jobDescription,
				focusAt,
			} = req.body;
			const firebaseUID = req.firebaseUser?.uid;
			const user = await User.findOne({ firebase_user_id: firebaseUID });
			if (!user) return res.status(404).json({ error: "User not found" });

			let resume_link = null;
			let resume_text = null;
			if (req.file && req.file.buffer) {
				const streamUpload = () =>
					new Promise((resolve, reject) => {
						const stream = cloudinary.uploader.upload_stream(
							{
								resource_type: "raw",
								folder: "prepEdge/resumes",
							},
							(error, result) => {
								if (error) return reject(error);
								resolve(result);
							}
						);
						streamifier
							.createReadStream(req.file.buffer)
							.pipe(stream);
					});

				try {
					const result = await streamUpload();
					resume_link = result.secure_url;
				} catch (uploadErr) {
					return res
						.status(500)
						.json({ error: "Cloudinary upload failed" });
				}
				const pdfData = await pdfParse(req.file.buffer);
				resume_text = pdfData.text.slice(0, 4000);
			}

			let resumeSummary = null;
			if (resume_text) {
				try {
					resumeSummary = await summarizeResumeText(resume_text);
				} catch (err) {
					return res
						.status(500)
						.json({ error: "Resume summarization failed" });
				}
			}

			let questions;
			try {
				questions = await generateQuestions({
					num_of_questions: numOfQuestions,
					interview_type: interviewType,
					role,
					experience_level: experienceLevel,
					company_name: companyName,
					company_description: companyDescription,
					job_description: jobDescription,
					focus_area: focusAt,
				});
			} catch (err) {
				return res
					.status(500)
					.json({ error: "Question generation failed" });
			}

			if (!questions || questions.length === 0) {
				return res
					.status(400)
					.json({ error: "Failed to generate questions" });
			}

			const interview = new Interview({
				user_id: user._id,
				interview_name: interviewName,
				num_of_questions: numOfQuestions,
				interview_type: interviewType.toLowerCase(),
				role,
				experience_level: experienceLevel.toLowerCase(),
				company_name: companyName,
				company_description: companyDescription,
				job_description: jobDescription,
				resume_link,
				focus_area: focusAt,
				questions,
			});
			await interview.save();

			res.status(201).json({
				message: "Interview setup successfully",
				interview,
			});
		} catch (err) {
			res.status(500).json({ error: "Failed to set up interview" });
		}
	}
);

router.get("/:interviewId", async (req, res) => {
	const interview = await Interview.findById(req.params.interviewId);
	res.json(interview);
});

router.post("/:interviewId/answer", async (req, res) => {
	const { questionId, answer } = req.body;
	const interview = await Interview.findById(req.params.interviewId);
	const question = interview.questions[questionId];

	// Analyze user's answer using AI
	const { score, feedback } = await analyzeAnswer({
		question: question.question,
		userAnswer: answer,
		preferredAnswer: question.preferred_answer,
		role: interview.role,
		experience_level: interview.experience_level,
		interview_type: interview.interview_type,
	});

	// create or update the report
	let report = await Report.findOne({ interviewId: req.params.interviewId });
	if (!report) {
		report = new Report({
			interviewId: req.params.interviewId,
			userId: interview.user_id,
			answers: [],
		});
	}

	// Add the answers' analysis to the report
	report.answers.push({
		question: question.question,
		userAnswer: answer,
		preferredAnswer: question.preferred_answer,
		score,
		feedback,
	});

	// if all answers are analyzed, calculate final score and summary
	const totalQuestions = interview.num_of_questions;
	const totalAnswered = report.answers.length;
	if (totalAnswered === totalQuestions) {
		// Final Score
		const avgScore =
			report.answers.reduce((sum, ans) => sum + ans.score, 0) /
			report.answers.length;

		// Generate overall summary, strengths, and areas of improvement
		const combinedFeedback = report.answers
			.map((a) => a.feedback)
			.join("\n");
		const summaryText = await interviewSummary(combinedFeedback);

		const extractSection = (label) => {
			const match = summaryText.match(
				new RegExp(
					`\\*\\*${label}:\\*\\*\\s*([\\s\\S]*?)(?=\\*\\*|$)`,
					"i"
				)
			);
			return match ? match[1].trim() : "";
		};

		const overall = extractSection("Overall Summary");
		const strengths = extractSection("Strengths");
		const areas = extractSection("Areas of Improvement");

		// Update report with final score, strengths, areas of improvement, and summary
		report.finalScore = avgScore.toFixed(2);
		report.strengths = strengths;
		report.areaOfImprovement = areas;
		report.summary = overall;
	}

	await report.save();
	res.status(201).json({ success: true });
});

router.get("/", firebaseAuthMiddleware, async (req, res) => {
	const decodedToken = req.firebaseUser;
	if (!decodedToken || !decodedToken.uid) {
		return res.status(401).json({ error: "Unauthorized" });
	}
	const user = await User.findOne({
		firebase_user_id: decodedToken.uid,
	});
	const interviews = await Interview.find({ user_id: user._id });
	res.json(interviews);
});

export default router;


*/


/*
 * @license MIT License
 * Copyright (c) 2025 Abhinav Mishra
 */

// import express from "express";
// import Interview from "../models/InterviewModel.js";
// import Report from "../models/ReportModel.js";
// import User from "../models/UserModel.js";
// import firebaseAuthMiddleware from "../middleware/firebaseAuthMiddleware.js";
// import multer from "multer";
// import cloudinary from "../utils/cloudinary.js";
// import streamifier from "streamifier";
// import pdfParse from "pdf-parse";
// import mongoose from "mongoose";
// import {
// 	summarizeResumeText,
// 	generateQuestions,
// 	analyzeAnswer,
// 	interviewSummary,
// } from "../services/aiService.js";

// const upload = multer({ storage: multer.memoryStorage() });
// const router = express.Router();

// /**
//  * Helper: Cloudinary upload from buffer
 
// */

// const streamUpload = (fileBuffer) => {
// 	return new Promise((resolve, reject) => {
// 		const stream = cloudinary.uploader.upload_stream(
// 			{
// 				resource_type: "raw",
// 				folder: "prepEdge/resumes",
// 			},
// 			(error, result) => {
// 				if (error) return reject(error);
// 				resolve(result);
// 			}
// 		);
// 		streamifier.createReadStream(fileBuffer).pipe(stream);
// 	});
// };

// /**
//  * POST /setup
//  * Setup an interview with generated questions
//  */
// // router.post(
// // 	"/setup",
// // 	firebaseAuthMiddleware,
// // 	upload.single("resume"),
// // 	async (req, res) => {
// // 		try {
// // 			// Basic form validation
// // 			if (!req.body?.interviewName) {
// // 				return res.status(400).json({ error: "Incomplete form submission" });
// // 			}

// // 			const {
// // 				interviewName,
// // 				numOfQuestions,
// // 				interviewType,
// // 				role,
// // 				experienceLevel,
// // 				companyName,
// // 				companyDescription,
// // 				jobDescription,
// // 				focusAt,
// // 			} = req.body;

// // 			const firebaseUID = req.firebaseUser?.uid;
// // 			const user = await User.findOne({ firebase_user_id: firebaseUID });
// // 			if (!user) {
// // 				return res.status(404).json({ error: "User not found" });
// // 			}

// // 			// Handle resume upload & text extraction
// // 			let resume_link = null;
// // 			let resume_text = null;

// // 			if (req.file?.buffer) {
// // 				try {
// // 					const result = await streamUpload(req.file.buffer);
// // 					resume_link = result.secure_url;

// // 					const pdfData = await pdfParse(req.file.buffer);
// // 					resume_text = pdfData.text.slice(0, 4000); // Limit to avoid token overflow
// // 				} catch (err) {
// // 					return res.status(500).json({ error: "Resume processing failed" });
// // 				}
// // 			}

// // 			// Summarize resume if text is available
// // 			let resumeSummary = null;
// // 			if (resume_text) {
// // 				try {
// // 					resumeSummary = await summarizeResumeText(resume_text);
// // 				} catch (err) {
// // 					return res
// // 						.status(500)
// // 						.json({ error: "Resume summarization failed" });
// // 				}
// // 			}

// // 			// Generate interview questions
// // 			let questions;
// // 			try {
// // 				questions = await generateQuestions({
// // 					num_of_questions: numOfQuestions,
// // 					interview_type: interviewType,
// // 					role,
// // 					experience_level: experienceLevel,
// // 					company_name: companyName,
// // 					company_description: companyDescription,
// // 					job_description: jobDescription,
// // 					focus_area: focusAt,
// // 				});
// // 			} catch (err) {
// // 				return res.status(500).json({ error: "Question generation failed" });
// // 			}

// // 			if (!questions || questions.length === 0) {
// // 				return res.status(400).json({ error: "Failed to generate questions" });
// // 			}

// // 			// Save interview
// // 			const interview = new Interview({
// // 				user_id: user._id,
// // 				interview_name: interviewName,
// // 				num_of_questions: numOfQuestions,
// // 				interview_type: interviewType.toLowerCase(),
// // 				role,
// // 				experience_level: experienceLevel.toLowerCase(),
// // 				company_name: companyName,
// // 				company_description: companyDescription,
// // 				job_description: jobDescription,
// // 				resume_link,
// // 				focus_area: focusAt,
// // 				questions,
// // 			});

// // 			await interview.save();

// // 			return res.status(201).json({
// // 				message: "Interview setup successfully",
// // 				interview,
// // 				resumeSummary, // Optional: return summary for client display
// // 			});
// // 		} catch (err) {
// // 			console.error(err);
// // 			return res.status(500).json({ error: "Failed to set up interview" });
// // 		}
// // 	}
// // );

// router.post(
//   "/setup",
//   // firebaseAuthMiddleware,  <-- comment this out temporarily
//   upload.single("resume"),
//   async (req, res) => {
//     try {
//       // Instead of using req.firebaseUser.uid, hardcode a known user UID here:
//       const dummyFirebaseUID = "bhA6RP7qDWcXfmtkbyjtqoP4LoQ2";

//       // Find user by dummy UID instead of req.firebaseUser.uid
//       const user = await User.findOne({ firebase_user_id: dummyFirebaseUID });
//       if (!user) {
//         return res.status(404).json({ error: "User not found" });
//       }

//       // Now rest of your code stays the same...

//       // For example:
//       const { interviewName, numOfQuestions, interviewType, role, experienceLevel, companyName, companyDescription, jobDescription, focusAt } = req.body;

//       // ... etc.

//       // Return success response as usual
//     } catch (err) {
//       console.error(err);
//       return res.status(500).json({ error: "Failed to set up interview" });
//     }
//   }
// );



// /**
//  * GET /:interviewId
//  * Get interview details
//  */
// router.get("/:interviewId", async (req, res) => {
// 	try {
// 		if (!mongoose.Types.ObjectId.isValid(req.params.interviewId)) {
// 			return res.status(400).json({ error: "Invalid interview ID" });
// 		}

// 		const interview = await Interview.findById(req.params.interviewId);
// 		if (!interview) {
// 			return res.status(404).json({ error: "Interview not found" });
// 		}

// 		return res.json(interview);
// 	} catch (err) {
// 		return res.status(500).json({ error: "Failed to fetch interview" });
// 	}
// });

// /**
//  * POST /:interviewId/answer
//  * Submit answer for a question and analyze
//  */
// router.post("/:interviewId/answer", async (req, res) => {
// 	try {
// 		const { questionId, answer } = req.body;

// 		if (!mongoose.Types.ObjectId.isValid(req.params.interviewId)) {
// 			return res.status(400).json({ error: "Invalid interview ID" });
// 		}

// 		if (typeof questionId !== "number" || !answer) {
// 			return res.status(400).json({ error: "Invalid question or answer" });
// 		}

// 		const interview = await Interview.findById(req.params.interviewId);
// 		if (!interview) {
// 			return res.status(404).json({ error: "Interview not found" });
// 		}

// 		if (questionId < 0 || questionId >= interview.questions.length) {
// 			return res.status(400).json({ error: "Question index out of range" });
// 		}

// 		const question = interview.questions[questionId];

// 		// Analyze answer
// 		const { score, feedback } = await analyzeAnswer({
// 			question: question.question,
// 			userAnswer: answer,
// 			preferredAnswer: question.preferred_answer,
// 			role: interview.role,
// 			experience_level: interview.experience_level,
// 			interview_type: interview.interview_type,
// 		});

// 		// Find or create report
// 		let report = await Report.findOne({ interviewId: req.params.interviewId });
// 		if (!report) {
// 			report = new Report({
// 				interviewId: req.params.interviewId,
// 				userId: interview.user_id,
// 				answers: [],
// 			});
// 		}

// 		// Save answer analysis
// 		report.answers.push({
// 			question: question.question,
// 			userAnswer: answer,
// 			preferredAnswer: question.preferred_answer,
// 			score,
// 			feedback,
// 		});

// 		// If all answers done → Final summary
// 		if (report.answers.length === interview.num_of_questions) {
// 			const avgScore =
// 				report.answers.reduce((sum, ans) => sum + ans.score, 0) /
// 				report.answers.length;

// 			const combinedFeedback = report.answers
// 				.map((a) => a.feedback)
// 				.join("\n");

// 			const summaryText = await interviewSummary(combinedFeedback);

// 			const extractSection = (label) => {
// 				const match = summaryText.match(
// 					new RegExp(`\\*\\*${label}:\\*\\*\\s*([\\s\\S]*?)(?=\\*\\*|$)`, "i")
// 				);
// 				return match ? match[1].trim() : "";
// 			};

// 			report.finalScore = avgScore.toFixed(2);
// 			report.strengths = extractSection("Strengths");
// 			report.areaOfImprovement = extractSection("Areas of Improvement");
// 			report.summary = extractSection("Overall Summary");
// 		}

// 		await report.save();
// 		return res.status(201).json({ success: true });
// 	} catch (err) {
// 		console.error(err);
// 		return res.status(500).json({ error: "Failed to submit answer" });
// 	}
// });

// /**
//  * GET /
//  * Get all interviews for logged-in user
//  */
// router.get("/", firebaseAuthMiddleware, async (req, res) => {
// 	try {
// 		const decodedToken = req.firebaseUser;
// 		if (!decodedToken?.uid) {
// 			return res.status(401).json({ error: "Unauthorized" });
// 		}

// 		const user = await User.findOne({
// 			firebase_user_id: decodedToken.uid,
// 		});
// 		if (!user) {
// 			return res.status(404).json({ error: "User not found" });
// 		}

// 		const interviews = await Interview.find({ user_id: user._id });
// 		return res.json(interviews);
// 	} catch (err) {
// 		return res.status(500).json({ error: "Failed to fetch interviews" });
// 	}
// });

// export default router;


import express from "express";
import Interview from "../models/InterviewModel.js";
import Report from "../models/ReportModel.js";
import User from "../models/UserModel.js";
import firebaseAuthMiddleware from "../middleware/firebaseAuthMiddleware.js";
import multer from "multer";
import cloudinary from "../utils/cloudinary.js";
import streamifier from "streamifier";
import pdfParse from "pdf-parse";
import mongoose from "mongoose";
import {
  summarizeResumeText,
  generateQuestions,
  analyzeAnswer,
  interviewSummary,
} from "../services/aiService.js";

const upload = multer({ storage: multer.memoryStorage() });
const router = express.Router();

/**
 * Helper: Cloudinary upload from buffer
 */
const streamUpload = (fileBuffer) => {
  return new Promise((resolve, reject) => {
    const stream = cloudinary.uploader.upload_stream(
      {
        resource_type: "raw",
        folder: "prepEdge/resumes",
      },
      (error, result) => {
        if (error) return reject(error);
        resolve(result);
      }
    );
    streamifier.createReadStream(fileBuffer).pipe(stream);
  });
};

/**
 * POST /setup
 * Setup an interview with generated questions
 */
router.post(
  "/setup",
  // firebaseAuthMiddleware,  <-- comment this out temporarily or enable when ready
  upload.single("resume"),
  async (req, res) => {
    try {
      // Instead of using req.firebaseUser.uid, hardcode a known user UID here:
      const dummyFirebaseUID = "bhA6RP7qDWcXfmtkbyjtqoP4LoQ2";

      // Find user by dummy UID instead of req.firebaseUser.uid
      const user = await User.findOne({ firebase_user_id: dummyFirebaseUID });
      if (!user) {
        return res.status(404).json({ error: "User not found" });
      }

      const {
        interviewName,
        numOfQuestions,
        interviewType,
        role,
        experienceLevel,
        companyName,
        companyDescription,
        jobDescription,
        focusAt,
      } = req.body;

      // Handle resume upload & text extraction
      let resume_link = null;
      let resume_text = null;

      if (req.file?.buffer) {
        try {
          const result = await streamUpload(req.file.buffer);
          resume_link = result.secure_url;

          const pdfData = await pdfParse(req.file.buffer);
          resume_text = pdfData.text.slice(0, 4000); // Limit to avoid token overflow
        } catch (err) {
          return res.status(500).json({ error: "Resume processing failed" });
        }
      }

      // Summarize resume if text is available
      let resumeSummary = null;
      if (resume_text) {
        try {
          resumeSummary = await summarizeResumeText(resume_text);
        } catch (err) {
          return res.status(500).json({ error: "Resume summarization failed" });
        }
      }

      // Generate interview questions
      let questions;
      try {
        questions = await generateQuestions({
          num_of_questions: numOfQuestions,
          interview_type: interviewType,
          role,
          experience_level: experienceLevel,
          company_name: companyName,
          company_description: companyDescription,
          job_description: jobDescription,
          focus_area: focusAt,
        });
      } catch (err) {
        return res.status(500).json({ error: "Question generation failed" });
      }

      if (!questions || questions.length === 0) {
        return res.status(400).json({ error: "Failed to generate questions" });
      }

      // Save interview
      const interview = new Interview({
        user_id: user._id,
        interview_name: interviewName,
        num_of_questions: numOfQuestions,
        interview_type: interviewType.toLowerCase(),
        role,
        experience_level: experienceLevel.toLowerCase(),
        company_name: companyName,
        company_description: companyDescription,
        job_description: jobDescription,
        resume_link,
        focus_area: focusAt,
        questions,
      });

      await interview.save();

      return res.status(201).json({
        message: "Interview setup successfully",
        interview,
        resumeSummary, // Optional: return summary for client display
      });
    } catch (err) {
      console.error(err);
      return res.status(500).json({ error: "Failed to set up interview" });
    }
  }
);

/**
 * GET /:interviewId
 * Get interview details
 */
router.get("/:interviewId", async (req, res) => {
  try {
    if (!mongoose.Types.ObjectId.isValid(req.params.interviewId)) {
      return res.status(400).json({ error: "Invalid interview ID" });
    }

    const interview = await Interview.findById(req.params.interviewId);
    if (!interview) {
      return res.status(404).json({ error: "Interview not found" });
    }

    return res.json(interview);
  } catch (err) {
    return res.status(500).json({ error: "Failed to fetch interview" });
  }
});

/**
 * POST /:interviewId/answer
 * Submit answer for a question and analyze
 */
router.post("/:interviewId/answer", async (req, res) => {
  try {
    const { questionId, answer } = req.body;

    if (!mongoose.Types.ObjectId.isValid(req.params.interviewId)) {
      return res.status(400).json({ error: "Invalid interview ID" });
    }

    if (typeof questionId !== "number" || !answer) {
      return res.status(400).json({ error: "Invalid question or answer" });
    }

    const interview = await Interview.findById(req.params.interviewId);
    if (!interview) {
      return res.status(404).json({ error: "Interview not found" });
    }

    if (questionId < 0 || questionId >= interview.questions.length) {
      return res.status(400).json({ error: "Question index out of range" });
    }

    const question = interview.questions[questionId];

    // Analyze answer
    const { score, feedback } = await analyzeAnswer({
      question: question.question,
      userAnswer: answer,
      preferredAnswer: question.preferred_answer,
      role: interview.role,
      experience_level: interview.experience_level,
      interview_type: interview.interview_type,
    });

    // Find or create report
    let report = await Report.findOne({ interviewId: req.params.interviewId });
    if (!report) {
      report = new Report({
        interviewId: req.params.interviewId,
        userId: interview.user_id,
        answers: [],
      });
    }

    // Save answer analysis
    report.answers.push({
      question: question.question,
      userAnswer: answer,
      preferredAnswer: question.preferred_answer,
      score,
      feedback,
    });

    // If all answers done → Final summary
    if (report.answers.length === interview.num_of_questions) {
      const avgScore =
        report.answers.reduce((sum, ans) => sum + ans.score, 0) /
        report.answers.length;

      const combinedFeedback = report.answers
        .map((a) => a.feedback)
        .join("\n");

      const summaryText = await interviewSummary(combinedFeedback);

      const extractSection = (label) => {
        const match = summaryText.match(
          new RegExp(`\\*\\*${label}:\\*\\*\\s*([\\s\\S]*?)(?=\\*\\*|$)`, "i")
        );
        return match ? match[1].trim() : "";
      };

      report.finalScore = avgScore.toFixed(2);
      report.strengths = extractSection("Strengths");
      report.areaOfImprovement = extractSection("Areas of Improvement");
      report.summary = extractSection("Overall Summary");
    }

    await report.save();
    return res.status(201).json({ success: true });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: "Failed to submit answer" });
  }
});

/**
 * GET /
 * Get all interviews for logged-in user
 */
router.get("/", firebaseAuthMiddleware, async (req, res) => {
  try {
    const decodedToken = req.firebaseUser;
    if (!decodedToken?.uid) {
      return res.status(401).json({ error: "Unauthorized" });
    }

    const user = await User.findOne({
      firebase_user_id: decodedToken.uid,
    });
    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    const interviews = await Interview.find({ user_id: user._id });
    return res.json(interviews);
  } catch (err) {
    return res.status(500).json({ error: "Failed to fetch interviews" });
  }
});

export default router;
