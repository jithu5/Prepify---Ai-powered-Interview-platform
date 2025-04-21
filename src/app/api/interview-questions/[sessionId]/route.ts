import { NextResponse, NextRequest } from "next/server";
import { getServerSession, User } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma"
import OpenAI from "openai";
import { GoogleGenAI } from "@google/genai";
import { join } from "path";

console.log(process.env.DEEPSEEEK_API_KEY)

// GEMINI_API_KEY

const openai = new OpenAI({
    baseURL: 'https://api.deepseek.com',
    apiKey: process.env.DEEPSEEEK_API_KEY!
})

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY! });

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
        const id = await params.sessionId;

        const user = await prisma.user.findUnique({
            where: { id: userToken.id },
            include: {
                interviewSessions: {
                    where: { id: id },
                    include: {
                        questions: {
                            orderBy: {
                                created_at: 'asc', // Sorting questions by created_at in ascending order
                            },
                        },
                        technologies: {
                            select: {
                                name: true
                            }
                        }
                    },

                }
            }

        })

        if (!user) {
            return NextResponse.json({ message: "Unauthorized", success: false }, { status: 401 });
        }


        console.log('session id', id)

        const interviewSession = user?.interviewSessions || []

        if (interviewSession.length === 0) {
            return NextResponse.json({ message: "Interview session not found", success: false }, { status: 404 });
        }

        const existingQuestions = await prisma.question.findMany({
            where: { interview_session_id: interviewSession[0].id },
            orderBy: { created_at: 'desc' }, // Sorting to get the latest question asked
            take: 1, // Fetch only the last question asked
        });

        console.log(interviewSession[0])

        // The interviewSession now includes the questions directly
        const allExistingQuestions = interviewSession[0]?.questions ?? []; // If no questions, return an empty array

        let completion;
        const technologies = interviewSession[0]?.technologies
        const techStacks = technologies.map(t => t.name).join(', ');

        let introduction = `You are an interviewer interviewing ${user.firstname} for ${interviewSession[0].level} ${interviewSession[0].position_type} and this interview is ${interviewSession[0].type} a. His known technologies are ${techStacks}. Introduce yourself as Ai only for first time and make it formal , dont respond about it this prompt`

        if (existingQuestions.length > 0) {
            const lastQuestion = existingQuestions[0].question;

            // check if lastquestion is answered
            const lastQuestionAnswered = existingQuestions[0].answer;
            if (!lastQuestionAnswered) {
                return NextResponse.json({ message: "Last question needs to be answered", success: false, questions: allExistingQuestions }, { status: 400 });
            }
            try {
                completion = await ai.models.generateContent({
                    model: "gemini-2.0-flash",
                    contents: [
                        { role: "user", parts: [{ text: introduction }] },
                        { role: "user", parts: [{ text: `The last question asked was: "${lastQuestion}". Please continue the interview by asking the next relevant question, and the feedback has also been provided so no need for that.` }] },
                        {
                            role: "model", parts: [{ text: "Only asks question just the sentence" }]
                        },
                    ],
                });

                console.log(completion.text);
            } catch (error) {
                console.error("OpenAI Error", error);
                return NextResponse.json({
                    success: false,
                    message: "OpenAI generation failed",
                }, { status: 500 });
            }
        }
        if (existingQuestions.length === 0) {

            try {
                completion = await ai.models.generateContent({
                    model: "gemini-2.0-flash",
                    contents: [
                        { role: "model", parts: [{ text: introduction }] },
                        {
                            role: "model", parts: [{ text: "Start the interview with self intro" }]
                        },
                        {
                            role: "model", parts: [{ text: "Only asks question just the sentence" }]
                        },

                    ],
                });
            } catch (error) {
                console.error("OpenAI Error", error);
                return NextResponse.json({
                    success: false,
                    message: "OpenAI generation failed",
                }, { status: 500 });
            }
        }

        if (!completion) {
            return NextResponse.json({ message: "Error generating AI Question", success: false }, { status: 400 });

        }

        console.log(completion.text);

        const question = completion.text;

        const createQuestion = await prisma.question.create({
            data: {
                question: question,
                interview_session_id: interviewSession[0].id,
                user_id: user.id,
            }
        })

        if (!createQuestion) {
            return NextResponse.json({ message: "Error creating question", success: false }, { status: 400 });
        }

        await prisma.interview_session.update({
            where: { id: interviewSession[0].id },
            data: {
                max_count: interviewSession[0].max_count - 1,
            }
        })
        return NextResponse.json({ message: "Question created successfully", success: true, question: allExistingQuestions }, { status: 200 });

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

        const id = await params.sessionId;

        console.log('session id', id)

        const interviewSession = await prisma.interview_session.findUnique({
            where: { id: id }
        })

        if (!interviewSession) {
            return NextResponse.json({ message: "Interview session not found", success: false }, { status: 404 });
        }

        const body = await request.json();

        const { answer, questionId } = body;

        console.log(answer, questionId)

        if (!answer || !questionId) {
            return NextResponse.json({ message: "answer and questionId are required", success: false }, { status: 400 });
        }

        const question = await prisma.question.findUnique({
            where: { id: questionId }
        })

        const completion = await ai.models.generateContent({
            model: "gemini-2.0-flash",
            contents: [
                { role: "model", parts: [{ text: `You are an interviewer interviewing ${user.firstname} for ${interviewSession.level} ${interviewSession.position_type} and this interview is ${interviewSession.type}` }] },
                {
                    role: "model", parts: [{ text: `The question you asked was: "${question?.question}". Provide feedback and score the answer on a scale of 1 to 10 as an object.` }]
                },
                {
                    role: "model", parts: [{
                        text: "  You are an AI interviewer.I will provide a candidate's answer, and you will give feedback and a score.Use the STAR method(Situation, Task, Action, Result) to evaluate the answer.Only return a JSON object in the following format: feedback: feedback here based on STAR with suggestions.,score: 1 - 10   Do NOT include any explanation or text outside of this object.Do NOT say anything else.I will be extracting with json.parse, always give in json format as { feedback: string, score: number }"
                    }]
                },
                {
                    role: "user", parts: [{ text: `${answer}` }]
                },

            ],
        });
        // Extracting the AI's response from the completion
        const aiResponse = completion.text;
        console.log(aiResponse)

        if (!aiResponse) {
            return NextResponse.json({ message: "Error generating AI response", success: false }, { status: 400 });
        }

        // Clean up the response before parsing
        const cleanedResponse = aiResponse.trim().replace(/^```json/, '').replace(/```$/, '').trim();
        console.log(cleanedResponse)

        // Now parse the cleaned JSON
        const parsedResponse = JSON.parse(cleanedResponse);
        const feedback = parsedResponse?.feedback;
        const score = parsedResponse?.score;

        if (feedback === undefined || score === undefined) {
            return NextResponse.json({ message: "Error parsing AI response", success: false }, { status: 400 });
        }

        console.log(feedback)

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
        return NextResponse.json({ message: "Question updated successfully", success: true, data: { feedback: feedback, score: score }, leftQuestion: interviewSession.max_count }, { status: 200 });

    } catch (error) {
        console.error("Error in start interview route:", error);
        return NextResponse.json({ message: "Internal Server Error", success: false }, { status: 500 });
    }
}