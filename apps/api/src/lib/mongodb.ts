import { MongoClient } from "mongodb";
import dotenv from "dotenv";

dotenv.config();

const uri = process.env.MONGO_URI || "mongodb://localhost:27017/ivrhotel";

let client: MongoClient;
let clientPromise: Promise<MongoClient>;

declare global {
    var _mongoClientPromise: Promise<MongoClient>;
}

if (process.env.NODE_ENV === "development") {
    // In development mode, use a global variable so that the value
    // is preserved across module reloads caused by HMR (Hot Module Replacement).
    if (!global._mongoClientPromise) {
        client = new MongoClient(uri);
        global._mongoClientPromise = client.connect();
    }
    clientPromise = global._mongoClientPromise;
} else {
    // In production mode, it's best to not use a global variable.
    client = new MongoClient(uri);
    clientPromise = client.connect();
}

export { clientPromise };
export const clientInstance = new MongoClient(uri); // Export instance for better-auth if needed synchronously (though connect is async)

// For better-auth specifically, it often wants a connected client or just the instance.
// The user example showed:
// const client = new MongoClient(...);
// const db = client.db();
// auth = betterAuth({ database: mongodbAdapter(db, { client }) });

// So we can export the client directly.
export const mongoClient = new MongoClient(uri);
export const db = mongoClient.db(); // This gets the DB instance (lazy)
