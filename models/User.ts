import mongoose, { Schema, Document, Model } from 'mongoose';

export type UserRole = 'TEACHER' | 'STUDENT' | 'ADMIN';

export const DEPARTMENTS = [
    'Mechanical',
    'Electrical',
    'Production & Industrial',
    'Metallurgy',
    'Chemical',
    'Civil',
    'Electronics and Communication',
    'Mining',
    'Computer Science & Engineering',
    'Computer Science & Engineering (Cyber Security)',
    'Information Technology'
] as const;

export type Department = typeof DEPARTMENTS[number];

export interface IUser extends Document {
    _id: mongoose.Types.ObjectId;
    name: string;
    email: string;
    passwordHash: string;
    role: UserRole;
    department: Department;
    year?: number; // 1-4 for students
    yearsTaught?: number[]; // For faculty
    subject?: string; // For faculty
    isVerified?: boolean; // For system verification
    bio: string;
    skills: {
        name: string;
        category: 'technical' | 'language' | 'soft' | 'project' | 'other';
        level: number;
        xp: number;
        addedDate: Date;
        lastPracticed: Date;
        streak: number;
        bestStreak: number;
        milestones: {
            date: Date;
            description?: string;
            xpGained: number;
        }[];
        activities: {
            date: Date;
            timeSpent: number; // minutes
            notes: string;
            xpGained: number;
        }[];
    }[];
    careerGoals: string[];
    hobbies: string[];
    subjects?: string[]; // Selection for students
    learningStreak?: number; // Current consecutive days with task completion
    longestStreak?: number; // Best streak achieved
    totalLearningDays?: number; // Total days with at least 1 task completed
    image?: string;
    registrationId?: string; // Student unique ID (optional)

    // Pre-registration tracking
    isLegacyUser?: boolean; // Existing users before pre-registration system
    preRegisteredId?: mongoose.Types.ObjectId; // Reference to PreRegisteredUser

    createdAt: Date;
    updatedAt: Date;
}

const UserSchema = new Schema<IUser>(
    {
        name: {
            type: String,
            required: [true, 'Name is required'],
            trim: true,
        },
        email: {
            type: String,
            required: [true, 'Email is required'],
            unique: true,
            lowercase: true,
            trim: true,
        },
        passwordHash: {
            type: String,
            required: [true, 'Password is required'],
        },
        role: {
            type: String,
            enum: ['TEACHER', 'STUDENT', 'ADMIN'],
            required: [true, 'Role is required'],
        },
        department: {
            type: String,
            enum: DEPARTMENTS,
            required: true,
        },
        year: {
            type: Number,
            min: 1,
            max: 4,
            required: function (this: IUser) {
                return this.role === 'STUDENT';
            },
        },
        yearsTaught: {
            type: [Number],
            validate: {
                validator: function (v: number[]) {
                    return v.every(y => y >= 1 && y <= 4);
                },
                message: 'Years must be between 1 and 4'
            },
            required: function (this: IUser) {
                return this.role === 'TEACHER';
            },
        },
        subject: {
            type: String,
            trim: true,
            required: function (this: IUser) {
                return this.role === 'TEACHER';
            },
        },
        bio: {
            type: String,
            trim: true,
            default: '',
        },
        skills: {
            type: [{
                name: {
                    type: String,
                    required: true,
                },
                category: {
                    type: String,
                    enum: ['technical', 'language', 'soft', 'project', 'other'],
                    default: 'other',
                },
                level: {
                    type: Number,
                    min: 1,
                    max: 5,
                    default: 1,
                },
                xp: {
                    type: Number,
                    default: 0,
                    min: 0,
                },
                addedDate: {
                    type: Date,
                    default: Date.now,
                },
                lastPracticed: {
                    type: Date,
                    default: Date.now,
                },
                streak: {
                    type: Number,
                    default: 0,
                    min: 0,
                },
                bestStreak: {
                    type: Number,
                    default: 0,
                    min: 0,
                },
                milestones: [{
                    date: {
                        type: Date,
                        default: Date.now,
                    },
                    description: String,
                    xpGained: {
                        type: Number,
                        default: 0,
                    },
                }],
                activities: [{
                    date: {
                        type: Date,
                        required: true,
                    },
                    timeSpent: {
                        type: Number,
                        default: 0,
                        min: 0,
                    },
                    notes: {
                        type: String,
                        default: '',
                    },
                    xpGained: {
                        type: Number,
                        default: 0,
                        min: 0,
                    },
                }],
            }],
            default: [],
        },
        careerGoals: {
            type: [String],
            default: [],
        },
        hobbies: {
            type: [String],
            default: [],
        },
        subjects: {
            type: [String],
            default: [],
        },
        isVerified: {
            type: Boolean,
            default: true,
        },
        learningStreak: {
            type: Number,
            default: 0,
            min: 0,
        },
        longestStreak: {
            type: Number,
            default: 0,
            min: 0,
        },
        totalLearningDays: {
            type: Number,
            default: 0,
            min: 0,
        },
        image: {
            type: String,
            default: '',
        },
        isLegacyUser: {
            type: Boolean,
            default: false,
        },
        preRegisteredId: {
            type: Schema.Types.ObjectId,
            ref: 'PreRegisteredUser',
        },
        registrationId: {
            type: String,
            trim: true,
            sparse: true,
            unique: true,
        },
    },
    {
        timestamps: true,
    }
);

// Prevent model recompilation in development
const User: Model<IUser> = mongoose.models.User || mongoose.model<IUser>('User', UserSchema);

export default User;
