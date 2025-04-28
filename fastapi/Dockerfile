# fastapi/Dockerfile

# Use Python 3.12 slim
FROM python:3.12-slim AS base

# Install required system dependencies (like ffmpeg)
RUN apt-get update && apt-get install -y --no-install-recommends \
    ffmpeg \
    && apt-get clean && rm -rf /var/lib/apt/lists/*

# Set work directory
WORKDIR /app

# Install Python dependencies
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# Copy all code
COPY . .

# Expose the port
EXPOSE 8000

# Run the application with uvicorn, setting the correct path to your FastAPI app
CMD ["uvicorn", "src.main:app", "--reload"]