import { NextResponse, NextRequest } from "next/server";
import { getServerSession, User } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma"
import { GoogleGenAI } from "@google/genai";

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY! });

type Context = {
    params: {
        sessionId: string
    }
}


export async function GET(request: NextRequest, context:Context) {
    try {
        const session = await getServerSession(authOptions);

        if (!session) {
            return NextResponse.json({ message: "Unauthorized", success: false }, { status: 401 });
        }

        const userToken: User = session.user;

        if (!userToken) {
            return NextResponse.json({ message: "Unauthorized", success: false }, { status: 401 });
        }
        const id = await context.params.sessionId;

        const user = await prisma.user.findUnique({
            where: { id: userToken.id },
            include: {
                interviewSessions: {
                    where: { id: id },
                    include: {
                        questions: {
                            orderBy: {
                                created_at: 'asc', // Sorting questions by created_at in ascending order
                            }, include: {
                                response: true
                            }
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
        if (!user.is_account_verified) {
            return NextResponse.json({ message: "Account not verified", success: false }, { status: 401 });
        }
        const interviewSession = user?.interviewSessions || []

        if (interviewSession.length === 0) {
            return NextResponse.json({ message: "Interview session not found", success: false }, { status: 404 });
        }

        const existingQuestions = await prisma.question.findMany({
            where: { interview_session_id: interviewSession[0].id },
            orderBy: { created_at: 'desc' }, // Sorting to get the latest question asked
            take: 1, // Fetch only the last question asked
        });

        if (interviewSession[0].max_count === 0) {
            try {

                await prisma.interview_session.update({
                    where: { id: id },
                    data: {
                        end_time: new Date(),
                    }
                })
                return NextResponse.json({ message: "You have hit your limit in this session , try for next", success: false }, { status: 400 });
            } catch (error) {
                console.error("Error updating interview session:", error);
                return NextResponse.json({ message: "Error updating interview session", success: false }, { status: 500 });

            }

        }

        let completion;
        const technologies = interviewSession[0]?.technologies
        const techStacks = technologies.map((t: { name: string }) => t.name).join(', ');

        const introduction = `
You are a professional technical interviewer conducting a ${interviewSession[0].type} interview with ${user.firstname} for a ${interviewSession[0].level}-level ${interviewSession[0].position_type} role.

- Your tone should be formal yet engaging.
- Start by introducing yourself politely as an interviewer.
- Then mention the technologies that the candidate knows: ${techStacks}.
- After the short introduction, ask a relevant, well-structured technical question based on the candidate's role and skills.
- Keep your question concise and direct.
- Do NOT include your name or the company's name.
- Do NOT provide explanations or answers.
- Only return the next question in plain text (no JSON or formatting).
`;

        console.log(existingQuestions.length)

        if (existingQuestions.length > 0) {
            const lastQuestion = existingQuestions[0].question;

            // check if lastquestion is answered
            const lastQuestionAnswered = existingQuestions[0].answer;
            if (!lastQuestionAnswered) {
                return NextResponse.json({ message: "Last question needs to be answered", success: false }, { status: 400 });
            }
            try {
                completion = await ai.models.generateContent({
                    model: "gemini-2.0-flash",
                    contents: [
                        { role: "user", parts: [{ text: introduction }] },
                        {
                            role: "user",
                            parts: [{
                                text: `
You have already asked the question: "${lastQuestion}", and the candidate has answered it.

Continue the interview by:
- Asking the next relevant technical question based on the candidate’s level (${interviewSession[0].level}), position (${interviewSession[0].position_type}), and skills (${techStacks}).
- Your tone should be formal but friendly, as if you're conducting a live mock interview.
- Do NOT repeat previous questions.
- Ask only one question at a time.
- Do NOT provide feedback or suggestions.
- Do NOT explain anything.
- Return only the next question in plain text (no formatting or labels).
`
                            }]
                        }


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
        if (existingQuestions.length === 0) {

            try {
                completion = await ai.models.generateContent({
                    model: "gemini-2.0-flash",
                    contents: [
                        { role: "user", parts: [{ text: introduction }] },
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

        const id = await params.sessionId;

        const interviewSession = await prisma.interview_session.findUnique({
            where: { id: id }
        })

        if (!interviewSession) {
            return NextResponse.json({ message: "Interview session not found", success: false }, { status: 404 });
        }

        const body = await request.json();

        const { answer, questionId } = body;

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
                    role: "model", parts: [{ text: `The question you asked was: "${question?.question}". Provide feedback,with plain text in plain text as a real mock interview and score the answer on a scale of 1 to 10 as an object.` }]
                },
                {
                    role: "model", parts: [{
                        text: `
You are an AI interviewer. I will give you a candidate's answer to a technical question.

- Use the STAR method (Situation, Task, Action, Result) to evaluate the answer.
- Give specific, constructive feedback that helps the candidate improve.
- Give a score between 1 and 10.
- Only respond with a JSON object like this:
{ "feedback": "string", "score": number }

⚠️ Do not include anything else outside the JSON object.
⚠️ Do not wrap it in triple backticks or markdown.
⚠️ Do not explain your output.
`
                    }]
                },

                {
                    role: "user", parts: [{ text: `${answer}` }]
                },

            ],
        });
        // Extracting the AI's response from the completion
        const aiResponse = completion.text;

        if (!aiResponse) {
            return NextResponse.json({ message: "Error generating AI response", success: false }, { status: 400 });
        }

        // Clean up the response before parsing
        const cleanedResponse = aiResponse.trim().replace(/^```json/, '').replace(/```$/, '').trim();

        // Now parse the cleaned JSON
        const parsedResponse = JSON.parse(cleanedResponse);
        const feedback = parsedResponse?.feedback;
        const score = parsedResponse?.score;

        if (feedback === undefined || score === undefined) {
            return NextResponse.json({ message: "Error parsing AI response", success: false }, { status: 400 });
        }

        const responseData = await prisma.response.create({
            data: {
                feedback: feedback,
                score: score,
                question_id: questionId,
                interview_session_id: id
            }
        })
        if (!responseData) {
            return NextResponse.json({ message: "Error creating response", success: false }, { status: 400 });
        }

        const updateQuestion = await prisma.question.update({
            where: { id: questionId },
            data: {
                answer: answer,
            },
            include: {
                response: true
            }
        });

        if (!updateQuestion) {
            return NextResponse.json({ message: "Error updating question", success: false }, { status: 400 });
        }
        const result = await prisma.response.aggregate({
            where: { interview_session_id: id },
            _avg: {
                score: true,
            },
        });

        const avgScore = result._avg.score ? result._avg.score * 10 : 0;
        const updateScore = await prisma.interview_session.update({
            where: { id: id },
            data: {
                avg_score: avgScore
            }
        })
        if (!updateScore) {
            return NextResponse.json({ message: "Error updating score", success: false }, { status: 400 });

        }
        return NextResponse.json({ message: "Question updated successfully", success: true, data: { feedback: feedback, score: score }, leftQuestion: interviewSession.max_count }, { status: 200 });

    } catch (error) {
        console.error("Error in start interview route:", error);
        return NextResponse.json({ message: "Internal Server Error", success: false }, { status: 500 });
    }
}
