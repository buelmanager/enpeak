# EnPeak Backend - HuggingFace Spaces
FROM python:3.11-slim

WORKDIR /app

# Install system dependencies
RUN apt-get update && apt-get install -y --no-install-recommends \
    curl \
    ffmpeg \
    && rm -rf /var/lib/apt/lists/*

# Install Python dependencies
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# Copy backend code
COPY main.py .
COPY api/ ./api/
COPY core/ ./core/
COPY scenarios/ ./scenarios/

# Copy data (scenarios)
COPY data/ ./data/

# Create directories
RUN mkdir -p ./vectordb

# Environment
ENV PYTHONUNBUFFERED=1
ENV PORT=7860
ENV HOST=0.0.0.0

EXPOSE 7860

# Health check
HEALTHCHECK --interval=30s --timeout=10s --start-period=30s --retries=3 \
    CMD curl -f http://localhost:7860/api/health || exit 1

# Run
CMD ["python", "-m", "uvicorn", "main:app", "--host", "0.0.0.0", "--port", "7860"]
