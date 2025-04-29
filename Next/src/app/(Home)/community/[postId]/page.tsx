"use client";
import React, { useEffect, useState } from "react";
import axios from "axios";
import { useParams } from "next/navigation";

interface Post {
    id: string;
    question: string;
    answer: string;
    likes: string[]; // user_ids
    comments: {
        id: string;
        text: string;
        user_id: string;
        created_at: string;
    }[];
    created_at:Date,
    updated_at:Date,
    user_id:string
}

interface UserSession {
    id: string;
}

function PostPage() {
    const [post, setPost] = useState<Post | null>(null);
    const [userId, setUserId] = useState<string>(""); // Replace with session logic
    const {postId} = useParams()

    useEffect(() => {
        const fetchData = async () => {
            const res = await axios.get(`/api/post-byId/${postId}`); // Replace 123 with post ID
            setPost(res.data.post);
            setUserId(res.data.userId); // example user ID from session
        };
        fetchData();
    }, []);
    console.log(post)
    const hasLiked = post?.likes.includes(userId);

    const handleLikeToggle = async () => {
        if (!post) return;

        const res = await axios.post("/api/posts/like", {
            postId: post.id,
            userId,
        });

        setPost(prev =>
            prev
                ? {
                    ...prev,
                    likes: res.data.likes,
                }
                : null
        );
    };

    if (!post) return <p>Loading...</p>;

    return (
        <div className="max-w-2xl mx-auto mt-24 min-h-screen p-6 bg-white border border-gray-200 rounded-2xl shadow-lg">
            {/* Question */}
            <div className="mb-6">
                <h1 className="text-2xl font-bold text-gray-800 mb-2">Question</h1>
                <p className="text-gray-700 text-base leading-relaxed">{post.question}</p>
            </div>

            {/* Answer */}
            <div className="mb-8">
                <h2 className="text-xl font-semibold text-gray-800 mb-2">Answer</h2>
                <p className="text-gray-700 text-base leading-relaxed">{post.answer}</p>
            </div>

            {/* Like Section */}
            <div className="flex items-center justify-between mb-10">
                <button
                    onClick={handleLikeToggle}
                    className={`flex items-center gap-2 px-5 py-2.5 rounded-full transition-all duration-300 shadow 
        ${hasLiked ? "bg-blue-600 text-white hover:bg-blue-700" : "bg-gray-200 text-gray-800 hover:bg-gray-300"}
      `}
                >
                    {hasLiked ? "❤️ Liked" : "🤍 Like"}
                </button>
                <span className="text-gray-600">{post.likes.length} {post.likes.length === 1 ? "like" : "likes"}</span>
            </div>

            {/* Comments */}
            <div>
                <h3 className="text-lg font-semibold text-gray-800 mb-4">Comments</h3>
                <ul className="space-y-4">
                    {post.comments.map(comment => (
                        <li key={comment.id} className="p-4 bg-gray-50 border border-gray-200 rounded-xl">
                            <p className="text-gray-700">{comment.text}</p>
                            <div className="text-sm text-gray-500 mt-2">
                                by <span className="font-medium">{comment.user_id}</span> •{" "}
                                {new Date(comment.created_at).toLocaleString()}
                            </div>
                        </li>
                    ))}
                </ul>
            </div>
        </div>

    );
}

export default PostPage;
