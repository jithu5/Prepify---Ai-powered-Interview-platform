"use client"
import axios from 'axios'
import React, { useEffect, useState } from 'react'
import { toast } from 'sonner'

interface Interview {
  end_time:Date
  id:string
  level:string
  max_count:number,
  position_type:string
  start_time:Date
  type:string
  user_id:string
  score:number
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
        console.log(data)
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
      }
      finally {
        setIsLoading(false)
      }
    }
    fetchInterviews()
  }, [])

  return (
    <>
      <main className='min-h-screen w-full mt-24 px-24 py-10'>
        <h1>history</h1>
      </main>
    </>
  )
}

export default InterviewHistoryPage
