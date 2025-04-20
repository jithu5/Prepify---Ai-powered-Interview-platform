import { NextRequest,NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient()

export async function GET(req:NextRequest) {
    const {searchParams} = new URL(req.url)

    const username = searchParams.get('username')

    if (!username) {
        return NextResponse.json({
            message:"Search param username is required",
            success:false
        },{
            status:400
        })
    }

    try {
        await prisma.$connect()

        const isUsernameExist = await prisma.user.findFirst({
            where:{
                username:username
            }
        })

        if (!isUsernameExist) {
            return NextResponse.json({
                success:true,
                message:"username is available",
                isAvailable:true
            },{
                status:200
            })
        }
        return NextResponse.json({
            success: true,
            message: "username is not available",
            isAvailable: false
        }, {
            status: 200
        })
    } catch (error) {
        console.log(error)
        return NextResponse.json({
            success: false,
            message: "Error checking username",
            isAvailable: false
        }, {
            status: 500
        })
    }
    finally{
        await prisma.$disconnect()
    }

}