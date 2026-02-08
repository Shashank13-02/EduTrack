import { ChatOpenAI, OpenAIEmbeddings } from "@langchain/openai";
import { PineconeStore } from "@langchain/pinecone";
import { ChatPromptTemplate, MessagesPlaceholder } from "@langchain/core/prompts";
import { createStuffDocumentsChain } from "langchain/chains/combine_documents";
import { createRetrievalChain } from "langchain/chains/retrieval";
import { createHistoryAwareRetriever } from "langchain/chains/history_aware_retriever";
import { HumanMessage, AIMessage } from "@langchain/core/messages";
import { getPineconeIndex } from "./pinecone";

const OPENAI_API_KEY = process.env.OPENAI_API_KEY || process.env.DEEPSEEK_API_KEY;
const OPENROUTER_BASE_URL = 'https://openrouter.ai/api/v1';

/**
 * Initialize embeddings model
 */
export function getEmbeddingsModel() {
    if (!OPENAI_API_KEY) {
        throw new Error('OPENAI_API_KEY or DEEPSEEK_API_KEY is required');
    }

    // If using OpenRouter/DeepSeek, use text-embedding-3-small through OpenRouter
    return new OpenAIEmbeddings({
        apiKey: OPENAI_API_KEY,
        modelName: 'sentence-transformers/all-minilm-l6-v2',
        configuration: {
            baseURL: OPENROUTER_BASE_URL,
        },
    });
}

/**
 * Initialize Chat model
 */
export function getChatModel() {
    if (!OPENAI_API_KEY) {
        throw new Error('OPENAI_API_KEY or DEEPSEEK_API_KEY is required');
    }

    return new ChatOpenAI({
        apiKey: OPENAI_API_KEY,
        modelName: 'deepseek/deepseek-chat',
        temperature: 0.3,
        configuration: {
            baseURL: OPENROUTER_BASE_URL,
            defaultHeaders: {
                'HTTP-Referer': 'http://localhost:3000',
                'X-Title': 'EduTrack AI Chatbot',
            },
        },
    });
}

/**
 * Get Pinecone vector store
 */
export async function getVectorStore() {
    const pineconeIndex = await getPineconeIndex();
    const embeddings = getEmbeddingsModel();

    return await PineconeStore.fromExistingIndex(embeddings, {
        pineconeIndex,
        namespace: 'college-knowledge',
    });
}

/**
 * Create RAG chain for chatbot
 */
export async function createChatbotChain() {
    const vectorStore = await getVectorStore();
    const chatModel = getChatModel();

    // Create a retriever from the vector store
    const retriever = vectorStore.asRetriever({
        k: 4, // Retrieve top 4 relevant documents
    });

    // Create history-aware retriever prompt
    const historyAwarePrompt = ChatPromptTemplate.fromMessages([
        new MessagesPlaceholder('chat_history'),
        ['user', '{input}'],
        [
            'user',
            'Given the conversation above, generate a search query to look up relevant information from the college knowledge base.',
        ],
    ]);

    // Create history-aware retriever
    const historyAwareRetriever = await createHistoryAwareRetriever({
        llm: chatModel,
        retriever,
        rephrasePrompt: historyAwarePrompt,
    });

    // Create main QA prompt
    const qaPrompt = ChatPromptTemplate.fromMessages([
        [
            'system',
            `You are a helpful AI assistant for students at a college. Your role is to answer questions about college policies, procedures, and academic information.

IMPORTANT GUIDELINES:
1. You can ONLY answer questions related to:
   - College syllabus and curriculum
   - Attendance policies
   - Exam rules and regulations
   - CGPA calculation methods
   - Scholarship information and eligibility
   - General college procedures and policies

2. If a student asks a question NOT related to college/academic topics:
   - Politely inform them that you can only help with college-related queries
   - Suggest they rephrase their question if it might be college-related
   - Example: "I'm here to help with college-related questions only. Please ask about syllabus, attendance, exams, CGPA, scholarships, or other academic matters."

3. Always base your answers on the provided context below.
4. If you don't have enough information, say so and suggest contacting the administration.
5. Be concise, accurate, and student-friendly in your responses.

Context from knowledge base:
{context}`,
        ],
        new MessagesPlaceholder('chat_history'),
        ['user', '{input}'],
    ]);

    // Create the combine documents chain
    const combineDocsChain = await createStuffDocumentsChain({
        llm: chatModel,
        prompt: qaPrompt,
    });

    // Create the final retrieval chain
    const retrievalChain = await createRetrievalChain({
        retriever: historyAwareRetriever,
        combineDocsChain,
    });

    return retrievalChain;
}

/**
 * Format chat history for LangChain
 */
export function formatChatHistory(messages: Array<{ role: string; content: string }>) {
    return messages.map((msg) => {
        if (msg.role === 'user') {
            return new HumanMessage(msg.content);
        } else if (msg.role === 'assistant') {
            return new AIMessage(msg.content);
        }
        return new HumanMessage(msg.content); // Fallback
    });
}

/**
 * Process chatbot query with RAG
 */
export async function processChatbotQuery(
    question: string,
    chatHistory: Array<{ role: string; content: string }> = []
) {
    try {
        const chain = await createChatbotChain();
        const formattedHistory = formatChatHistory(chatHistory);

        const response = await chain.invoke({
            input: question,
            chat_history: formattedHistory,
        });

        return {
            answer: response.answer,
            sources: response.context?.map((doc: any) => ({
                content: doc.pageContent,
                metadata: doc.metadata,
            })) || [],
        };
    } catch (error: any) {
        console.error('Error processing chatbot query:', error);
        throw new Error(`Failed to process query: ${error.message}`);
    }
}
