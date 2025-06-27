import express from 'express';
import Interview from '../models/interview.js';
import firebaseAuthMiddleware from '../middleware/firebaseAuthMiddleware.js';

const router = express.Router();
router.use(express.json());

router.post('/setup', firebaseAuthMiddleware, async(req, res) => {
    
    const { uid } = req.firebaseUser;
    const { interview_name, num_of_questions, interview_type, role, company_name, company_description, job_description, resume_link, focus_area } = req.body;

    try {
        const interview = new Interview({
            user_id: uid,
            interview_name,
            num_of_questions,
            interview_type,
            role,
            company_name,
            company_description,
            job_description,
            resume_link,
            focus_area
        });
        await interview.save();

        res.json({ message: 'Interview setup successfully', interview });
        res.status(201).json({ message: 'Interview setup successfully', interview });
    } catch (err) {
        console.error('Error setting up interview:', err);
        res.status(500).json({ error: 'Failed to set up interview' });
    }
});

export default router;