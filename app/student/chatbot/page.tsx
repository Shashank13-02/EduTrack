import { ChatbotWidget } from '@/components/student/ChatbotWidget';

export default function ChatbotPage() {
    return (
        <div className="h-full w-full flex flex-col overflow-hidden md:h-full md:w-full">
            {/* Chatbot Widget */}
            <div className="flex-1 overflow-hidden">
                <ChatbotWidget />
            </div>
        </div>
    );
}