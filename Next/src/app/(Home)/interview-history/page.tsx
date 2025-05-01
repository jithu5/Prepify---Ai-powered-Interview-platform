'use client'

import axios from 'axios'
import React, { useEffect, useState } from 'react'
import { toast } from 'sonner'
import { format } from 'date-fns'
import ScoreChart from '@/components/ScoreChart'

interface Interview {
  end_time: Date
  id: string
  level: string
  max_count: number
  position_type: string
  start_time: Date
  type: string
  user_id: string
  score: number
}

function InterviewHistoryPage() {
  const [interviews, setInterviews] = useState<Interview[]>([])
  const [isLoading, setIsLoading] = useState<boolean>(false)
  const [isError, setIsError] = useState<boolean>(false)
  const [errorMessage, setErrorMessage] = useState<string>('')

  useEffect(() => {
    const fetchInterviews = async () => {
      try {
        setIsLoading(true)
        const { data } = await axios.get('/api/interview-sessions', {
          headers: { 'Content-Type': 'application/json' },
          withCredentials: true
        })
        if (data.success) {
          setInterviews(data.data)
          toast.success(data.message)
        } else {
          setIsError(true)
          setErrorMessage(data.message)
          toast.error(data.message)
        }
      } catch (error: any) {
        const errMessage = error?.response?.data?.message || "Error fetching interview data"
        setIsError(true)
        setErrorMessage(errMessage)
        toast.error(errMessage)
      } finally {
        setIsLoading(false)
      }
    }
    fetchInterviews()
  }, [])
  return (
    <main className="min-h-screen w-full px-4 md:px-24 py-10 mt-20">
      <h1 className="text-3xl font-bold mb-8 text-gray-800">Interview History</h1>

      {isLoading && <p className="text-gray-500">Loading interviews...</p>}
      {isError && <p className="text-red-500">{errorMessage}</p>}

      <div className="flex flex-col gap-6">
        {interviews && interviews.length>0 && interviews.map((interview) => (
          <div
            key={interview.id}
            className="bg-white rounded-2xl p-6 border border-gray-200 shadow-sm hover:shadow-md transition-all"
          >
            <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center mb-3">
              <div>
                <h2 className="text-xl font-semibold text-indigo-600 capitalize">
                  {interview.position_type}
                </h2>
                <p className="text-gray-600 text-sm">Level: <span className="capitalize">{interview.level}</span></p>
                <p className="text-gray-600 text-sm">Type: {interview.type}</p>
              </div>
              <div className="mt-4 sm:mt-0 text-sm text-gray-500 flex items-center justify-center flex-col">
                <ScoreChart score={Number(Number(interview?.score ?? 0).toFixed(1))} />
                <h1 className='text-center text-xl font-semibold'>
                  {Number(interview?.score ?? 0).toFixed(1)}%
                </h1>
              </div>
            </div>
            <div className="text-sm text-gray-500">
              <p><strong>Start Time:</strong> {format(new Date(interview.start_time), 'PPpp')}</p>
              <p><strong>End Time:</strong> {format(new Date(interview.end_time), 'PPpp')}</p>
            </div>
          </div>
        ))}
      </div>

      {!isLoading && !isError && interviews.length === 0 && (
        <p className="text-gray-500 text-center mt-10">No interview history found.</p>
      )}
    </main>
  )
}

export default InterviewHistoryPage
