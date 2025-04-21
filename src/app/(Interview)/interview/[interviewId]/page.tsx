'use client';

import React, { useCallback, useEffect, useRef, useState } from 'react';
import { useParams } from 'next/navigation';
import axios from 'axios';
import { toast } from "sonner";
import ChatSession from '@/components/ChatSession';
import ChatInput from '@/components/ChatInput';
import { Button } from '@/components/ui/button';
import '@fontsource/titillium-web';
import { useRouter } from 'next/navigation';

function InterviewSectionPage() {
    const { interviewId } = useParams();
    const bottomRef = useRef<HTMLDivElement | null>(null);

    const [sessions, setSessions] = useState<any[]>([]);
    const [answer, setAnswer] = useState<string>('');
    const [questionId, setQuestionId] = useState<string>('');
    const router = useRouter()

    const fetchInterviewData = useCallback(async () => {
        try {
            const { data } = await axios.get(`/api/interview-questions/${interviewId}`);
            setSessions((prevSessions => [...prevSessions, ...data.question]));
            const last = data.question?.[sessions.length];
            console.log(last)
            if (last?.id) setQuestionId(last.id);
            toast.success(data.message);
        } catch (error: any) {
            toast.error(error?.response?.data?.message || "Error fetching interview data");
        }
    }, [interviewId]);

    useEffect(() => {
        const fetchQuestions = async () => {
            try {
                const { data } = await axios.get(`/api/interview-datas/${interviewId}`, {
                    headers: { 'Content-Type': 'application/json' },
                    withCredentials: true
                })
                if (data.success) {
                    toast.success(data.message)
                    setSessions(data.data)
                    setQuestionId(data.data[0]?.id)
                } else {
                    toast.success(data.message)

                }
            } catch (error: any) {
                const errMessage = error?.response?.data?.message || "Error fetching interview data";
                toast.error(errMessage)
                router.push('/home')
            }
        }
        fetchQuestions()
    }, [interviewId])
console.log(questionId)

    useEffect(() => {
        bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [sessions]);

    const handleAnswerSubmit = async (answer:string,questionId:string) => {
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

    const stopInterviewSession = async()=>{
        try {
            const {data} = await axios.post(`/api/stop-interview-session/${interviewId}`,{
                headers: { 'Content-Type': 'application/json' },
                withCredentials: true
            })
            if(data.success){
                toast.success(data.message)
                router.push('/home')
            }else{
                toast.error(data.message)
            }
        } catch (error:any) {
            const errMessage = error?.response?.data?.message || "Error stopping interview session";
            toast.error(errMessage)
        }
    }

    return (
        <>
            <nav className="w-full fixed top-0 left-0 px-6 py-4 bg-white shadow z-50">
                <div className="max-w-7xl mx-auto flex items-center justify-between">
                    <Button onClick={() =>
                        toast("Are you sure?", {
                            description: "This will end the interview session",
                            action: {
                                label: "Yes",
                                onClick: () =>stopInterviewSession(),
                            },
                        })
                    } variant="link" className="text-blue-600 font-medium">
                        ← Back
                    </Button>
                    <h1
                        className="text-2xl font-bold tracking-wide text-gray-800"
                        style={{ fontFamily: "Titillium Web" }}
                    >
                        PREPIFY
                    </h1>
                    <div className="w-16">{/* empty space for centering effect */}</div>
                </div>
            </nav>

            <div className="min-h-screen bg-slate-50 pt-24">
                <h1 className="text-3xl font-bold text-center mb-6">Interview Session</h1>

                <div className="h-[70vh] overflow-y-auto px-4 md:px-12 lg:px-48 space-y-8 pb-36">
                    {sessions.map((session, index) => (
                        <ChatSession key={index} session={session} />
                    ))}
                    <div ref={bottomRef} onClick={fetchInterviewData} className="w-full flex justify-center">
                        <Button>Next Question</Button>
                    </div>

                </div>

                <ChatInput answer={answer} onChange={(e) => setAnswer(e.target.value)} onSubmit={()=>handleAnswerSubmit(answer,questionId)} />
            </div>
        </>
    );
}

export default InterviewSectionPage;
