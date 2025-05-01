from fastapi import FastAPI, UploadFile, File
from fastapi.responses import JSONResponse
from fastapi.middleware.cors import CORSMiddleware
import os
import shutil
import uuid
import torch

from transformers import WhisperProcessor, WhisperForConditionalGeneration
from pydub import AudioSegment
import numpy as np

app = FastAPI()
# --- ✅ CORS settings ---
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"],  # 👈 Only allow your frontend origin
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Load Whisper Tiny model once
processor = WhisperProcessor.from_pretrained("openai/whisper-small.en")
model = WhisperForConditionalGeneration.from_pretrained("openai/whisper-small.en")
model.config.forced_decoder_ids = processor.get_decoder_prompt_ids(language="english", task="transcribe")

UPLOAD_FOLDER = "uploads"
os.makedirs(UPLOAD_FOLDER, exist_ok=True)

def transcribe_audio(file_path: str) -> str:
    print("Audio for transcribing", file_path)
    
    if not file_path.endswith((".mp3", ".wav")):
        return JSONResponse(status_code=400, content={"error": "Only MP3 or WAV files are supported."})

    # Load and preprocess audio
    audio = AudioSegment.from_file(file_path)
    audio = audio.set_channels(1).set_frame_rate(16000)
    audio_array = np.array(audio.get_array_of_samples())
    
    # Use the processor with correct input features
    input_features = processor(audio_array, sampling_rate=16000, return_tensors="pt", padding=True)
    print(input_features)

    # Ensure correct input format, use 'input_values' for audio models
    predicted_ids = model.generate(input_features['input_features'])
    transcription = processor.batch_decode(predicted_ids, skip_special_tokens=True)
    
    return transcription[0]


@app.post("/api/speech-to-text")
async def upload_audio(audio: UploadFile = File(...)):
    print("Audio ", audio)
    try:
        # Check if the file is an MP3 or WAV file
        if not audio.filename.endswith((".mp3", ".wav")):
            return JSONResponse(status_code=400, content={"error": "Only MP3 or WAV files are supported."})

        # Save uploaded file directly
        filename = f"{uuid.uuid4()}_{audio.filename}"
        filepath = os.path.join(UPLOAD_FOLDER, filename)

        with open(filepath, "wb") as buffer:
            shutil.copyfileobj(audio.file, buffer)

        # Transcribe directly without conversion
        transcription = transcribe_audio(filepath)
        print(transcription)
        return JSONResponse(content={"transcription": transcription})

    except Exception as e:
        print("Error in transcription:", e)
        return JSONResponse(status_code=500, content={"error": str(e)})

    finally:
        # Clean up file
        if os.path.exists(filepath):
            os.remove(filepath)
