import mongoose, { Schema, Document, Model } from 'mongoose';

export type PreRegRole = 'STUDENT' | 'TEACHER';

export interface IPreRegisteredUser extends Document {
    _id: mongoose.Types.ObjectId;
    email: string;
    name: string;
    role: PreRegRole;
    department: string;

    // Student-specific fields
    year?: number;
    registrationId?: string;

    // Teacher-specific fields
    yearsTaught?: number[];
    subject?: string;

    // Status tracking
    isRegistered: boolean;
    registeredAt?: Date;
    userId?: mongoose.Types.ObjectId;

    // Metadata
    createdBy: mongoose.Types.ObjectId;
    createdAt: Date;
    updatedAt: Date;
}

const PreRegisteredUserSchema = new Schema<IPreRegisteredUser>(
    {
        email: {
            type: String,
            required: [true, 'Email is required'],
            unique: true,
            lowercase: true,
            trim: true,
            index: true,
        },
        name: {
            type: String,
            required: [true, 'Name is required'],
            trim: true,
        },
        role: {
            type: String,
            enum: ['STUDENT', 'TEACHER'],
            required: [true, 'Role is required'],
        },
        department: {
            type: String,
            required: [true, 'Department is required'],
            trim: true,
        },

        // Student fields
        year: {
            type: Number,
            min: 1,
            max: 4,
            required: function (this: IPreRegisteredUser) {
                return this.role === 'STUDENT';
            },
        },
        registrationId: {
            type: String,
            trim: true,
            sparse: true, // Allows null but enforces uniqueness when present
            unique: true,
        },

        // Teacher fields
        yearsTaught: {
            type: [Number],
            validate: {
                validator: function (v: number[]) {
                    return v.every(y => y >= 1 && y <= 4);
                },
                message: 'Years taught must be between 1 and 4'
            },
            required: function (this: IPreRegisteredUser) {
                return this.role === 'TEACHER';
            },
        },
        subject: {
            type: String,
            trim: true,
            required: function (this: IPreRegisteredUser) {
                return this.role === 'TEACHER';
            },
        },

        // Status tracking
        isRegistered: {
            type: Boolean,
            default: false,
            index: true,
        },
        registeredAt: {
            type: Date,
        },
        userId: {
            type: Schema.Types.ObjectId,
            ref: 'User',
        },

        // Metadata
        createdBy: {
            type: Schema.Types.ObjectId,
            ref: 'User',
            required: true,
        },
    },
    {
        timestamps: true,
    }
);

// Prevent model recompilation in development
const PreRegisteredUser: Model<IPreRegisteredUser> =
    mongoose.models.PreRegisteredUser ||
    mongoose.model<IPreRegisteredUser>('PreRegisteredUser', PreRegisteredUserSchema);

export default PreRegisteredUser;
