import { writeFile, mkdir } from "fs/promises";
import { NextRequest, NextResponse } from "next/server";
import OpenAI from "openai";
import path from "path";
import fs from 'fs'
console.log(process.env.OPENAI_API_KEY)
const openai = new OpenAI({
    baseURL: "https://api.openai.com/v1", apiKey: process.env.OPENAI_API_KEY,timeout:60000
});
export async function POST(req: NextRequest) {
    let filePath;
    try {
        const formData = await req.formData();
        const audioFile = formData.get("audio") as File;

        if (!audioFile) {
            return NextResponse.json({ message: "No audio file provided", success: false }, { status: 400 });
        }

        const arrayBuffer = await audioFile.arrayBuffer();
        const buffer = Buffer.from(arrayBuffer);
        const fileName = audioFile.name.replaceAll(" ", "_");
        filePath = path.join(process.cwd(), "public/assets", fileName);

        // ✅ Create folder if it doesn't exist
        if (fs.existsSync(filePath)) {
            await mkdir(filePath, { recursive: true });
        }

        await writeFile(filePath, buffer);

        console.log("Sending file:", filePath);
        console.log("File exists:", fs.existsSync(filePath));

        const transcription = await openai.audio.transcriptions.create({
            file: fs.createReadStream(filePath),
            model: "whisper-1",
        });

        console.log(transcription.text);

        return NextResponse.json({ text: transcription.text }, { status: 200 });
    } catch (err) {
        console.error("Transcription failed:", err);
        return NextResponse.json({ message: "Internal Server Error", success: false }, { status: 500 });
    }
    finally {
        if (filePath) {

            if (fs.existsSync(filePath)) {
                fs.unlinkSync(filePath)
            }
        }
    }
}
