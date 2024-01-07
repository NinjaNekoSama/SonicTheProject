# Use the official Python image with Alpine Linux
FROM python:3.11-alpine

# Set the working directory
WORKDIR /app

# Install additional packages including portaudio
RUN apk --no-cache add \
    gcc \
    musl-dev \
    portaudio19-dev

# Copy the requirements file to the working directory
COPY requirements.txt .

# Install any dependencies
RUN pip install --upgrade pip && \
    pip install -r requirements.txt

# Copy the application code to the working directory
COPY . .

# Expose the port on which the application will run
EXPOSE 5000

# Command to run the application
CMD ["python", "app.py"]
