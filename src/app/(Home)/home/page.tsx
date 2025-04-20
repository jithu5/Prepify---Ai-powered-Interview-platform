"use client"
import { Button } from '@/components/ui/button'
import { useRouter } from 'next/navigation'
import React from 'react'

function HomePage() {
  const router  = useRouter()
  return (
    <div className='w-full min-h-screen bg-white text-black mt-24'>
      <section className="text-center py-20 px-6 md:px-20 bg-gradient-to-b from-white to-slate-100">
        <h1 className="text-5xl md:text-6xl font-bold text-gray-900 mb-6">
          Ace Your Next Interview with AI
        </h1>
        <p className="text-lg md:text-xl text-gray-600 max-w-2xl mx-auto mb-8">
          Practice real interview questions, get instant AI feedback, and grow your confidence — all in one place.
        </p>
        <Button variant="default" className="text-lg px-8 py-4" onClick={()=>router.push('interview')
        }>
          Get Started
        </Button>
      </section>

      <section className="py-20 bg-white text-gray-800">
        <div className="text-center mb-12">
          <h2 className="text-4xl font-semibold">Why Choose Our AI-Powered Platform?</h2>
          <p className="text-lg text-gray-500 mt-4">Tailored for developers, job seekers, and tech enthusiasts.</p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-10 max-w-6xl mx-auto px-6">
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

    </div>
  )
}

export default HomePage

