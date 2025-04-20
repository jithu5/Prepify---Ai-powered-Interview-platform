'use client';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useParams } from 'next/navigation';
import React, { useState } from 'react';

function InterviewSectionPage() {
    const { interviewId } = useParams();
    const [sessions, setSessions] = useState([
        {
            question: 'Tell me about a time you solved a difficult technical problem.',
            answer: 'In my previous project, I had to optimize database queries to improve performance...',
            response: 'Great answer! You can improve it further by mentioning specific tools or techniques.',
        },
        {
            question: 'What is the difference between REST and GraphQL?',
            answer: '', // No answer provided yet
            response: '', // Response pending
        },
        // Add more sessions as needed
    ]);

    return (
        <div className="min-h-screen bg-slate-50 px-4 py-10 md:px-12 lg:px-32">
            <h1 className="text-3xl font-bold text-center mb-10">
                Interview Session #{interviewId}
            </h1>

            <div className="space-y-10">
                {sessions.map((session, index) => (
                    <div key={index} className="space-y-6 pb-6">
                        {/* Question, Answer and Response (Vertically stacked) */}
                        <div className="flex flex-col gap-4">
                            {/* Question Section (Right-aligned) */}
                            <div className="flex justify-end gap-3">
                                <div className="bg-gray-200 text-gray-800 p-3 rounded-lg max-w-xl">
                                    <p className="text-lg">{session.question}</p>
                                </div>
                            </div>

                            {/* User's Answer (Full-width) */}
                            <div className="bg-blue-100 text-blue-800 p-4 rounded-lg shadow-sm border border-blue-200">
                                <p className="text-lg text-blue-600 mb-1 font-medium">Your Answer</p>
                                {/* Conditional Rendering for User Answer */}
                                {session.answer ? (
                                    <p className="text-gray-800 text-lg">{session.answer}</p>
                                ) : (
                                    <p className="text-gray-400">Waiting for your answer...</p>
                                )}
                            </div>

                            {/* AI Response (Right-aligned, conditional rendering) */}
                            {session.response ? (
                                <div className="flex justify-end gap-3">
                                    <div className="bg-green-50 text-green-800 p-3 rounded-lg max-w-xl">
                                        <p className="text-lg">{session.response}</p>
                                    </div>
                                </div>
                            ) : (
                                <div className="flex justify-end gap-3">
                                    <div className="bg-gray-100 text-gray-500 p-3 rounded-lg max-w-xs">
                                        <p className="text-sm">Response is being processed...</p>
                                    </div>
                                </div>
                            )}
                        </div>

                        {/* Add a separation line for clarity */}
                        {index < sessions.length - 1 && <hr className="border-t border-gray-200 mt-6" />}
                    </div>
                ))}
            </div>
            <div className='fixed bottom-0 w-full left-0 bg-gray-100 h-32 py-10 px-10 flex items-center justify-center gap-5'>
                <Input className='w-[75%] ' />
                <Button>Submit</Button>
            </div>
        </div>
    );
}

export default InterviewSectionPage;
