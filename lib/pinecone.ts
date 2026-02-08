import { Pinecone } from '@pinecone-database/pinecone';

let pineconeClient: Pinecone | null = null;

/**
 * Get or initialize Pinecone client
 */
export async function getPineconeClient(): Promise<Pinecone> {
    if (pineconeClient) {
        return pineconeClient;
    }

    const apiKey = process.env.PINECONE_API_KEY;
    if (!apiKey) {
        throw new Error('PINECONE_API_KEY environment variable is not set');
    }

    pineconeClient = new Pinecone({
        apiKey,
    });

    return pineconeClient;
}

/**
 * Get Pinecone index for storing and retrieving knowledge vectors
 */
export async function getPineconeIndex() {
    const client = await getPineconeClient();
    const indexName = process.env.PINECONE_INDEX_NAME || 'edutrack-knowledge';

    return client.index(indexName);
}

/**
 * Check if Pinecone index exists and create if it doesn't
 */
export async function ensureIndexExists() {
    try {
        const client = await getPineconeClient();
        const indexName = process.env.PINECONE_INDEX_NAME || 'edutrack-knowledge';

        const indexes = await client.listIndexes();
        const indexExists = indexes.indexes?.some(index => index.name === indexName);

        if (!indexExists) {
            console.log(`Creating Pinecone index: ${indexName}`);
            await client.createIndex({
                name: indexName,
                dimension: 1536, // OpenAI embedding dimension
                metric: 'cosine',
                spec: {
                    serverless: {
                        cloud: 'aws',
                        region: 'us-east-1'
                    }
                }
            });

            // Wait for index to be ready
            console.log('Waiting for index to be ready...');
            await new Promise(resolve => setTimeout(resolve, 10000));
        }

        return true;
    } catch (error: any) {
        console.error('Error ensuring Pinecone index exists:', error);
        throw new Error(`Failed to ensure Pinecone index exists: ${error.message}`);
    }
}
