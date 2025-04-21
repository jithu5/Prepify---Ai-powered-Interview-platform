"use client"
import { useSession } from "next-auth/react"
import { Button } from "./ui/button"
import { Avatar, AvatarFallback, AvatarImage } from "./ui/avatar"
import Link from "next/link"
import { signOut } from "next-auth/react"
import { useRouter } from "next/navigation"
import { LogOut } from "lucide-react"
import '@fontsource/titillium-web';

function NavBar() {
    const { data: session } = useSession()
    const router = useRouter()

    return (
        <nav className="w-full bg-white px-10 py-6 flex items-center justify-between fixed left-0 top-0 z-50 shadow-md">
            <Link href={'/'} className="cursor-pointer">
                <h1 className="text-xl md:text-3xl font-light text-black cursor-pointer" style={{
                    fontFamily: 'Titillium Web'
                }}>PREPIFY</h1>
            </Link>
            <div className="flex items-center gap-10">
                {
                    session?.user ? (
                        <>
                            <Avatar className="cursor-pointer">
                                <AvatarImage src="https://github.com/shadcn.png" alt="@shadcn" />
                                <AvatarFallback>{session.user?.email?.[0]?.toUpperCase()}</AvatarFallback>
                            </Avatar>
                            <Button variant="default" className="text-lg px-8 py-4 cursor-pointer" onClick={() => signOut()}><LogOut size={2}/></Button>
                        </>
                    ) : (
                        <>
                                <Button variant="default" className="text-lg px-8 py-4 cursor-pointer" onClick={()=>router.replace("/login")}>Login</Button>

                        </>
                    )
                }
            </div>
        </nav>
    )
}

export default NavBar
