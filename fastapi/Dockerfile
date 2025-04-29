# Stage 1: Build layer
FROM python:3.11-slim-bullseye AS builder

WORKDIR /app

# Install ffmpeg and other dependencies
RUN apt-get update && \
    apt-get install -y ffmpeg libsndfile1 && \
    rm -rf /var/lib/apt/lists/*

RUN apt update && apt install -y ffmpeg


# Copy requirements file
COPY requirements.txt .

# Install pip packages
RUN pip install --upgrade pip setuptools wheel

# # Install CPU-only PyTorch (if needed)
# RUN pip install --no-cache-dir torch==2.7.0 torchaudio==2.7.0

# Install rest of the requirements
RUN pip install --no-cache-dir --retries 10 -r requirements.txt

# Stage 2: Runtime layer
FROM python:3.11-slim-bullseye

WORKDIR /app

# Copy installed libraries and ffmpeg binaries from builder stage
COPY --from=builder /usr/local/lib/python3.11/site-packages /usr/local/lib/python3.11/site-packages
COPY --from=builder /usr/local/bin /usr/local/bin

# Copy your app code
COPY . .

# Expose FastAPI port
EXPOSE 8000

# Run app with Uvicorn
CMD ["uvicorn", "src.main:app", "--host", "0.0.0.0", "--port", "8000"]
