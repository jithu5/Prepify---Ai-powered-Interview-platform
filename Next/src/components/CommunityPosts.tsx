"use client";
import React, { useCallback, useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Loader2, ThumbsUp } from 'lucide-react';
import { Separator } from '@/components/ui/separator';
import CommunityPostForm from './CommunityPostForm';
import axios from 'axios';
import { toast } from 'sonner';
import {
    Pagination, PaginationContent, PaginationItem,
    PaginationLink, PaginationNext, PaginationPrevious
} from './ui/pagination';
import PostsButtons from './PostsButtons';
import { formatRelativeTime } from '@/lib/FormateRelativeTime';
import { useForm } from 'react-hook-form';
import { useRouter } from 'next/navigation';

export interface Post {
    id: string;
    question: string;
    answer: string;
    user_id: string;
    created_at: Date;
    updated_at?: Date;
    likes: string[]
    answers: string[],
    username: string
    tags: string[]
}

function CommunityPosts() {
    const { handleSubmit, register, reset, formState: { isSubmitting } } = useForm<{tags: string}>()
    const [posts, setPosts] = useState<Post[]>([]);
    const [openForm, setOpenForm] = useState<boolean>(false);
    const [page, setPage] = useState<number>(1);
    const [limit, setLimit] = useState<number>(25);
    const [totalPosts, setTotalPosts] = useState<number>(0);
    const [loadingPosts, setLoadingPosts] = useState<boolean>(false)
    const router=  useRouter()

    const fetchPosts = useCallback(async () => {
        setLoadingPosts(true)
        try {
            const { data } = await axios.get(`/api/get-community-posts?page=${page}&limit=${limit}`, {
                headers: { "Content-Type": "application/json" },
                withCredentials: true
            });

            if (data.success) {
                toast.success(data.message);
                setPosts(
                    data.data.map((post: Post) => ({
                        ...post,
                        likes: post.likes || [],
                    }))
                );

                setTotalPosts(data.totalPosts);  // 👈 Save total number of posts
                return;
            }
            toast.error(data.message);
        } catch (error: any) {
            const errMsg = error?.response?.data?.message || "Server Error";
            toast.error(errMsg);
        }
        finally {
            setLoadingPosts(false)
        }
    }, [page, limit])

    useEffect(() => {
        fetchPosts();
    }, [page]); // ✅ No cleanup👈 re-fetch when page changes

    const onSearch = async (formData: {tags:string}) => {
        console.log(formData)
        setLoadingPosts(true)
        try {
            const { data } = await axios.get(`/api/get-community-posts?page=${page}&limit=${limit}&tags=${formData.tags}`, {
                headers: { "Content-Type": "application/json" },
                withCredentials: true
            });

            if (data.success) {
                toast.success(data.message);
                setPosts(
                    data.data.map((post: Post) => ({
                        ...post,
                        likes: post.likes || [],
                    }))
                );

                setTotalPosts(data.totalPosts);  // 👈 Save total number of posts
                return;
            }
            toast.error(data.message);
        } catch (error: any) {
            const errMsg = error?.response?.data?.message || "Server Error";
            toast.error(errMsg);
        }
        finally {
            reset()
            setLoadingPosts(false)
        }
    }

    const totalPages = Math.ceil(totalPosts / limit);

    return (
        <>
            <main className="relative flex min-h-screen w-full bg-stone-50">

                {/* Sidebar */}
                <aside className="sticky top-36 left-0 h-[calc(100vh-144px)] w-64 bg-white border-r border-stone-200 shadow-sm p-6 flex flex-col gap-6 rounded-tr-2xl">
                    <form className='w-full' onSubmit={handleSubmit(onSearch)}>

                        <h2 className="text-xl font-semibold text-stone-800" style={{ fontFamily: 'Titillium Web' }}>
                            Menu
                        </h2>

                        <Input
                            {...register("tags", { required: true })}
                            type="text"
                            placeholder="Search interviews with tags..."
                            className="mt-2 focus-visible:ring-2 focus-visible:ring-stone-400"
                            style={{ fontFamily: 'Quicksand Variable' }}
                            />
                            <Button type='submit' className="mt-4 rounded-xl shadow-md hover:shadow-lg transition w-full" variant={'default'}>{isSubmitting?(
                                <>
                                    Searching... <Loader2 className='animate-spin'/>
                                </>
                            ):"Search"}</Button>
                         
                    </form>
                        <Button type='button' onClick={() => setOpenForm(true)} variant="default" className="mt-10 rounded-xl shadow-md hover:shadow-lg transition">
                            Add Interview
                        </Button>
                </aside>

                <Separator orientation="vertical" className="bg-stone-200" />

                {openForm && <CommunityPostForm open={openForm} onClose={() => setOpenForm(false)} refetchPosts={fetchPosts} />}

                {/* Main Content */}
                <section className="flex-1 p-8 w-[calc(100vw-256px)]">
                    {
                        loadingPosts && (
                            <div className='w-full flex items-center justify-center h-[50vh]'>
                                <Loader2 className='w-24 h-24 animate-spin' />
                            </div>
                        )
                    }
                    {
                        posts.length === 0 && (
                            <div className='w-full h-[60vh] flex justify-center items-center'>
                                <h1 className='text-4xl font-semibold text-stone-800'>No Posts yet...</h1>
                            </div>
                        )
                    }
                    {/* Posts */}
                    {!loadingPosts && posts.length > 0 && posts.map(post => (
                        <div key={post.id} onClick={()=>router.push(`/community/${post.id}`)} className="bg-white p-6 rounded-2xl shadow-md mb-8 flex flex-col gap-4 cursor-pointer">
                            {/* Username */}
                            <div className="text-sm text-stone-500 flex items-center px-2 justify-between" style={{ fontFamily: 'Quicksand Variable' }}>
                                <p>

                                    Posted by <span className="font-semibold text-stone-700">{post.username}</span>
                                </p>
                                <p>
                                    {formatRelativeTime(new Date(post.created_at)?.toISOString())}
                                </p>
                            </div>

                            {/* Question Title */}
                            <h2 className="text-2xl font-bold text-stone-900" style={{ fontFamily: 'Titillium Web' }}>
                                {post.question}
                            </h2>
                            <div className='w-full flex items-center gap-1'>
                                {post.tags && post.tags.map((tag, index) => (
                                    <span key={index} className='text-md font-light text-stone-700 italic'>#{tag}</span>
                                ))}
                            </div>
                            {/* Buttons */}
                            <PostsButtons post={post} setPosts={setPosts} />
                        </div>
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
                </section>
            </main>
        </>
    );
}

export default CommunityPosts
