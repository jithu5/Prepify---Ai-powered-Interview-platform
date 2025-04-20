import { NextAuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";
// import GoogleProvider from "next-auth/providers/google";

const prisma = new PrismaClient()

export const authOptions: NextAuthOptions = {
    providers:[
        CredentialsProvider({
            id: "credentials",
            name: "Credentials",
            credentials:{
                email:{
                    label:"Email",type:"text"
                },
                password:{
                    label:"Password",type:"password"
                }
            },
            async authorize(credentials){
                if (!credentials?.email || !credentials.password) {
                    throw new Error("Missing email and password")
                }
                await prisma.$connect()
                try {

                    const user = await prisma.user.findUnique({
                       where:{
                        email:credentials.email
                       },
                       select:{
                        password:true,
                        id:true,
                        email:true
                       }
                    })

                    if (!user) {
                        throw new Error("No user found")
                    }

                    const isValid = await bcrypt.compare(credentials.password,user.password)

                    if (!isValid) {
                        throw new Error("Invalid Password")
                    }

                    return{
                        id:user.id,
                        email:user.email
                    }
                    
                } catch (error:any) {
                    console.error("Auth error:", error.message);
                    throw error
                }
                finally{
                    await prisma.$disconnect()
                }
            }
        })
    ],
    callbacks:{
        async jwt({token,user}) {
            if (user) {
                token.id = user.id
            }
            return token
        },
        async session({session,token}) {
            if (token && session?.user) {
                session.user.id = token.id as string
            }
            return session
        },
    },
    pages:{
        signIn:"/login",
        error:"/login"
    },
    session:{
        strategy:"jwt",
        maxAge:30 * 24 * 60 * 60
    },
    secret:process.env.NEXTAUTH_SECRET
}