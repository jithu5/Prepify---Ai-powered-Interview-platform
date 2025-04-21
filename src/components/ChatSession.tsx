// components/ChatSession.tsx

import React from 'react';
import ChatBubble from './ChatBubble';

type Response = {
    feedback: string;
    score?: number;
};

type Session = {
    question?: string;
    answer?: string;
    response?: Response;
    id?: string;
};

type Props = {
    session: Session;
};

export default function ChatSession({ session }: Props) {
    return (
        <div className="space-y-4">
            {session.question && <ChatBubble sender="ai" message={session.question} />}
            {session.answer && <ChatBubble sender="user" message={session.answer} />}
            {!session.answer && <ChatBubble sender="placeholder" message="Waiting for your answer..." />}
            {session.response
                ? <ChatBubble sender="feedback" message={session.response.feedback} />
                : session.answer && <ChatBubble sender="placeholder" message="AI is analyzing your answer..." />
            }
            {
                session.response?.score && (
                    <div className="text-center text-lg text-stone-700">
                        Score: {session.response.score} / 10
                        </div>
                )   
            }
            <hr className="border-t border-gray-200 mt-6" />
        </div>
    );
}
