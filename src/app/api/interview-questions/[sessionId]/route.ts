import { NextResponse, NextRequest } from "next/server";
import { getServerSession, User } from "next-auth";
import { authOptions } from "@/lib/auth";
import { PrismaClient } from "@prisma/client";
import OpenAI from "openai";

console.log(process.env.DEEPSEEEK_API_KEY)

const openai = new OpenAI({
    baseURL: 'https://api.deepseek.com',
    apiKey: process.env.DEEPSEEEK_API_KEY!
})

const prisma = new PrismaClient();

export async function GET(request: NextRequest, { params }: { params: { sessionId: string } }) {
    try {
        const session = await getServerSession(authOptions);

        if (!session) {
            return NextResponse.json({ message: "Unauthorized", success: false }, { status: 401 });
        }

        const userToken: User = session.user;

        if (!userToken) {
            return NextResponse.json({ message: "Unauthorized", success: false }, { status: 401 });
        }

        const user = await prisma.user.findUnique({
            where: { id: userToken.id },
        })

        if (!user) {
            return NextResponse.json({ message: "Unauthorized", success: false }, { status: 401 });
        }

        const id = params.sessionId;

        console.log('session id', id)

        const interviewSession = await prisma.interview_session.findUnique({
            where: { id: id }
        })

        if (!interviewSession) {
            return NextResponse.json({ message: "Interview session not found", success: false }, { status: 404 });
        }

        const existingQuestions = await prisma.question.findMany({
            where: { interview_session_id: interviewSession.id },
            orderBy: { created_at: 'desc' }, // Sorting to get the latest question asked
            take: 1, // Fetch only the last question asked
        });

        let completion;

        let introduction = `You are an interviewer interviewing ${user.firstname} for ${interviewSession.level} ${interviewSession.position_type} and this interview is ${interviewSession.type}`

        if (existingQuestions.length > 0) {
            const lastQuestion = existingQuestions[0].question;
            completion = await openai.chat.completions.create({
                messages: [{ role: "system", content: introduction },
                { role: "assistant", content: `The last question asked was: "${lastQuestion}". Please continue the interview by asking the next relevant question and the feedback has also been provide so no need for that.` },
                { role: "user", content: "Start the interview with self intro" }
                ],
                model: "deepseek-chat",
            });
        }
        if (existingQuestions.length === 0) {

            completion = await openai.chat.completions.create({
                messages: [{ role: "system", content: introduction },
                { role: "user", content: "Start the interview with self intro" }
                ],
                model: "deepseek-chat",
            });
        }

        if (!completion) {
            return NextResponse.json({ message: "Error generating AI Question", success: false }, { status: 400 });

        }

        console.log(completion.choices[0].message.content);

        const question = completion.choices[0].message.content;

        const createQuestion = await prisma.question.create({
            data: {
                question: question,
                interview_session_id: interviewSession.id,
                user_id: user.id,
            }
        })

        if (!createQuestion) {
            return NextResponse.json({ message: "Error creating question", success: false }, { status: 400 });
        }
        return NextResponse.json({ message: "Question created successfully", success: true, question: createQuestion }, { status: 200 });

    } catch (error) {
        console.error("Error in start interview route:", error);
        return NextResponse.json({ message: "Internal Server Error", success: false }, { status: 500 });
    }
}


export async function POST(request: NextRequest, { params }: { params: { sessionId: string } }) {
    try {
        const session = await getServerSession(authOptions);

        if (!session) {
            return NextResponse.json({ message: "Unauthorized", success: false }, { status: 401 });
        }

        const userToken: User = session.user;

        if (!userToken) {
            return NextResponse.json({ message: "Unauthorized", success: false }, { status: 401 });
        }

        const user = await prisma.user.findUnique({
            where: { id: userToken.id },
        })

        if (!user) {
            return NextResponse.json({ message: "Unauthorized", success: false }, { status: 401 });
        }

        const id = params.sessionId;

        console.log('session id', id)

        const interviewSession = await prisma.interview_session.findUnique({
            where: { id: id }
        })

        if (!interviewSession) {
            return NextResponse.json({ message: "Interview session not found", success: false }, { status: 404 });
        }

        const body = await request.json();

        const { answer, questionId } = body;

        if (!answer || !questionId) {
            return NextResponse.json({ message: "Answer is required", success: false }, { status: 400 });
        }

        const question = await prisma.question.findUnique({
            where: { id: questionId }
        })

        const completion = await openai.chat.completions.create({
            messages: [
                {
                    role: "system",
                    content: `You are an interviewer interviewing ${user.firstname} for ${interviewSession.level} ${interviewSession.position_type} and this interview is ${interviewSession.type}`
                },
                {
                    role: "system",
                    content: `The question you asked was: "${question?.question}". Provide feedback and score the answer on a scale of 1 to 10 as an object.`
                },
                {
                    role: "user",
                    content: `${answer}`
                }
            ],
            model: "deepseek-chat",
        });
        // Extracting the AI's response from the completion
        const aiResponse = completion.choices[0].message.content;

        if (!aiResponse) {
            return NextResponse.json({ message: "Error generating AI response", success: false }, { status: 400 });
        }

        // Parse the AI response assuming it's in JSON format
        let feedback;
        let score;
        try {
            const parsedResponse = JSON.parse(aiResponse); // Assuming AI response is in JSON format
            feedback = parsedResponse?.feedback;
            score = parsedResponse?.score;
        } catch (error) {
            return NextResponse.json({ message: "Error parsing AI response", success: false }, { status: 400 });
        }

        console.log("AI Feedback:", feedback);
        console.log("AI Score:", score);

        if (!feedback || !score) {
            return NextResponse.json({ message: "Error parsing AI response", success: false }, { status: 400 });

        }

        const updateQuestion = await prisma.question.update({
            where: { id: questionId },
            data: {
                answer: answer,
                response: feedback,
            }

        })
        if (!updateQuestion) {
            return NextResponse.json({ message: "Error updating question", success: false }, { status: 400 });
        }
        return NextResponse.json({ message: "Question updated successfully", success: true, data: aiResponse }, { status: 200 });

    } catch (error) {
        console.error("Error in start interview route:", error);
        return NextResponse.json({ message: "Internal Server Error", success: false }, { status: 500 });
    }
}