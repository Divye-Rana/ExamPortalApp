const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const AnswerSchema = new Schema({
    questionId: {
        type: Schema.Types.ObjectId,
        required: true
    },
    selectedAnswer: {
        type: Number,
        required: true
    }
});

const ExamSubmissionSchema = new Schema({
    examId: {
        type: Schema.Types.ObjectId,
        ref: 'exams',
        required: true,
        index: true
    },
    studentId: {
        type: Schema.Types.ObjectId,
        ref: 'users',
        required: true,
        index: true
    },
    answers: [AnswerSchema],
    score: {
        type: Number,
        default: 0
    },
    totalMarks: {
        type: Number,
        required: true
    },
    startTime: {
        type: Date,
        required: true
    },
    endTime: {
        type: Date
    },
    timeRemaining: {
        type: Number // in seconds
    },
    status: {
        type: String,
        enum: ['in-progress', 'completed', 'interrupted'],
        default: 'in-progress'
    },
    submittedAt: {
        type: Date
    }
}, { timestamps: true });

// Compound index for efficient queries
ExamSubmissionSchema.index({ examId: 1, studentId: 1 });

const ExamSubmissionModel = mongoose.model('examSubmissions', ExamSubmissionSchema);
module.exports = ExamSubmissionModel;
