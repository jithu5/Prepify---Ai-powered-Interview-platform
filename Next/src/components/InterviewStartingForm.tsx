"use client"
import React from 'react'
import { useForm } from 'react-hook-form';
import { useState } from 'react';
import axios from 'axios';
import { Button } from '@/components/ui/button';
import { Loader2, X } from "lucide-react"
import { toast } from 'sonner';
import { useRouter } from 'next/navigation';

type InterviewFormData = {
    position: string;
    level: string;
    interviewType: string;
    techStacks: string[];
};


function InterviewStartingForm() {
    const {
        register,
        handleSubmit,
        setValue,
        formState: { errors, isSubmitting }
    } = useForm<InterviewFormData>();

    const [techStacks, setTechStacks] = useState<string[]>([]);
    const [techInput, setTechInput] = useState('');
    const router = useRouter();

    const addTechStack = (e: React.KeyboardEvent<HTMLInputElement>) => {
        if (e.key === 'Enter' && techInput.trim()) {
            e.preventDefault();
            const tech = techInput.trim();
            if (!techStacks.includes(tech)) {
                const updated = [...techStacks, tech];
                setTechStacks(updated);
                setValue('techStacks', updated); // sync with react-hook-form
            }
            setTechInput('');
        }
    };

    const removeTechStack = (tech: string) => {
        const updated = techStacks.filter(t => t !== tech);
        setTechStacks(updated);
        setValue('techStacks', updated); // sync with react-hook-form
    };

    const onSubmit = async (data: InterviewFormData) => {
        console.log('Interview started with:', data);

        try {
            const response = await axios.post(
                '/api/start-interview-session',
                data,
                {
                    headers: { 'Content-Type': 'application/json' },
                    withCredentials: true
                }
            );

            if (response.data.success) {
                console.log('Interview session started successfully:', response.data.data);
                toast.success(response.data.message)
                router.push(`/interview/${response.data.data.id}`);
            } else {
                console.error('Error starting interview session:', response.data.message);
                alert(response.data.message);
            }
        } catch (err) {
            if (axios.isAxiosError(err)) {

                const errMsg = err?.response?.data?.message;
                toast.error(errMsg);
            } else {
                toast.error("Server error in submitting")
            }
        }
    };
    return (
        <>
            <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center px-6 mt-10">
                <div className="max-w-xl w-full bg-white p-10 rounded-2xl shadow-xl">
                    <h1 className="text-3xl font-bold text-center mb-4">Let&apros;s Get Started</h1>
                    <p className="text-gray-600 text-center mb-8">
                        Fill in your details so we can generate a personalized interview experience.
                    </p>

                    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Role You&apros;re Preparing For</label>
                            <input
                                type="text"
                                placeholder="e.g., DevOps Engineer"
                                {...register('position', { required: true })}
                                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring focus:ring-blue-200 outline-none"
                            />
                            {errors.position && <span className="text-red-500 text-sm">This field is required</span>}
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Select Your Level</label>
                            <select
                                {...register('level', { required: true })}
                                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring focus:ring-blue-200 outline-none bg-white"
                            >
                                <option value="">-- Choose Level --</option>
                                <option value="intern">Intern</option>
                                <option value="entry">Entry Level</option>
                                <option value="junior">Junior Developer</option>
                                <option value="senior">Senior Developer</option>
                            </select>
                            {errors.level && <span className="text-red-500 text-sm">This field is required</span>}
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Select Interview Type</label>
                            <select
                                {...register('interviewType', { required: true })}
                                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring focus:ring-blue-200 outline-none bg-white"
                            >
                                <option value="">-- Choose Type --</option>
                                <option value="technical">Technical</option>
                                <option value="behavioral">Behavioral</option>
                            </select>
                            {errors.interviewType && <span className="text-red-500 text-sm">This field is required</span>}
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                Tech Stacks (press Enter to add)
                            </label>
                            <input
                                type="text"
                                value={techInput}
                                onChange={(e) => setTechInput(e.target.value)}
                                onKeyDown={addTechStack}
                                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring focus:ring-blue-200 outline-none"
                                placeholder="e.g., React, TypeScript"
                            />
                            <div className="flex flex-wrap gap-2 mt-2">
                                {techStacks.map((tech, index) => (
                                    <span
                                        key={index}
                                        className="bg-blue-100 px-3 py-1 rounded-full text-sm flex items-center gap-2"
                                    >
                                        {tech}
                                        <button
                                            type="button"
                                            onClick={() => removeTechStack(tech)}
                                            className="text-red-500 font-bold"
                                        >
                                            <X size={14} className='cursor-pointer' />
                                        </button>
                                    </span>
                                ))}
                            </div>
                        </div>

                        <Button
                            type="submit"
                            className="w-full text-white py-3 rounded-lg font-semibold transition"
                        >
                            {isSubmitting ? (<> Starting...<Loader2 size={4} /></>) : "Start Interview"}
                        </Button>
                    </form>
                </div>
            </div>
        </>
    )
}

export default InterviewStartingForm
