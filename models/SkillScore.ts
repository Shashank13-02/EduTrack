import mongoose, { Schema, Document, Model } from 'mongoose';
export type SkillLevel = 'weak' | 'average' | 'strong';

export interface ISkillScore extends Document {
    _id: mongoose.Types.ObjectId;
    studentId: mongoose.Types.ObjectId;
    skillName: string;
    score: number;
    level: SkillLevel;
    createdAt: Date;
    updatedAt: Date;
}

const SkillScoreSchema = new Schema<ISkillScore>(
    {
        studentId: {
            type: Schema.Types.ObjectId,
            ref: 'User',
            required: [true, 'Student ID is required'],
        },
        skillName: {
            type: String,
            required: [true, 'Skill name is required'],
            trim: true,
        },
        score: {
            type: Number,
            min: 0,
            max: 100,
            required: [true, 'Score is required'],
        },
        level: {
            type: String,
            enum: ['weak', 'average', 'strong'],
            required: [true, 'Level is required'],
        },
    },
    {
        timestamps: true,
    }
);

// Index for efficient queries
SkillScoreSchema.index({ studentId: 1, skillName: 1 });

const SkillScore: Model<ISkillScore> =
    mongoose.models.SkillScore || mongoose.model<ISkillScore>('SkillScore', SkillScoreSchema);

export default SkillScore;
