# Use official Python 3.11 image as the base
FROM python:3.11-bullseye

# Set the working directory to /SonicTheProject
WORKDIR /SonicTheProject
ARG DEBIAN_FRONTEND=noninteractive
# Copy the current directory contents into the container at /SonicTheProject
COPY . .

RUN apt-get update && \
    apt-get install -y \
    python3-dev \
    python3-distutils \
    python3-pip \
    portaudio19-dev \
    # Add other dependencies as needed \
    && rm -rf /var/lib/apt/lists/* \

RUN ln -s /usr/local/lib/python3.11/dist-packages/numpy/core/include/numpy/ /usr/include/numpy
# Install any needed packages specified in requirements.txt
RUN pip install --no-cache-dir -r requirements.txt

# Expose port 80 to the world outside this container
EXPOSE 80

# Run app.py when the container launches
CMD ["python3.11", "app.py"]
