'use client';

import React, { useCallback, useEffect, useRef, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import axios from 'axios';
import { toast } from "sonner";
import ChatSession from '@/components/ChatSession';
import ChatInput from '@/components/ChatInput';
import { Button } from '@/components/ui/button';
import '@fontsource/titillium-web';
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
    AlertDialogTrigger,
} from '@/components/ui/alert-dialog';

interface Session {
    question?: string;
    answer?: string;
    response?: {
        feedback: string;
        score?: number;
    };
    id?: string;
}

function InterviewSectionPage() {
    const { interviewId } = useParams();
    const router = useRouter();
    const bottomRef = useRef<HTMLDivElement | null>(null);

    const [sessions, setSessions] = useState<Session[]>([]);
    const [questionId, setQuestionId] = useState<string>('');
    const [isQuestionLoading, setIsQuestionLoading] = useState<boolean>(false);
    const [isFeedbackLoading, setIsFeedbackLoading] = useState<boolean>(false);
    const [isSubmitting, setIsSubmitting] = useState<boolean>(false);

    const fetchInterviewQuestions = useCallback(async () => {
        try {
            setIsQuestionLoading(true);
            const { data } = await axios.get(`/api/interview-questions/${interviewId}`);
            setSessions((prev) => [...prev, data.question]);
            setQuestionId(data.question?.id);
            toast.success(data.message);
        } catch (error: any) {
            toast.error(error?.response?.data?.message || "Error fetching interview data");
        } finally {
            setIsQuestionLoading(false);
        }
    }, [interviewId]);

    useEffect(() => {
        const fetchQuestions = async () => {
            try {
                const { data } = await axios.get(`/api/interview-datas/${interviewId}`, {
                    headers: { 'Content-Type': 'application/json' },
                    withCredentials: true
                });

                if (data.success) {
                    toast.success(data.message);
                    setSessions(data.data);
                    setQuestionId(data.data[0]?.id);
                } else {
                    toast.success(data.message);
                }
            } catch (error: any) {
                toast.error(error?.response?.data?.message || "Error fetching interview data");
                router.push('/home');
            }
        };
        fetchQuestions();
    }, [interviewId]);

    useEffect(() => {
        bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [sessions]);

    const handleAnswerSubmit = async (answer: string, questionId: string) => {
        try {
            if (!answer) return toast.error("Please enter an answer");
            if (!questionId) return toast.error("No question found");

            setIsSubmitting(true);

            setSessions((prev) =>
                prev.map((session) =>
                    session.id === questionId ? { ...session, answer } : session
                )
            );

            setIsFeedbackLoading(true);

            const { data } = await axios.post(`/api/interview-questions/${interviewId}`, {
                answer,
                questionId
            }, {
                headers: { 'Content-Type': 'application/json' },
                withCredentials: true
            });

            if (data.success) {
                setSessions((prev) =>
                    prev.map((session) =>
                        session.id === questionId ? { ...session, response: data.data } : session
                    )
                );
                toast.success(data.message);
            } else {
                toast.error(data.message);
            }
        } catch (err: any) {
            toast.error(err?.response?.data?.message || "Error submitting answer");
        } finally {
            setIsFeedbackLoading(false);
            setIsSubmitting(false);
        }
    };

    const stopInterviewSession = async () => {
        try {
            const { data } = await axios.post(`/api/stop-interview-session/${interviewId}`, {
                headers: { 'Content-Type': 'application/json' },
                withCredentials: true
            });

            if (data.success) {
                toast.success(data.message);
                router.push('/home');
            } else {
                toast.error(data.message);
            }
        } catch (error: any) {
            toast.error(error?.response?.data?.message || "Error stopping interview session");
        }
    };

    return (
        <>
            <nav className="w-full fixed top-0 left-0 px-6 py-4 bg-white shadow z-50">
                <div className="max-w-7xl mx-auto flex items-center justify-between">
                    <AlertDialog>
                        <AlertDialogTrigger asChild>
                            <Button variant="link" className="text-blue-600 font-lg">← Back</Button>
                        </AlertDialogTrigger>
                        <AlertDialogContent>
                            <AlertDialogHeader>
                                <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
                                <AlertDialogDescription>
                                    This action cannot be undone. This will permanently stop your session and you can't continue it later.
                                </AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                                <AlertDialogCancel>Cancel</AlertDialogCancel>
                                <AlertDialogAction onClick={stopInterviewSession}>
                                    OK
                                </AlertDialogAction>
                            </AlertDialogFooter>
                        </AlertDialogContent>
                    </AlertDialog>

                    <h1
                        className="text-2xl font-bold tracking-wide text-gray-800"
                        style={{ fontFamily: "Titillium Web" }}
                    >
                        PREPIFY
                    </h1>
                    <div className="w-16"></div>
                </div>
            </nav>

            <div className="min-h-screen bg-slate-50 pt-24">
                <h1 className="text-3xl font-bold text-center mb-6">Interview Session</h1>

                <div className="h-[70vh] overflow-y-auto px-4 md:px-12 lg:px-48 space-y-8 pb-36">
                    {sessions.map((session) => (
                        <ChatSession
                            key={session.id}
                            session={session}
                            isQuestionLoading={isQuestionLoading}
                            isFeedbackLoading={isFeedbackLoading}
                        />
                    ))}

                    <div ref={bottomRef} onClick={fetchInterviewQuestions} className="w-full flex justify-center">
                        <Button>Next Question</Button>
                    </div>
                </div>
                <ChatInput questionId={questionId} onSubmit={handleAnswerSubmit} isSubmitting={isSubmitting} />

            </div>
        </>
    );
}

export default InterviewSectionPage;
