"use client"
import React, { useState } from 'react';
import '@fontsource/titillium-web';
import '@fontsource-variable/quicksand';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Separator } from '@/components/ui/separator';

function CommunityPage() {
    const [isExpanded, setIsExpanded] = useState(false);
    const [posts,setPosts] = useState([])

    const handleToggle = () => {
        setIsExpanded((prev) => !prev);
    };

    const fullAnswer = `A closure is a feature in JavaScript where an inner function has access to the outer (enclosing) function’s variables, 
    even after the outer function has returned. Closures are created every time a function is created. 
    They are powerful because they allow functions to maintain access to their lexical scope, 
    enabling data encapsulation and function factories.`;

    const previewAnswer = `A closure is a feature in JavaScript where an inner function has access to the outer (enclosing) function’s variables...`;

    return (
        <>
            {/* Navbar */}
            <header className="w-full bg-gradient-to-b mt-28 from-white to-stone-100 shadow-md p-8 text-center">
                <h1 className="text-4xl md:text-5xl font-bold text-stone-900" style={{ fontFamily: 'Titillium Web' }}>
                    INTERVIEW QUESTIONS
                </h1>
                <p className="text-base md:text-lg font-medium text-stone-600 max-w-md mx-auto mt-3" style={{ fontFamily: 'Quicksand Variable' }}>
                    Review this list of 3,790 interview questions and answers verified by hiring managers and candidates.
                </p>
            </header>

            <Separator />

            {/* Main Area: Sidebar + Content */}
            <main className="relative flex min-h-screen w-full bg-stone-50">

                {/* Sidebar */}
                <aside className="sticky top-36 left-0 h-[calc(100vh-144px)] w-64 bg-white border-r border-stone-200 shadow-sm p-6 flex flex-col gap-6 rounded-tr-2xl">
                    <h2 className="text-xl font-semibold text-stone-800" style={{ fontFamily: 'Titillium Web' }}>
                        Menu
                    </h2>
                    <Input
                        type="text"
                        placeholder="Search interviews..."
                        className="mt-2 focus-visible:ring-2 focus-visible:ring-stone-400"
                        style={{ fontFamily: 'Quicksand Variable' }}
                    />
                    <Button variant="default" className="mt-4 rounded-xl shadow-md hover:shadow-lg transition">
                        Add Interview
                    </Button>
                </aside>

                <Separator orientation="vertical" className="bg-stone-200" />

                {/* Main Content */}
                <section className="flex-1 p-8 w-[calc(100vw-256px)]">
                    {/* Card */}
                    <div className="bg-white p-6 rounded-2xl shadow-md mb-8 flex flex-col gap-4">
                        {/* Username */}
                        <div className="text-sm text-stone-500" style={{ fontFamily: 'Quicksand Variable' }}>
                            Posted by <span className="font-semibold text-stone-700">John Doe</span>
                        </div>

                        {/* Question Title */}
                        <h2 className="text-2xl font-bold text-stone-900" style={{ fontFamily: 'Titillium Web' }}>
                            What is a closure in JavaScript?
                        </h2>

                        {/* Answer Preview / Full */}
                        <p className="text-stone-700 leading-relaxed" style={{ fontFamily: 'Quicksand Variable' }}>
                            {isExpanded ? fullAnswer : previewAnswer}
                        </p>

                        {/* Buttons */}
                        <div className="flex items-center justify-between mt-4">
                            <Button
                                variant="outline"
                                size="sm"
                                className="rounded-full px-4 py-2 text-sm"
                                onClick={handleToggle}
                            >
                                {isExpanded ? 'Show Less' : 'Read More'}
                            </Button>
                            <button className="flex items-center gap-1 text-stone-500 hover:text-red-500 transition">
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 fill-current" viewBox="0 0 24 24">
                                    <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 
                                    4.42 3 7.5 3c1.74 0 3.41 0.81 4.5 
                                    2.09C13.09 3.81 14.76 3 16.5 
                                    3 19.58 3 22 5.42 22 8.5c0 
                                    3.78-3.4 6.86-8.55 11.54L12 21.35z"/>
                                </svg>
                                <span className="text-sm">Like</span>
                            </button>
                        </div>
                    </div>
                </section>
            </main>
        </>
    );
}

export default CommunityPage;
