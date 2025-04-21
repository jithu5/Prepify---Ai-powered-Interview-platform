// components/ChatBubble.tsx

import React from "react";

type Props = {
    sender: 'ai' | 'user' | 'feedback' | 'placeholder';
    message: string;
};

export default function ChatBubble({ sender, message }: Props) {
    if (sender === 'ai') {
        return (
            <div className="flex items-start gap-3">
                <div className="bg-white border border-gray-200 shadow-sm p-3 rounded-lg max-w-lg text-gray-900">
                    <p className="font-medium text-gray-700">AI:</p>
                    <p>{message}</p>
                </div>
            </div>
        );
    }

    if (sender === 'user') {
        return (
            <div className="flex justify-end gap-3">
                <div className="bg-blue-600 text-white p-3 rounded-lg max-w-lg shadow-md">
                    <p className="font-medium text-sm mb-1">You:</p>
                    <p>{message}</p>
                </div>
            </div>
        );
    }

    if (sender === 'feedback') {
        return (
            <div className="flex items-start gap-3">
                <div className="bg-green-100 text-green-900 p-3 rounded-lg max-w-lg shadow-sm border border-green-200">
                    <p className="font-medium text-sm mb-1">AI Feedback:</p>
                    <p>{message}</p>
                </div>
            </div>
        );
    }

    return (
        <div className="flex justify-end gap-3">
            <div className="bg-gray-100 text-gray-500 p-3 rounded-lg max-w-xs">
                <p className="text-sm">{message}</p>
            </div>
        </div>
    );
}
