import mongoose, { Schema, Document, Model } from 'mongoose';

export type KnowledgeCategory = 'syllabus' | 'attendance' | 'exams' | 'cgpa' | 'scholarship' | 'general';

export interface ICollegeKnowledge extends Document {
    category: KnowledgeCategory;
    title: string;
    content: string;
    metadata?: {
        year?: string;
        department?: string;
        semester?: string;
        lastReviewed?: Date;
    };
    isActive: boolean;
    createdAt: Date;
    updatedAt: Date;
}

const CollegeKnowledgeSchema = new Schema<ICollegeKnowledge>(
    {
        category: {
            type: String,
            enum: ['syllabus', 'attendance', 'exams', 'cgpa', 'scholarship', 'general'],
            required: true,
            index: true,
        },
        title: {
            type: String,
            required: true,
        },
        content: {
            type: String,
            required: true,
        },
        metadata: {
            year: String,
            department: String,
            semester: String,
            lastReviewed: Date,
        },
        isActive: {
            type: Boolean,
            default: true,
        },
    },
    {
        timestamps: true,
    }
);

// Index for efficient category-based querying
CollegeKnowledgeSchema.index({ category: 1, isActive: 1 });

const CollegeKnowledge: Model<ICollegeKnowledge> =
    mongoose.models.CollegeKnowledge || mongoose.model<ICollegeKnowledge>('CollegeKnowledge', CollegeKnowledgeSchema);

export default CollegeKnowledge;
