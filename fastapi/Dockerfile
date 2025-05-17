# Base image
FROM python:3.11-slim-bullseye

WORKDIR /app

# Install dependencies
RUN apt-get update && apt-get install -y ffmpeg && rm -rf /var/lib/apt/lists/*

# Copy requirements and install
COPY requirements.txt .

RUN pip install --upgrade pip setuptools wheel
RUN pip install --no-cache-dir -r requirements.txt

# Copy your app code
COPY . .

# Copy .env file (optional - see note below)
COPY .env .env

# Expose port
EXPOSE 8000

# Run FastAPI app
CMD ["uvicorn", "src.main:app", "--host", "0.0.0.0", "--port", "8000"]