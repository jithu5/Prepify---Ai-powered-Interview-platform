"use client"

import { useForm } from "react-hook-form"
import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { useDebounceCallback } from "usehooks-ts"

type RegisterForm = {
    username: string
    firstname: string
    lastname: string
    phonenumber: string
    email: string
    password: string
}

export default function RegisterPage() {
    const { register, handleSubmit, watch, formState: { isSubmitting } } = useForm<RegisterForm>()
    const [username, setUsername] = useState<string>("")
    const [usernameAvailable, setUsernameAvailable] = useState<null | boolean>(null)
    const [error, setError] = useState<string>("")
    const [success, setSuccess] = useState<string>("")
    const router = useRouter()

    const debounced = useDebounceCallback(setUsername, 500)

    // Watch username input
    const watchedUsername = watch("username")

    useEffect(() => {
        if (!username) return

        const checkUsername = async () => {
            try {
                const res = await fetch(`/api/auth/check-username?username=${username}`)
                const result = await res.json()
                console.log(result)
                setUsernameAvailable(result.isAvailable)
            } catch (err) {
                console.error("Username check failed", err)
                setUsernameAvailable(null)
            }
        }

        checkUsername()
    }, [username])

    const onSubmit = async (data: RegisterForm) => {
        const res = await fetch("/api/auth/register", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(data),
        })

        const result = await res.json()

        if (!res.ok) {
            setError(result.message || "Registration failed")
        } else {
            setSuccess("Registration successful. Redirecting to login...")
            setTimeout(() => router.push("/login"), 2000)
        }
    }

    return (
        <form onSubmit={handleSubmit(onSubmit)} className="p-4 max-w-md mx-auto">
            <h2 className="text-xl font-bold mb-4">Register</h2>

            <input
                {...register("username")}
                placeholder="Username"
                className="mb-1 p-2 w-full border"
                onChange={(e) => {
                    debounced(e.target.value)
                }}
            />
            {watchedUsername && (
                <p className={`text-sm mb-2 ${usernameAvailable ? "text-green-600" : "text-red-600"}`}>
                    {usernameAvailable === null
                        ? "Checking availability..."
                        : usernameAvailable
                            ? "✅ Username is available"
                            : "❌ Username is taken"}
                </p>
            )}

            <input {...register("firstname")} placeholder="First Name" className="mb-2 p-2 w-full border" />
            <input {...register("lastname")} placeholder="Last Name" className="mb-2 p-2 w-full border" />
            <input {...register("phonenumber")} placeholder="Phone Number" className="mb-2 p-2 w-full border" />
            <input {...register("email")} type="email" placeholder="Email" className="mb-2 p-2 w-full border" />
            <input {...register("password")} type="password" placeholder="Password" className="mb-2 p-2 w-full border" />

            {error && <p className="text-red-500 mb-2">{error}</p>}
            {success && <p className="text-green-500 mb-2">{success}</p>}

            <button
                type="submit"
                disabled={isSubmitting || usernameAvailable === false}
                className="bg-green-500 text-white p-2 w-full"
            >
                Register
            </button>
        </form>
    )
}
