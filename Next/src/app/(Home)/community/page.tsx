import React from 'react';
import '@fontsource/titillium-web';
import '@fontsource-variable/quicksand';
import { Separator } from '@/components/ui/separator';
import CommunityPosts from '@/components/CommunityPosts';

function CommunityPage() {

    return (
        <>
            {/* Navbar */}
            <header className="w-full bg-gradient-to-b mt-20 from-white to-stone-100 shadow-md p-8 text-center">
                <h1 className="text-4xl md:text-4xl font-bold text-stone-900" style={{ fontFamily: 'Titillium Web' }}>
                    INTERVIEW QUESTIONS
                </h1>
                <p className="text-base md:text-md font-medium text-stone-600 max-w-md mx-auto mt-3" style={{ fontFamily: 'Quicksand Variable' }}>
                    Review this list of 3,790 interview questions and answers verified by hiring managers and candidates.
                </p>
            </header>

            <Separator />

            {/* Main Area: Sidebar + Content */}
            <CommunityPosts />
        </>
    );
}

export default CommunityPage;
