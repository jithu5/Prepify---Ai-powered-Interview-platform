"use client";

import React from "react";
import { useForm } from "react-hook-form";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";

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
        console.log(res)

        if (res?.error) {
            alert("Login failed: " + res.error);
        } else {
            reset();
            router.push("/"); // or any protected page
        }
    };

    return (
        <div className="max-w-md mx-auto mt-10">
            <h2 className="text-2xl font-bold mb-4">Login</h2>
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                <div>
                    <label>Email</label>
                    <input
                        type="email"
                        {...register("email", { required: true })}
                        className="w-full border px-3 py-2 rounded"
                    />
                </div>
                <div>
                    <label>Password</label>
                    <input
                        type="password"
                        {...register("password", { required: true })}
                        className="w-full border px-3 py-2 rounded"
                    />
                </div>
                <button
                    type="submit"
                    disabled={isSubmitting}
                    className="w-full bg-blue-600 text-white py-2 rounded"
                >
                    {isSubmitting ? "Logging in..." : "Login"}
                </button>
            </form>
        </div>
    );
}
