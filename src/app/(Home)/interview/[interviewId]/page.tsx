'use client';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useParams } from 'next/navigation';
import React, { useEffect, useRef, useState } from 'react';
import axios from 'axios';
import { toast } from "sonner"

function InterviewSectionPage() {
    const { interviewId } = useParams();

    interface Response {
        feedback: string;
        score?: number;
    }
    interface Session {
        question?: string;
        answer?: string;
        response?: Response;
        id?: string;
    }

    const [sessions, setSessions] = useState<Session[]>([]);
    const [answer, setAnswer] = useState<string>('');
    const [questionId, setQuestionId] = useState<string>('');

    const bottomRef = useRef<HTMLDivElement | null>(null);

    useEffect(() => {
        bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [sessions]);

    useEffect(() => {
        const fetchInterviewData = async () => {
            try {
                const { data } = await axios.get(`/api/interview-questions/${interviewId}`);
                setSessions(data.question); // Assuming the API returns the sessions in this format
                const questionLength = data.question.length;
                setQuestionId(data.question[questionLength - 1]?.id); // Set the last question ID as default
                console.log(data)
                if (!data.success) {
                    toast.error(data.message);
                    setSessions(data.questions); // Assuming the API returns the sessions in this format
                    return
                }
                toast.success(data.message);
            } catch (error: any) {
                const errMessage = error?.response?.data?.message || 'An error occurred while fetching interview data.';
                console.error('Error fetching interview data:', errMessage);
                setSessions(error?.response?.data.questions); // Assuming the API returns the sessions in this format
                toast.error(errMessage);
            }
        };

        fetchInterviewData();
    }, [])
    console.log(sessions)

    const handleAnswerSubmit = async (answer: string, questionId: string) => {
        try {
            const { data } = await axios.post(`/api/interview-questions/${interviewId}`, {
                answer: answer,
                questionId: questionId
            }, {
                headers: {
                    'Content-Type': 'application/json',
                },
                withCredentials: true
            })

            if (data.success) {
                setSessions((prevSessions) =>
                    prevSessions.map((session) =>
                        session.id === questionId
                            ? {
                                ...session,
                                answer: answer, // fix here
                                response: { feedback: data.feedback, score: data.score }, // assuming your API returns feedback here
                            }
                            : session
                    )
                );

                toast.success(data.message);
            } else {
                toast.error(data.message);
            }
        } catch (error: any) {
            const errMessage = error?.response?.data?.message || 'An error occurred while submitting your answer.';
            console.error('Error submitting answer:', errMessage);
            toast.error(errMessage);
        }
    }


    return (
        <div className="min-h-screen bg-slate-50 pt-24">
            <h1 className="text-3xl font-bold text-center mb-6">Interview Session #{interviewId}</h1>

            {/* Chat Container */}
            <div className="h-[70vh] overflow-y-auto px-4 md:px-12 lg:px-48 space-y-8 pb-36">
                {sessions.length > 0 && sessions.map((session, index) => (
                    <div key={index} className="space-y-4">
                        {/* AI Question */}
                        {session?.question && (
                            <div className="flex items-start gap-3">
                                <div className="bg-white border border-gray-200 shadow-sm p-3 rounded-lg max-w-lg text-gray-900">
                                    <p className="font-medium text-gray-700">AI:</p>
                                    <p>{session?.question}</p>
                                </div>
                            </div>
                        )}

                        {/* User Answer */}
                        {session.answer && (
                            <div className="flex justify-end gap-3">
                                <div className="bg-blue-600 text-white p-3 rounded-lg max-w-lg shadow-md">
                                    <p className="font-medium text-sm mb-1">You:</p>
                                    <p>{session.answer}</p>
                                </div>
                            </div>
                        )}

                        {/* Awaiting Answer */}
                        {!session.answer && (
                            <div className="flex justify-end gap-3">
                                <div className="bg-gray-100 text-gray-500 p-3 rounded-lg max-w-xs">
                                    <p className="text-sm">Waiting for your answer...</p>
                                </div>
                            </div>
                        )}

                        {/* AI Response */}
                        {session.response ? (
                            <div className="flex items-start gap-3">
                                <div className="bg-green-100 text-green-900 p-3 rounded-lg max-w-lg shadow-sm border border-green-200">
                                    <p className="font-medium text-sm mb-1">AI Feedback:</p>
                                    <p>{session.response.feedback}</p>
                                </div>
                            </div>
                        ) : session.answer ? (
                            <div className="flex items-start gap-3">
                                <div className="bg-gray-100 text-gray-500 p-3 rounded-lg max-w-xs">
                                    <p className="text-sm">AI is analyzing your answer...</p>
                                </div>
                            </div>
                        ) : null}

                        <hr className="border-t border-gray-200 mt-6" />
                    </div>
                ))}

                <div ref={bottomRef} />
            </div>

            {/* Input Fixed at Bottom */}
            <div className="fixed bottom-0 w-full left-0 bg-white border-t border-gray-200 px-4 md:px-12 lg:px-48 py-4 flex items-center gap-4">
                <Input
                    value={answer}
                    onChange={(e) => setAnswer(e.target.value)}
                    className="flex-1"
                    placeholder="Type your answer..."
                />

                <Button onClick={() => handleAnswerSubmit(answer, questionId)}>Send</Button>
            </div>
        </div>
    );
}

export default InterviewSectionPage;
