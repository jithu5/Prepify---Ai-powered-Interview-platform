FROM python:3.13.3-alpine3.21

# Update and install necessary packages including ffmpeg
RUN apt-get update && apt-get install -y ffmpeg

# Set the working directory in the container
WORKDIR /app

# Copy the requirements.txt file into the container
COPY requirements.txt .

# Install dependencies
RUN pip install -r requirements.txt

# Copy the application code into the container
COPY . .

# Expose the port the app will run on
EXPOSE 8000

# Run the application with uvicorn, setting the correct path to your FastAPI app
CMD ["uvicorn", "src.main:app", "--reload"]