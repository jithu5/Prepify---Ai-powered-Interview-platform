"use client"
import React, { useEffect, useState } from 'react'
import { ProfileProps } from './ProfileTabs'
import { Card } from './ui/card';
import { useRouter } from 'next/navigation';
import axios from 'axios';
import { toast } from 'sonner';
import { Button } from './ui/button';
import { Loader2 } from 'lucide-react';
import { Pagination, PaginationContent, PaginationItem, PaginationLink, PaginationNext, PaginationPrevious } from './ui/pagination';

interface IPost {
    question: string
    id: string
}
interface Answer {
    id: string;
    answer: string;
    created_at: Date;
    post: IPost
}

const formatDate = (dateStr: string) =>
    new Date(dateStr).toLocaleDateString("en-GB", {
        day: "2-digit",
        month: "short",
        year: "numeric",
    })


function AnswersTab({ setProfileData }: ProfileProps) {
    const [answers, setAnswers] = useState<Answer[]>([])
    const [page, setPage] = useState<number>(1);
    const [limit, setLimit] = useState<number>(25);
    const [totalAnswers, setTotalAnswers] = useState<number>(0);
    const [deletingAnswerId, setDeletingAnswerId] = useState<string | null>(null);

    const router = useRouter()

    useEffect(() => {
        const fetchUsersAnswers = async () => {
            try {
                const { data } = await axios.get(`/api/get-users-answer?page=${page}&limit=${limit}`, {
                    withCredentials: true,
                    headers: { 'Content-Type': 'application/json' }
                })
                if (data.success) {
                    toast.success(data.message);
                    setAnswers(data.data);

                    setTotalAnswers(data.totalAnswers || 0);  // 👈 Save total number of posts
                    return;
                }
                toast.error(data.message);
            } catch (error: any) {
                const errMsg = error?.response?.data?.message || "Server Error";
                toast.error(errMsg);
            }
        }

        fetchUsersAnswers()
    }, [page, limit])
    console.log(answers)

    const deletePost = async (answerId: string) => {
        setDeletingAnswerId(answerId); // show progress
        try {
            const { data } = await axios.delete(`/api/delete-answer/${answerId}`, {
                headers: {
                    'Content-Type': "application/json",
                },
                withCredentials: true
            })
            if (data.success) {
                toast.success(data.message)
                setAnswers(prevAnswer => {
                    return prevAnswer.filter(answer => answer.id !== answerId)
                })
                setProfileData((prevData) => {
                    if (!prevData) return prevData;
                    return { ...prevData, Answerlength: prevData.Answerlength - 1 }
                })
                return
            }
            toast.error(data.message)
        } catch (error: any) {
            const errMsg = error?.response?.data?.message || "Server Error in deleting post"
            toast.error(errMsg)
        } finally {
            setDeletingAnswerId(null);
        }
    }
    const totalPages = Math.ceil(totalAnswers / limit);
    return (
        <>
            {
                answers.length === 0 && (
                    <div className='flex justify-center items-center'>
                        <p>No Answers posted</p>
                    </div>
                )
            }
            {answers && answers.length > 0 && answers.map((answer) => (
                <Card key={answer.id} onClick={() => router.push(`/community/${answer.post.id}`)} className="p-4 my-2 relative group">
                    <div className="cursor-pointer">
                        <h3 className='text-xl font-semibold my-3 mt-5 text-stone-900'>{answer.post.question}</h3>
                        <p className="font-medium text-sm text-stone-700">{answer.answer}</p>
                        <p className="text-sm text-muted-foreground">
                            Posted on: {formatDate(new Date(answer.created_at).toISOString())}
                        </p>

                    </div>

                    {/* Delete Button */}
                    <Button variant={'link'}
                        onClick={(e) => {
                            e.stopPropagation();
                            deletePost(answer.id);
                        }}
                        className="absolute top-0 right-2.5 text-sm text-red-500 hover:underline disabled:opacity-50"
                        disabled={deletingAnswerId === answer.id}
                    >
                        {deletingAnswerId === answer.id ? (
                            <Loader2 className="w-4 h-4 animate-spin" />
                        ) : (
                            "Delete"
                        )}
                    </Button>
                </Card>

            ))}
            {/* Pagination */}
            <Pagination>
                <PaginationContent>

                    {/* Previous */}
                    <PaginationItem>
                        <PaginationPrevious
                            className={`cursor-pointer ${page === 1 ? 'opacity-50 pointer-events-none' : ''}`}
                            onClick={() => {
                                if (page > 1) setPage(prev => prev - 1);
                            }}
                        />
                    </PaginationItem>

                    {/* Current Page */}
                    <PaginationItem>
                        <PaginationLink isActive>
                            {page}
                        </PaginationLink>
                    </PaginationItem>

                    {/* Next */}
                    <PaginationItem>
                        <PaginationNext
                            className={`cursor-pointer ${page === totalPages ? 'opacity-50 pointer-events-none' : ''}`}
                            onClick={() => {
                                if (page < totalPages) setPage(prev => prev + 1);
                            }}
                        />
                    </PaginationItem>
                </PaginationContent>
            </Pagination>
        </>
    )
}

export default AnswersTab
