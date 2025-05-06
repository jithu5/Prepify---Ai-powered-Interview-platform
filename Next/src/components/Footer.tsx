import React from 'react'
import Link from 'next/link'

const Footer = () => {
    return (
        <footer className="bg-stone-950 text-white min-h-[50vh] flex flex-col justify-center items-center px-6 py-24 text-center">
            <div className="space-y-6 max-w-4xl">
                {/* Main Call */}
                <h2 className="text-3xl md:text-5xl font-bold">
                    Join thousands levelling up with AI.
                </h2>
                <p className="text-lg md:text-2xl text-gray-300 max-w-2xl mx-auto">
                    Whether you&apros;re preparing for your first tech job or your next big role — we&apros;ve got your back.
                </p>

                {/* Navigation Links */}
                <div className="flex justify-center flex-wrap gap-6 mt-4 text-base md:text-lg text-gray-400">
                    <Link href="/" className="hover:text-white transition">About</Link>
                    <Link href="/" className="hover:text-white transition">Contact</Link>
                    <Link href="/" className="hover:text-white transition">Privacy</Link>
                    <Link href="/" className="hover:text-white transition">Terms</Link>
                </div>

                {/* Divider */}
                <div className="h-px bg-gray-700 my-6 w-full" />

                {/* Bottom Info */}
                <div className="text-sm md:text-base text-gray-400">
                    <p>&copy; {new Date().getFullYear()} AI Interview Platform. Built with ❤️ by <span className="text-white font-semibold">Abijith</span>.</p>
                    <p className="mt-1 text-gray-500 text-xs">Powered by Next.js, PostgreSQL, TypeScript & Gemini</p>
                </div>
            </div>
        </footer>
    )
}

export default Footer
