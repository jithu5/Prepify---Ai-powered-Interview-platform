// components/ChatInput.tsx

import React, { useRef, useState } from 'react';
import { Button } from '@/components/ui/button';
import axios from 'axios';
import { toast } from 'sonner';

type Props = {
    onSubmit: (answer:string,questionId:string) => void;
    questionId:string
    isSubmitting:boolean
};

export default function ChatInput({ onSubmit, questionId,isSubmitting }: Props) {
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
                    audioChunksRef.current = [];

                    mediaRecorder.ondataavailable = (event) => {
                        audioChunksRef.current.push(event.data);
                    };

                    mediaRecorder.onstop = () => {
                        const audioBlob = new Blob(audioChunksRef.current, {
                            type: "audio/wav",
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

    // Upload audio file
    const uploadAudio = async (e: React.FormEvent) => {
        e.preventDefault();
        
        if (audioBlob) {
            try {
                const file = new File([audioBlob], "audio.wav", { type: audioBlob.type });
                const formData = new FormData();
                formData.append("audio", file);

                for (const [key, value] of formData.entries()) {
                    console.log(`${key}:`, value);
                }
                const { data } = await axios.post("/api/speech-to-text", formData, {
                    withCredentials: true
                });
                console.log(data);
                await onSubmit(data.transcription,questionId)
            } catch (err) {
                if (axios.isAxiosError(err)) {

                    const errMsg = err?.response?.data?.message;
                    toast.error(errMsg);
                } else {
                    toast.error("Server error in submitting")
                }
            }
        } else {
            console.error("No audio data to upload.");
        }
    };
    return (
        <form
            onSubmit={uploadAudio}
            encType="multipart/form-data"
            className="flex flex-col items-center justify-center gap-5 fixed bottom-2 left-1/2 -translate-x-1/2"
        >
            {/* Recording Section */}
            <div className="flex flex-col items-center justify-center gap-6 mt-4">

                {/* Cool Wave Animation when recording */}
                {isRecording && (
                    <div className="flex items-center justify-center space-x-1">
                        {Array.from({ length: 5 }).map((_, i) => (
                            <span
                                key={i}
                                className="w-2 rounded-full"
                                style={{
                                    animation: `wave 1.2s infinite ease-in-out`,
                                    animationDelay: `${i * 0.2}s`,
                                    height: "20px",
                                    background: `linear-gradient(45deg, #60A5FA, #8B5CF6, #EC4899, #F59E0B)`,
                                    backgroundSize: "400% 400%",
                                    animationDirection: "alternate"
                                }}
                            ></span>
                        ))}
                    </div>
                )}

                {/* Buttons */}
                <div className="flex gap-4">
                    <Button
                        type="button"
                        onClick={isRecording ? stopRecording : startRecording}
                        variant={isRecording ? "destructive" : "default"}
                    >
                        {isRecording ? "Stop Recording" : "Start Recording"}
                    </Button>

                    <Button
                        type="button"
                        onClick={uploadAudio}
                        disabled={!audioBlob}
                    >
                        {isSubmitting?"sending...":"Send Audio"}
                    </Button>
                </div>
            </div>

            {/* Extra: Wave Animation Keyframes */}
            <style jsx>{`
    @keyframes wave {
      0%, 100% {
        transform: scaleY(1);
      }
      50% {
        transform: scaleY(2.5);
      }
    }
  `}</style>
        </form>

    );
}
