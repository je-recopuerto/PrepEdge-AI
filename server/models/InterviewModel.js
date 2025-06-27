import mongoose from 'mongoose';

const interviewSchema = new mongoose.Schema({
    user_id: {
        type: String,
        required: true,
        trim: true
    },

    interview_name: {
        type: String,
        required: true,
        trim: true
    },
    num_of_questions: {
        type: Number,
        required: true,
        default: 3,
        min: 3,
        max: 10
    },
    interview_type: {
        type: String,
        enum: ['technical', 'behavioral', 'mixed'],
        required: true
    },

    role: {
        type: String,
        required: true,
        trim: true
    },
    company_name: {
        type: String,
        trim: true
    },
    company_description: {
        type: String,
        trim: true
    },
    job_description: {
        type: String,
        trim: true
    },

    resume_link: {
        type: String,
        trim: true
    },
    focus_area: {
        type: String,
        trim: true
    },

    created_at: {
        type: Date,
        default: Date.now
    },

});

const Interview = mongoose.model('Interview', interviewSchema);
export default Interview;