"use client";

import React from "react";
import { useForm } from "react-hook-form";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";

type FormValues = {
    email: string;
    password: string;
};

export default function LoginPage() {
    const router = useRouter();
    const {
        handleSubmit,
        register,
        reset,
        formState: { isSubmitting },
    } = useForm<FormValues>();

    const onSubmit = async (data: FormValues) => {
        const res = await signIn("credentials", {
            redirect: false,
            email: data.email,
            password: data.password,
        });

        if (res?.error) {
            toast.error("Login failed: " + res.error);
        } else {
            toast.success("🎉 Login successful. Redirecting to home...")
            reset();
            router.push("/");
        }
    };

    return (
        <main className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-100 to-slate-200 px-4">
            <div className="bg-white shadow-xl rounded-2xl p-8 w-full max-w-md">
                <h2 className="text-3xl font-bold text-center text-blue-600 mb-6">Welcome Back 👋</h2>

                <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Email address</label>
                        <input
                            type="email"
                            {...register("email", { required: true })}
                            className="w-full px-4 py-2 border rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-400"
                            placeholder="you@example.com"
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Password</label>
                        <input
                            type="password"
                            {...register("password", { required: true })}
                            className="w-full px-4 py-2 border rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-400"
                            placeholder="••••••••"
                        />
                    </div>

                    <Button
                        type="submit"
                        disabled={isSubmitting}
                        variant="default"
                        className="w-full py-3 text-lg"
                    >
                        {isSubmitting ? "Logging in..." : "Login"}
                    </Button>

                    <p className="text-sm text-center text-gray-500">
                        Don&apos;t have an account?{" "}
                        <Link href="/register" className="text-blue-600 hover:underline">
                            Register
                        </Link>
                    </p>
                    <p className="text-sm text-center text-gray-500">
                        Forgot Password?{" "}
                        <Link href="/forgot-password" className="text-blue-600 hover:underline">
                            Reset
                        </Link>
                    </p>
                </form>
            </div>
        </main>
    );
}
