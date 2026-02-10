# AI Chatbot Setup Guide

## Overview
The AI Study Assistant chatbot has been successfully integrated into EduTrack! Students can now ask questions about college policies, syllabus, attendance, exams, CGPA, and scholarships.

## Prerequisites

Before running the chatbot, you need:

1. **OpenAI API Key** (or compatible provider like OpenRouter with DeepSeek)
2. **Pinecone API Key** for vector database

## Environment Setup

1. **Copy environment variables from `.env.example` to `.env`:**
   ```bash
   cp .env.example .env
   ```

2. **Add your API keys to `.env`:**
   ```env
   # Using DeepSeek via OpenRouter (recommended - already configured)
   DEEPSEEK_API_KEY=your-openrouter-api-key-here
   
   # OR use OpenAI directly
   OPENAI_API_KEY=sk-your-openai-key-here
   
   # Pinecone Configuration
   PINECONE_API_KEY=your-pinecone-api-key-here
   PINECONE_INDEX_NAME=edutrack-knowledge
   ```

3. **Get API Keys:**
   
   **Option 1: OpenRouter + DeepSeek (Recommended - Lower Cost)**
   - Sign up at https://openrouter.ai/
   - Get your API key from dashboard
   - Use DeepSeek models (already configured in code)
   - Free tier available for testing
   
   **Option 2: OpenAI**
   - Sign up at https://platform.openai.com/
   - Get your API key
   - Add payment method (pay-as-you-go)
   
   **Pinecone:**
   - Sign up at https://www.pinecone.io/
   - Create a free account (Starter plan)
   - Get your API key from dashboard
   - Create a new index named `edutrack-knowledge` (or use the seed script to auto-create)

## Installation

Install the required dependencies:

```bash
npm install
```

This will install:
- `@langchain/openai` - OpenAI integration
- `@langchain/pinecone` - Pinecone vector store
- `@langchain/core` - LangChain core functionality
- `@pinecone-database/pinecone` - Pinecone client
- `langchain` - Main LangChain library

## Seed Knowledge Base

Before using the chatbot, you must seed the Pinecone database with college knowledge:

```bash
npm run seed-knowledge
```

This script will:
- Connect to MongoDB and Pinecone
- Insert college knowledge documents (syllabus, attendance policy, exam rules, CGPA, scholarships)
- Generate embeddings using OpenAI
- Upload vectors to Pinecone
- Takes 2-5 minutes depending on your connection

## Running the Application

```bash
npm run dev
```

The chatbot will be available at:
- **Student Sidebar:** Click "AI Assistant" menu item
- **Direct URL:** http://localhost:3000/student/chatbot

## Features

### Student Chatbot Capabilities:
- ✅ Answer questions about 1st year syllabus
- ✅ Explain attendance policies
- ✅ Describe exam rules and regulations
- ✅ Calculate and explain CGPA
- ✅ Provide scholarship information
- ✅ Context-aware conversations (remembers chat history)
- ✅ Source citations for answers
- ✅ Persistent chat history in MongoDB
- ✅ Clear chat history option

### Technical Architecture:
- **RAG (Retrieval Augmented Generation):** Combines vector search with LLM generation
- **LangChain.js:** Orchestrates the RAG pipeline
- **Pinecone:** Stores document embeddings for semantic search
- **MongoDB:** Persists chat messages
- **History-Aware Retrieval:** Uses conversation context for better answers

## Testing

### Test Queries:
1. "What is the attendance policy?"
2. "How is CGPA calculated?"
3. "Tell me about the first year syllabus"
4. "What are the exam rules?"
5. "What scholarships are available?"
6. "What is the minimum attendance required?"

### Expected Behavior:
- Chatbot should provide accurate, detailed answers based on the knowledge base
- Responses should include source citations
- Non-college questions should be politely redirected
- Chat history should persist across page refreshes

## Troubleshooting

### "Cannot find module '@langchain/...'" errors:
- Run `npm install` again
- Delete `node_modules` and `package-lock.json`, then run `npm install`
- Check that all dependencies are in `package.json`

### Pinecone errors:
- Verify your Pinecone API key is correct
- Check that the index name matches in `.env`
- Run `npm run seed-knowledge` to create/seed the index
- Free tier has limitations (check Pinecone dashboard)

### OpenAI/DeepSeek errors:
- Verify your API key is valid
- Check you have credits/quota remaining
- OpenRouter free tier has rate limits

### Chat history not loading:
- Check MongoDB connection
- Verify user is authenticated
- Check browser console for errors

## Customizing Knowledge Base

To add more college-specific information:

1. Edit `scripts/seed-knowledge.ts`
2. Add new entries to the `knowledgeData` array
3. Run `npm run seed-knowledge` again

Example:
```typescript
{
    category: 'general',
    title: 'Library Hours',
    content: `Library is open Monday-Friday 8AM-8PM...`,
    metadata: {},
}
```

## API Endpoints

- `POST /api/student/chatbot/message` - Send message, get AI response
- `GET /api/student/chatbot/history` - Retrieve chat history (paginated)
- `DELETE /api/student/chatbot/clear` - Clear chat history

## Cost Estimation

**Using OpenRouter + DeepSeek:**
- Embeddings: ~$0.00001 per request
- Chat: ~$0.001 per message
- Very affordable for testing and production

**Using OpenAI:**
- Embeddings (text-embedding-3-small): ~$0.00002 per request
- Chat (gpt-4): ~$0.03 per message
- More expensive but potentially better quality

**Pinecone:**
- Free tier: Up to 100K vectors (sufficient for this use case)
- Paid: $0.096 per million queries

## Security Notes

- API keys should NEVER be committed to Git
- `.env` is in `.gitignore`
- Only authenticated students can access chatbot
- Rate limiting recommended for production

## Support

If you encounter issues:
1. Check the console for error messages
2. Verify all environment variables are set
3. Ensure MongoDB and required services are running
4. Check that knowledge base is seeded
