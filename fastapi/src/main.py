from fastapi import FastAPI, UploadFile, File
from fastapi.responses import JSONResponse
import os
import shutil
import uuid

from transformers import WhisperProcessor, WhisperForConditionalGeneration
from pydub import AudioSegment
import torch
import numpy as np

app = FastAPI()

# Load Whisper Tiny model once
processor = WhisperProcessor.from_pretrained("openai/whisper-tiny.en")
model = WhisperForConditionalGeneration.from_pretrained("openai/whisper-tiny.en")

UPLOAD_FOLDER = "uploads"
os.makedirs(UPLOAD_FOLDER, exist_ok=True)

def transcribe_audio(file_path: str) -> str:
    # Load and preprocess audio
    audio = AudioSegment.from_mp3(file_path)
    audio = audio.set_channels(1).set_frame_rate(16000)
    audio_array = np.array(audio.get_array_of_samples())
    
    input_features = processor(audio_array, sampling_rate=16000, return_tensors="pt").input_features
    predicted_ids = model.generate(input_features)
    transcription = processor.batch_decode(predicted_ids, skip_special_tokens=True)
    
    return transcription[0]

@app.post("/api/speech-to-text")
async def upload_audio(audio: UploadFile = File(...)):
    unique_filename = f"{uuid.uuid4()}.mp3"  # 👈 generate a unique filename
    file_location = os.path.join(UPLOAD_FOLDER, unique_filename)
    
    try:
        # Save uploaded file
        with open(file_location, "wb") as buffer:
            shutil.copyfileobj(audio.file, buffer)
        
        # Transcribe
        transcription = transcribe_audio(file_location)

        return JSONResponse(content={"transcription": transcription})
    
    except Exception as e:
        return JSONResponse(status_code=500, content={"error": str(e)})
    
    finally:
        # Clean up: delete the file after processing
        if os.path.exists(file_location):
            os.remove(file_location)
