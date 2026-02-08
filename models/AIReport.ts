import mongoose, { Schema, Document, Model } from 'mongoose';

export type RiskLevel = 'low' | 'medium' | 'high';

export interface IAIReport extends Document {
    _id: mongoose.Types.ObjectId;
    studentId: mongoose.Types.ObjectId;
    reportText: string;
    recommendedPlan: string[];
    riskLevel: RiskLevel;
    createdAt: Date;
    updatedAt: Date;
}

const AIReportSchema = new Schema<IAIReport>(
    {
        studentId: {
            type: Schema.Types.ObjectId,
            ref: 'User',
            required: [true, 'Student ID is required'],
        },
        reportText: {
            type: String,
            required: [true, 'Report text is required'],
        },
        recommendedPlan: {
            type: [String],
            default: [],
        },
        riskLevel: {
            type: String,
            enum: ['low', 'medium', 'high'],
            required: [true, 'Risk level is required'],
        },
    },
    {
        timestamps: true,
    }
);

// Index for efficient queries
AIReportSchema.index({ studentId: 1, createdAt: -1 });

const AIReport: Model<IAIReport> =
    mongoose.models.AIReport || mongoose.model<IAIReport>('AIReport', AIReportSchema);

export default AIReport;
