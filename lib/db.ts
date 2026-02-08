import mongoose from 'mongoose';
import { MongoMemoryServer } from 'mongodb-memory-server';

const MONGODB_URI = process.env.MONGODB_URI;

interface CachedConnection {
    conn: typeof mongoose | null;
    promise: Promise<typeof mongoose> | null;
}

declare global {
    // eslint-disable-next-line no-var
    var mongoose: CachedConnection | undefined;
    // eslint-disable-next-line no-var
    var mongod: MongoMemoryServer | undefined;
}

const cached: CachedConnection = global.mongoose || {
    conn: null,
    promise: null,
};

if (!global.mongoose) {
    global.mongoose = cached;
}

export async function connectDB(): Promise<typeof mongoose> {
    if (cached.conn) {
        return cached.conn;
    }

    if (!cached.promise) {
        const opts = {
            bufferCommands: false,
        };

        cached.promise = (async (): Promise<typeof mongoose> => {
            let uri = MONGODB_URI;

            if (!uri) {
                console.log("⚠️ No MONGODB_URI provided. Starting In-Memory MongoDB...");
                if (!global.mongod) {
                    const path = require('path');
                    const dbPath = path.join(process.cwd(), '.mongo-data');
                    // Create directory if it doesn't exist (handled by mkdir command usually, but good fallback)
                    const fs = require('fs');
                    if (!fs.existsSync(dbPath)) {
                        fs.mkdirSync(dbPath);
                    }

                    global.mongod = await MongoMemoryServer.create({
                        instance: {
                            dbPath: dbPath,
                            storageEngine: 'wiredTiger', // Use wiredTiger for persistence
                        }
                    });
                }
                uri = global.mongod.getUri();
                console.log("✅ In-Memory MongoDB started at", uri);
            }

            return mongoose.connect(uri!, opts).then((mongoose) => {
                console.log('✅ MongoDB connected successfully');
                return mongoose;
            });
        })();
    }

    try {
        cached.conn = await cached.promise;
    } catch (e) {
        cached.promise = null;
        throw e;
    }

    return cached.conn;
}

export default connectDB;
