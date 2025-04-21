'use client';

import React, { useCallback, useEffect, useRef, useState } from 'react';
import { useParams } from 'next/navigation';
import axios from 'axios';
import { toast } from "sonner";
import ChatSession from '@/components/ChatSession';
import ChatInput from '@/components/ChatInput';
import { Button } from '@/components/ui/button';

function InterviewSectionPage() {
    const { interviewId } = useParams();
    const bottomRef = useRef<HTMLDivElement | null>(null);

    const [sessions, setSessions] = useState<any[]>([]);
    const [answer, setAnswer] = useState('');
    const [questionId, setQuestionId] = useState('');

    const fetchInterviewData = useCallback(async () => {
        try {
            const { data } = await axios.get(`/api/interview-questions/${interviewId}`);
            setSessions(data.question);
            const last = data.question?.[data.question.length - 1];
            if (last?.id) setQuestionId(last.id);
            toast.success(data.message);
        } catch (error: any) {
            const questions = error?.response?.data?.questions || [];
            setSessions(questions);
            const last = questions[questions.length - 1];
            if (last?.id) setQuestionId(last.id);
            toast.error(error?.response?.data?.message || "Error fetching interview data");
        }
    }, [interviewId]);

    useEffect(() => {
        fetchInterviewData();
    }, [fetchInterviewData]);

    useEffect(() => {
        bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [sessions]);

    const handleAnswerSubmit = async () => {
        try {
            const { data } = await axios.post(`/api/interview-questions/${interviewId}`, {
                answer, questionId
            }, {
                headers: { 'Content-Type': 'application/json' },
                withCredentials: true
            });

            if (data.success) {
                setSessions((prev) =>
                    prev.map((session) =>
                        session.id === questionId
                            ? { ...session, answer, response: data.data }
                            : session
                    )
                );
                toast.success(data.message);
            } else {
                toast.error(data.message);
            }
        } catch (err: any) {
            toast.error(err?.response?.data?.message || "Error submitting answer");
        } finally {
            setAnswer('');
        }
    };

    return (
        <div className="min-h-screen bg-slate-50 pt-24">
            <h1 className="text-3xl font-bold text-center mb-6">Interview Session #{interviewId}</h1>

            <div className="h-[70vh] overflow-y-auto px-4 md:px-12 lg:px-48 space-y-8 pb-36">
                {sessions.map((session, index) => (
                    <ChatSession key={index} session={session} />
                ))}

                <div onClick={fetchInterviewData} className="w-full flex justify-center">
                    <Button>Next Question</Button>
                </div>

                <div ref={bottomRef} />
            </div>

            <ChatInput answer={answer} onChange={(e) => setAnswer(e.target.value)} onSubmit={handleAnswerSubmit} />
        </div>
    );
}

export default InterviewSectionPage;
