from fastapi import FastAPI, UploadFile, File
from fastapi.responses import JSONResponse
from fastapi.middleware.cors import CORSMiddleware
import os
import shutil
import uuid
import wave
import json
from pydub import AudioSegment
from vosk import Model, KaldiRecognizer

app = FastAPI()

UPLOAD_FOLDER = "uploads"
os.makedirs(UPLOAD_FOLDER, exist_ok=True)

# CORS setup - adjust as needed
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Load Vosk model (make sure the path is correct and model is English)
vosk_model = Model("src/model")


def transcribe_audio(file_path: str) -> dict:
    print(f"Transcribing {file_path}")

    # Convert audio to 16kHz mono WAV for Vosk
    audio = AudioSegment.from_file(file_path)
    audio = audio.set_channels(1).set_frame_rate(16000).set_sample_width(2)
    wav_path = file_path + "_converted.wav"
    audio.export(wav_path, format="wav")

    wf = wave.open(wav_path, "rb")
    print(f"Channels: {wf.getnchannels()}, Sample Rate: {wf.getframerate()}, Sample Width: {wf.getsampwidth()}")

    rec = KaldiRecognizer(vosk_model, wf.getframerate())

    results = []
    while True:
        data = wf.readframes(4000)
        if len(data) == 0:
            break
        if rec.AcceptWaveform(data):
            res = json.loads(rec.Result())
            print("Vosk chunk result:", res)
            results.append(res.get("text", ""))
        else:
            partial_res = json.loads(rec.PartialResult())
            print("Vosk partial result:", partial_res)

    final_res = json.loads(rec.FinalResult())
    print("Vosk final result:", final_res)
    results.append(final_res.get("text", ""))

    wf.close()
    os.remove(wav_path)

    transcription = " ".join(results).strip()
    print("Full transcription:", transcription)
    return {"transcription": transcription}


def transcribe_long_audio(file_path: str, chunk_duration_ms: int = 30000) -> dict:
    audio = AudioSegment.from_file(file_path)
    total_duration = len(audio)
    chunks = [audio[i:i+chunk_duration_ms] for i in range(0, total_duration, chunk_duration_ms)]

    print(f"Splitting into {len(chunks)} chunks...")

    full_transcription = ""
    for idx, chunk in enumerate(chunks):
        chunk_path = f"{file_path}_chunk_{idx}.wav"
        chunk.export(chunk_path, format="wav")

        print(f"Transcribing chunk {idx} at {chunk_path}")
        result = transcribe_audio(chunk_path)
        chunk_text = result.get("transcription", "")
        print(f"Chunk {idx} transcription: {chunk_text}")

        full_transcription += chunk_text + " "
        os.remove(chunk_path)

    return {"transcription": full_transcription.strip()}


@app.post("/api/speech-to-text")
async def upload_audio(audio: UploadFile = File(...)):
    print("Audio received:", audio.filename)

    if not audio.filename.lower().endswith((".wav", ".mp3", ".m4a", ".ogg")):
        return JSONResponse(status_code=400, content={"error": "Only WAV, MP3, M4A or OGG files are supported."})

    filepath = os.path.join(UPLOAD_FOLDER, f"{uuid.uuid4()}_{audio.filename}")

    try:
        with open(filepath, "wb") as buffer:
            shutil.copyfileobj(audio.file, buffer)

        result = transcribe_long_audio(filepath)
        print("Transcription result:", result)

        return JSONResponse(content=result)

    except Exception as e:
        print("Error during transcription:", e)
        return JSONResponse(status_code=500, content={"error": str(e)})

    finally:
        if os.path.exists(filepath):
            os.remove(filepath)
