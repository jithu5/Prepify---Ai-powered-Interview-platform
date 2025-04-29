"use client";
import React, { useEffect, useState } from "react";
import axios from "axios";
import { useParams } from "next/navigation";
import { Loader2 } from "lucide-react";
import dayjs from 'dayjs' 
import relativeTime from "dayjs/plugin/relativeTime";
import updateLocale from "dayjs/plugin/updateLocale";

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
    created_at: Date,
    updated_at: Date,
    user_id: string
}

dayjs.extend(relativeTime);
dayjs.extend(updateLocale);


// Customize thresholds
dayjs.updateLocale("en", {
    relativeTime: {
        future: "in %s",
        past: "%s ago",
        s: "a few seconds",
        m: "a minute",
        mm: "%d minutes",
        h: "an hour",
        hh: "%d hours",
        d: "a day",
        dd: "%d days",
        w: "a week",
        ww: "%d weeks",
        M: "a month",
        MM: "%d months",
        y: "a year",
        yy: "%d years",
    }
});

export function formatRelativeTime(dateStr: string): string {
    const now = dayjs();
    const date = dayjs(dateStr);

    const yearsDiff = now.diff(date, "year");
    const monthsDiff = now.diff(date, "month");
    const weeksDiff = now.diff(date, "week");

    if (yearsDiff >= 1) {
        return date.format("MMMM YYYY"); // Example: April 2024
    } else if (monthsDiff >= 1) {
        return `${monthsDiff} month${monthsDiff > 1 ? "s" : ""} ago`;
    } else if (weeksDiff >= 1) {
        return `${weeksDiff} week${weeksDiff > 1 ? "s" : ""} ago`;
    } else {
        return date.fromNow(); // e.g. "3 days ago", "2 hours ago"
    }
}

function PostPage() {
    const [post, setPost] = useState<Post | null>(null);
    const [userId, setUserId] = useState<string>(""); // Replace with session logic
    const { postId } = useParams()

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

    if (!post) return (
        <div className="min-h-screen w-full flex justify-center items-center">
            <Loader2 className="w-24 h-24 animate-spin" />
        </div>
    );

    return (
        <div className="max-w-7xl mx-auto mt-24 px-4 py-10 grid grid-cols-1 md:grid-cols-3 lg:grid-cols-3 gap-2 font-sans relative">

            {/* MAIN CONTENT */}
            <div className="lg:col-span-2 space-y-8">

                {/* Question */}
                <div className="space-y-2">
                    <h1 className="text-4xl font-bold text-gray-900 capitalize">
                        {post.question}
                    </h1>
                    <h1 className="text-xl font-medium text-gray-800 capitalize">
                        Answer: {post.answer}
                    </h1>
                    <div className="text-sm text-gray-600 flex items-center gap-2">
                        <img src="/amazon-logo.png" alt="Amazon" className="w-5 h-5" />
                        <span>Asked at Amazon • {formatRelativeTime(new Date(post.created_at).toISOString())}</span>
                    </div>
                </div>

                {/* Actions */}
                <div className="flex flex-wrap gap-2">
                    {["⭐ Save 45", "👍 I was asked this", "🔗 Share", "🚩 Flag"].map((text) => (
                        <button
                            key={text}
                            className="px-3 py-1 rounded-md border bg-white text-sm hover:bg-gray-50 shadow-sm"
                        >
                            {text}
                        </button>
                    ))}
                </div>

                {/* Guidelines */}
                <div className="bg-gray-50 border border-gray-200 rounded-lg p-4 text-sm text-gray-700 space-y-2">
                    <p className="font-semibold">Community Guidelines</p>
                    <ul className="list-disc pl-5 space-y-1">
                        <li>
                            <strong>Stay on topic.</strong> Use this section for submitting
                            solutions and providing feedback.
                        </li>
                        <li>
                            <strong>Be inclusive.</strong> Respect everyone’s opinions and
                            beliefs.
                        </li>
                    </ul>
                </div>

                {/* Answer Input */}
                <div className="flex gap-3 items-start">
                    <div className="w-10 h-10 rounded-full bg-green-500 text-white flex items-center justify-center font-bold">
                        A
                    </div>
                    <textarea
                        placeholder="Add your own answer to this question..."
                        className="w-full p-3 border border-gray-300 rounded-lg resize-none shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                        rows={4}
                    ></textarea>
                </div>

                {/* Answers */}
                <div>
                    <h2 className="text-xl font-semibold text-gray-900 mb-4">
                        Answers (34)
                    </h2>

                    <div className="bg-white border border-gray-200 rounded-lg p-4 shadow-sm">
                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-3">
                                <div className="w-8 h-8 rounded-full bg-gray-300 flex items-center justify-center font-bold text-sm">
                                    BS
                                </div>
                                <div>
                                    <p className="font-semibold text-gray-900">
                                        Brijesh S.
                                        <span className="ml-2 text-purple-600 text-sm bg-purple-100 px-2 py-0.5 rounded-full">
                                            Member ⭐ 1k
                                        </span>
                                    </p>
                                    <p className="text-sm text-gray-500">April 17, 2025</p>
                                </div>
                            </div>
                            <div className="text-orange-600 text-sm font-semibold">
                                🔥 Hot
                            </div>
                        </div>
                        <p className="mt-3 text-gray-800 leading-relaxed">
                            A visionary who is committed to address real world problems with
                            guts, data, and leadership. A PM is the voice of the user and
                            prioritizes what brings most value to the customer and business.
                        </p>
                    </div>
                </div>
            </div>
            {/* <Separator orientation="vertical" /> */}
            {/* SIDEBAR */}
            <aside className="space-y-6 ">
                {/* Interview Details */}
                <div className="bg-white p-4 border rounded-lg shadow-sm">
                    <h3 className="font-semibold text-gray-900 mb-2">Interview Details</h3>
                    <p><strong>Role:</strong> Product Manager</p>
                    <p><strong>Company:</strong> Amazon</p>
                    <p><strong>Category:</strong> Behavioral</p>
                </div>

                {/* Related Questions */}
                <div className="bg-white p-4 border rounded-lg shadow-sm">
                    <h3 className="font-semibold text-gray-900 mb-2">Related Questions</h3>
                    <ul className="space-y-2 text-sm">
                        <li className="text-blue-600 hover:underline">
                            How would you explain the role of a product manager to a 4-year-old?
                        </li>
                        <li className="text-blue-600 hover:underline">
                            You're an Apple product manager. Improve the iPhone Notes app.
                        </li>
                    </ul>
                </div>
            </aside>
        </div>
    );
}

export default PostPage;
