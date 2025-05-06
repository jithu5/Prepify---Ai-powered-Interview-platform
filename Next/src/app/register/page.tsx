"use client";

import { useForm } from "react-hook-form";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useDebounceCallback } from "usehooks-ts";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { toast } from "sonner";
import axios from "axios";
import OtpVerification from "@/components/OtpVerificatin";

type RegisterForm = {
    username: string;
    firstname: string;
    lastname: string;
    phonenumber: string;
    email: string;
    password: string;
};

export default function RegisterPage() {
    const { register, handleSubmit, watch, formState: { isSubmitting, isSubmitSuccessful } } = useForm<RegisterForm>();
    const [username, setUsername] = useState<string>("");
    const [usernameAvailable, setUsernameAvailable] = useState<null | boolean>(null);
    const [error, setError] = useState<string>("");
    const [success, setSuccess] = useState<string>("");
    const [showOtpModal, setShowOtpModal] = useState(false);
    const [userEmail, setUserEmail] = useState("");

    const debounced = useDebounceCallback(setUsername, 500);
    const watchedUsername = watch("username");

    useEffect(() => {
        if (!username) return;

        const checkUsername = async () => {
            try {
                const res = await fetch(`/api/auth/check-username?username=${username}`);
                const result = await res.json();
                setUsernameAvailable(result.isAvailable);
            } catch (err) {
                console.error("Username check failed", err);
                setUsernameAvailable(null);
            }
        };

        checkUsername();
    }, [username]);

    const onSubmit = async (formData: RegisterForm) => {
        try {

            const { data } = await axios.post('/api/auth/register', formData, {
                headers: { "Content-Type": "application/json" },
                withCredentials: true
            })

            if (data.success) {
                setSuccess(data.message);
                toast.success(data.message);
                console.log(isSubmitSuccessful)
                setShowOtpModal(true)
                setUserEmail(data.data.email)
            } else {
                setError(data.message);
                toast.error(data.message);
            }
        } catch (error: any) {
            const errMsg = error?.response?.data?.message || "An error occurred. Please try again.";
            setError(errMsg)
            toast.error(errMsg)
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-100 to-slate-200 px-4">
            <form onSubmit={handleSubmit(onSubmit)} className="bg-white rounded-2xl shadow-xl p-8 w-full max-w-md space-y-4">
                <h2 className="text-3xl font-bold text-center text-blue-600">Create Account</h2>

                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Username</label>
                    <input
                        {...register("username")}
                        placeholder="johndoe123"
                        onChange={(e) => debounced(e.target.value)}
                        className="w-full px-4 py-2 border rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-green-400"
                    />
                    {watchedUsername && (
                        <p className={`text-sm mt-1 ${usernameAvailable ? "text-green-600" : "text-red-600"}`}>
                            {usernameAvailable === null
                                ? "Checking availability..."
                                : usernameAvailable
                                    ? "✅ Username is available"
                                    : "❌ Username is taken"}
                        </p>
                    )}
                </div>

                <div className="grid grid-cols-2 gap-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">First Name</label>
                        <input
                            {...register("firstname")}
                            placeholder="John"
                            className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-green-400"
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Last Name</label>
                        <input
                            {...register("lastname")}
                            placeholder="Doe"
                            className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-green-400"
                        />
                    </div>
                </div>

                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Phone Number</label>
                    <input
                        {...register("phonenumber")}
                        placeholder="+91 98765 43210"
                        className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-green-400"
                    />
                </div>

                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Email Address</label>
                    <input
                        {...register("email")}
                        type="email"
                        placeholder="you@example.com"
                        className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-green-400"
                    />
                </div>

                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Password</label>
                    <input
                        {...register("password")}
                        type="password"
                        placeholder="••••••••"
                        className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-green-400"
                    />
                </div>

                {error && <p className="text-red-500 text-sm">{error}</p>}
                {success && <p className="text-green-500 text-sm">{success}</p>}

                <Button
                    type="submit"
                    disabled={isSubmitting || usernameAvailable === false}
                    variant="default" className="text-lg px-8 py-4 cursor-pointer"
                >
                    {isSubmitting ? "Registering..." : "Register"}
                </Button>
                <p className="text-sm text-center text-gray-500">
                    Already have an account?{" "}
                    <Link href="/login" className="text-blue-600 hover:underline">
                        Login
                    </Link>
                </p>
            </form>

            {
                isSubmitSuccessful && <OtpVerification open={showOtpModal} onClose={() => setShowOtpModal(false)} email={userEmail} type="verify" />

            }
        </div>
    );
}
