import express from "express";
import Interview from "../models/InterviewModel.js";
import User from "../models/UserModel.js";
import firebaseAuthMiddleware from "../middleware/firebaseAuthMiddleware.js";
import multer from "multer";
import cloudinary from "../utils/cloudinary.js";
import streamifier from "streamifier";
import generateQuestions from "../services/aiService.js";

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
			// console.log("Received form data:", req.body);
			// console.log("Received file:", req.file?.originalname);
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
			if (req.file && req.file.buffer) {
				// console.log("Resume file detected, uploading to Cloudinary...");
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
					// console.log("-----------\nCloudinary upload succeeded:", resume_link, "\n-----------");
				} catch (uploadErr) {
					// console.error("-----------\nCloudinary upload failed:", uploadErr, "\n-----------");
					return res
						.status(500)
						.json({ error: "Cloudinary upload failed" });
				}
			}

			let questions;
			try {
				// console.log("----------\nGenerating questions...");
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
				// console.error("-----------\nError in generateQuestions:", Error, "\n-----------");
				return res
					.status(500)
					.json({ error: "Question generation failed" });
			}

			if (!questions || questions.length === 0) {
				return res
					.status(400)
					.json({ error: "Failed to generate questions" });
			}

			// console.log("-----------\nGenerated questions:", questions, "\n-----------");

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
			// console.error( "----------------\nInterview setup error:", err.stack || err.message, "\n----------------" );
			res.status(500).json({ error: "Failed to set up interview" });
		}
	}
);

export default router;
