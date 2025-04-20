"use client"

import NavBar from "@/components/NavBar";

export default function HomeLayout({ children }: { children: React.ReactNode }) {
    return <>
        <NavBar />
        {children}

    </>;
}