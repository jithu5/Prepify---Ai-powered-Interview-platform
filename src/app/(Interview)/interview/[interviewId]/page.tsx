'use client';

import React, { FormEvent, useCallback, useEffect, useRef, useState } from 'react';
import { useParams } from 'next/navigation';
import axios from 'axios';
import { toast } from "sonner";
import ChatSession from '@/components/ChatSession';
import ChatInput from '@/components/ChatInput';
import { Button } from '@/components/ui/button';
import '@fontsource/titillium-web';
import { useRouter } from 'next/navigation';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';

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
    const bottomRef = useRef<HTMLDivElement | null>(null);

    const [sessions, setSessions] = useState<Session[]>([]);
    const [answer, setAnswer] = useState<string>('');
    const [questionId, setQuestionId] = useState<string>('');
    const [isQuestionLoading, setIsQuestionLoading] = useState<boolean>(false)
    const [isFeedbackLoading, setIsFeedbackLoading] = useState<boolean>(false)
    const [isSubmitting, setIsSubmitting] = useState<boolean>(false)
    const router = useRouter()

    const [isRecording, setIsRecording] = useState(false);
    const [audioBlob, setAudioBlob] = useState<Blob | null>(null);
    const mediaRecorderRef = useRef<MediaRecorder | null>(null);
    const audioChunksRef = useRef<Blob[]>([]);

    // Start recording
    const startRecording = () => {
        if (navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
            navigator.mediaDevices
                .getUserMedia({ audio: true })
                .then((stream) => {
                    const mediaRecorder = new MediaRecorder(stream);
                    mediaRecorderRef.current = mediaRecorder;
                    audioChunksRef.current = [];  // Clear old audio chunks

                    mediaRecorder.ondataavailable = (event) => {
                        audioChunksRef.current.push(event.data);
                    };

                    mediaRecorder.onstop = () => {
                        const audioBlob = new Blob(audioChunksRef.current, {
                            type: "audio/mp3",
                        });
                        setAudioBlob(audioBlob);
                    };

                    mediaRecorder.start();
                    setIsRecording(true);
                })
                .catch((error) => {
                    console.error("Error accessing audio device:", error);
                });
        } else {
            console.error("Your browser does not support audio recording.");
        }
    };

    // Stop recording
    const stopRecording = () => {
        if (mediaRecorderRef.current) {
            mediaRecorderRef.current.stop();
            setIsRecording(false);
        } else {
            console.error("Recording has not started.");
        }
    };

    // Upload audio file to the backend
    const uploadAudio = async (e:FormEvent) => {
        e.preventDefault()
        if (audioBlob) {
            const audioUrl = URL.createObjectURL(audioBlob); // your Blob object
            const audio = new Audio(audioUrl);

            try {
                const file = new File([audioBlob], "audio.mp3", { type: audioBlob.type })
                const formData = new FormData();
                formData.append("audio", file); // `file` is the File object from input
                for (const [key, value] of formData.entries()) {
                    console.log(`${key}:`, value);
                }
                const { data } = await axios.post("/api/speech-to-text", formData, {
                    withCredentials: true
                })
                console.log(data)
            } catch (error) {
                console.error(error)
            }

        } else {
            console.error("No audio data to upload.");
        }
    };


    const fetchInterviewQuestions = useCallback(async () => {
        try {
            setIsQuestionLoading(true)
            const { data } = await axios.get(`/api/interview-questions/${interviewId}`);
            setSessions((prevSessions => [...prevSessions, data.question]));
            console.log(data.question)
            setQuestionId(data.question?.id);
            toast.success(data.message);
        } catch (error: any) {
            toast.error(error?.response?.data?.message || "Error fetching interview data");
        }
        finally {
            setIsQuestionLoading(false)
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

    const handleAnswerSubmit = async (answer: string, questionId: string) => {
        try {
            if (!answer) return toast.error("Please enter an answer");
            if (!questionId) return toast.error("No question found");
            setIsSubmitting(true)
            setSessions((prev) =>
                prev.map((session) =>
                    session.id === questionId
                        ? { ...session, answer }
                        : session
                )
            );
            setIsFeedbackLoading(true)
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
                            ? { ...session, response: data.data }
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
            setIsFeedbackLoading(false)
            setIsSubmitting(false)
        }
    };

    const stopInterviewSession = async () => {
        try {
            const { data } = await axios.post(`/api/stop-interview-session/${interviewId}`, {
                headers: { 'Content-Type': 'application/json' },
                withCredentials: true
            })
            if (data.success) {
                toast.success(data.message)
                router.push('/home')
            } else {
                toast.error(data.message)
            }
        } catch (error: any) {
            const errMessage = error?.response?.data?.message || "Error stopping interview session";
            toast.error(errMessage)
        }
    }

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
                                    This action cannot be undone. This will permanently Stop your
                                    session and cant take this later.
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
                    <div className="w-16">{/* empty space for centering effect */}</div>
                </div>
            </nav>

            <div className="min-h-screen bg-slate-50 pt-24">
                <h1 className="text-3xl font-bold text-center mb-6">Interview Session</h1>

                <div className="h-[70vh] overflow-y-auto px-4 md:px-12 lg:px-48 space-y-8 pb-36">
                    {sessions.map((session) => (
                        <ChatSession key={session.id} session={session} isQuestionLoading={isQuestionLoading} isFeedbackLoading={isFeedbackLoading} />
                    ))}
                    <div ref={bottomRef} onClick={fetchInterviewQuestions} className="w-full flex justify-center">
                        <Button>Next Question</Button>
                    </div>

                </div>
                <form onSubmit={uploadAudio} encType='multipart/form-data' className='flex justify-center gap-5 items-center'>
                    <h1>Audio Recorder</h1>
                    <Button type='button' onClick={startRecording} disabled={isRecording}>
                        Start Recording
                    </Button>
                    <Button type='button' onClick={stopRecording} disabled={!isRecording}>
                        Stop Recording
                    </Button>
                    <Button type='submit' disabled={!audioBlob}>
                        Upload Audio
                    </Button>
                </form>
            </div>
        </>
    );
}

export default InterviewSectionPage;
