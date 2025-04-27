'use client'

import { Button } from '@/components/ui/button'
import { useRouter } from 'next/navigation'
import React from 'react'
import '@fontsource/titillium-web';
// Supports weights 300-700
import '@fontsource-variable/quicksand';

function HomePage() {
  const router = useRouter()

  return (
    <>
      <div className="w-full min-h-screen bg-white text-black mt-24">
        {/* Hero Section */}
        <section className="text-center py-20 px-6 md:px-20 bg-gradient-to-b from-white to-slate-100">
          <h1 className="text-5xl md:text-6xl lg:text-8xl font-bold text-gray-900 mb-6" style={{
            fontFamily: 'Titillium Web'
          }}>
            Ace Your Next Interview with AI
          </h1>
          <p className="text-lg md:text-xl text-gray-600 max-w-2xl mx-auto mb-8" style={{
            fontFamily: 'Quicksand Variable'
          }}>
            Practice real interview questions, get instant AI feedback, and grow your confidence — all in one place.
          </p>
          <Button variant="default" className="text-lg px-8 py-4 cursor-pointer" onClick={() => router.push('interview')}>
            Get Started
          </Button>
        </section>

        {/* Why Choose Us Section */}
        <section className="py-20 bg-white text-gray-800">
          <div className="text-center mb-12">
            <h2 className="text-4xl font-semibold" style={{
              fontFamily: 'Titillium Web'
            }}>Why Choose Our AI-Powered Platform?</h2>
            <p className="text-lg text-gray-500 mt-4">Tailored for developers, job seekers, and tech enthusiasts.</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-10 max-w-6xl mx-auto px-6" style={{
            fontFamily: 'Quicksand Variable'
          }}>
            <div className="p-6 border rounded-2xl shadow-sm hover:shadow-md transition">
              <h3 className="text-xl font-semibold mb-2">AI-Driven Questions</h3>
              <p className="text-gray-600">Get custom questions based on your experience level, tech stack, and goals.</p>
            </div>
            <div className="p-6 border rounded-2xl shadow-sm hover:shadow-md transition">
              <h3 className="text-xl font-semibold mb-2">Real-Time Feedback</h3>
              <p className="text-gray-600">Answer questions and receive smart feedback instantly to improve on the spot.</p>
            </div>
            <div className="p-6 border rounded-2xl shadow-sm hover:shadow-md transition">
              <h3 className="text-xl font-semibold mb-2">Track Your Progress</h3>
              <p className="text-gray-600">See what you've improved, revisit past questions, and get better with each session.</p>
            </div>
          </div>
        </section>

        {/* How It Works */}
        <section className="py-20 bg-slate-50">
          <div className="text-center mb-12">
            <h2 className="text-4xl font-semibold" style={{
              fontFamily: 'Titillium Web'
            }}>How It Works</h2>
          </div>
          <div className="max-w-5xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-8 px-6" style={{
            fontFamily: 'Quicksand Variable'
          }}>
            <div className="text-center">
              <h4 className="text-xl font-semibold mb-2">1. Start a Session</h4>
              <p className="text-gray-600">Pick your role, experience level, and tech stack.</p>
            </div>
            <div className="text-center">
              <h4 className="text-xl font-semibold mb-2">2. Answer Questions</h4>
              <p className="text-gray-600">AI generates questions, you answer them like a real interview.</p>
            </div>
            <div className="text-center">
              <h4 className="text-xl font-semibold mb-2">3. Get Feedback</h4>
              <p className="text-gray-600">Instant analysis with score and tips for improvement.</p>
            </div>
          </div>
        </section>

        {/* Technologies Covered */}
        <section className="py-20 bg-white">
          <div className="text-center mb-12">
            <h2 className="text-4xl font-semibold" style={{
              fontFamily: 'Titillium Web'
            }}>Technologies Covered</h2>
            <p className="text-gray-600 mt-4" style={{
              fontFamily: 'Quicksand Variable'
            }}>Select from a wide range of modern stacks.</p>
          </div>
          <div className="flex flex-wrap justify-center gap-6 px-6 text-lg font-medium text-gray-700" style={{
            fontFamily: 'Titillium Web'
          }}>
            <span className="bg-gray-100 px-4 py-2 rounded-xl">React</span>
            <span className="bg-gray-100 px-4 py-2 rounded-xl">Node.js</span>
            <span className="bg-gray-100 px-4 py-2 rounded-xl">TypeScript</span>
            <span className="bg-gray-100 px-4 py-2 rounded-xl">Next.js</span>
            <span className="bg-gray-100 px-4 py-2 rounded-xl">MongoDB</span>
            <span className="bg-gray-100 px-4 py-2 rounded-xl">PostgreSQL</span>
            <span className="bg-gray-100 px-4 py-2 rounded-xl">Express</span>
          </div>
        </section>

        {/* Testimonials */}
        <section className="py-20 bg-slate-50">
          <div className="text-center mb-12">
            <h2 className="text-4xl font-semibold" style={{
              fontFamily: 'Titillium Web'
            }}>What Users Say</h2>
          </div>
          <div className="max-w-5xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-8 px-6">
            <div className="bg-white p-6 rounded-2xl shadow-md">
              <p className="text-gray-600 italic">“Helped me land my frontend internship. The feedback was golden.”</p>
              <p className="text-sm font-semibold mt-4 text-right text-gray-700">— Priya, India</p>
            </div>
            <div className="bg-white p-6 rounded-2xl shadow-md">
              <p className="text-gray-600 italic">“Feels like a real interview. Great for building confidence.”</p>
              <p className="text-sm font-semibold mt-4 text-right text-gray-700">— James, US</p>
            </div>
            <div className="bg-white p-6 rounded-2xl shadow-md">
              <p className="text-gray-600 italic">“Love the progress tracking and AI feedback. Super polished!”</p>
              <p className="text-sm font-semibold mt-4 text-right text-gray-700">— Aisha, UK</p>
            </div>
          </div>
        </section>

        {/* Final CTA */}
        <section className="py-20 text-center bg-gradient-to-t from-white to-slate-100">
          <h2 className="text-4xl font-bold mb-4" style={{
            fontFamily: 'Titillium Web'
          }}>Ready to Get Started?</h2>
          <p className="text-lg text-gray-600 mb-8" style={{
            fontFamily: 'Quicksand Variable'
          }}>Start your first AI interview now and improve with every question.</p>
          <Button variant="default" className="text-lg px-8 py-4" onClick={() => router.push('interview')}>
            Start Interview
          </Button>
        </section>
      </div>
    </>
  )
}

export default HomePage
