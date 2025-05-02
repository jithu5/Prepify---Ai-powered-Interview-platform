from fastapi import FastAPI, UploadFile, File
from fastapi.responses import JSONResponse
from fastapi.middleware.cors import CORSMiddleware
import os
import shutil
import uuid
import numpy as np
from pydub import AudioSegment
import torch

from transformers import WhisperProcessor, WhisperForConditionalGeneration

app = FastAPI()

# CORS settings
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"],  # Update if needed
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Load model and processor
processor = WhisperProcessor.from_pretrained("openai/whisper-small.en")
model = WhisperForConditionalGeneration.from_pretrained("openai/whisper-small.en")
model.config.forced_decoder_ids = processor.get_decoder_prompt_ids(language="english", task="transcribe")

# Move to GPU if available
device = torch.device("cuda" if torch.cuda.is_available() else "cpu")
model.to(device)

UPLOAD_FOLDER = "uploads"
os.makedirs(UPLOAD_FOLDER, exist_ok=True)

def transcribe_audio(file_path: str) -> dict:
    print(f"Processing audio file: {file_path}")

    if not file_path.endswith((".mp3", ".wav")):
        return {"error": "Only MP3 or WAV files are supported."}

    # Load and preprocess audio
    audio = AudioSegment.from_file(file_path)
    audio = audio.set_channels(1).set_frame_rate(16000)


# Convert to numpy array (float32 in range [-1, 1])


    print(f"Original channels: {audio.channels}, frame rate: {audio.frame_rate}, duration: {len(audio) / 1000:.2f}s")

    samples = np.array(audio.get_array_of_samples()).astype(np.float32) / (1 << 15)
    # samples = np.array(audio.get_array_of_samples()).astype(np.float32)
    samples /= np.iinfo(np.int16).max  # Normalize to [-1, 1]
    print(f"Audio samples shape: {samples.shape}, max: {samples.max()}, min: {samples.min()}")

    # Process input
    inputs = processor(
        samples,
        sampling_rate=16000,
        return_tensors="pt",
        return_attention_mask=True,
    )
    inputs = {k: v.to(device) for k, v in inputs.items()}


    print("Input features shape:", inputs["input_features"].shape)

    forced_decoder_ids = processor.get_decoder_prompt_ids(language="english", task="transcribe")

    predicted_ids = model.generate(
    inputs["input_features"],
    attention_mask=inputs["attention_mask"],
    forced_decoder_ids=forced_decoder_ids,
    max_length=448,
    num_beams=5,
    early_stopping=True
    )

    print("Predicted token IDs:", predicted_ids)
    transcription = processor.batch_decode(predicted_ids, skip_special_tokens=True)[0]
    print("Raw transcription: ", transcription)

    return {"transcription": transcription}

@app.post("/api/speech-to-text")
async def upload_audio(audio: UploadFile = File(...)):
    print("Audio ", audio)
    try:
        if not audio.filename.endswith((".mp3", ".wav")):
            return JSONResponse(status_code=400, content={"error": "Only MP3 or WAV files are supported."})

        filename = f"{uuid.uuid4()}_{audio.filename}"
        filepath = os.path.join(UPLOAD_FOLDER, filename)

        with open(filepath, "wb") as buffer:
            shutil.copyfileobj(audio.file, buffer)

        result = transcribe_audio(filepath)
        return JSONResponse(content=result)

    except Exception as e:
        print("Error in transcription:", e)
        return JSONResponse(status_code=500, content={"error": str(e)})

    finally:
        if os.path.exists(filepath):
            os.remove(filepath)
