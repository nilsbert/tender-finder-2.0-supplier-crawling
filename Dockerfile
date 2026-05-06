FROM python:3.11-slim-bullseye

# System dependencies
RUN apt-get update && apt-get install -y --no-install-recommends \
    curl gnupg2 ca-certificates unixodbc-dev g++ \
    && apt-get clean && rm -rf /var/lib/apt/lists/*

WORKDIR /app

# Copy requirements and install
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# Install Playwright and its browser dependencies
RUN playwright install --with-deps chromium

# Copy the entire service
COPY . .

# Ensure the module is discoverable
ENV PYTHONPATH="/app"

EXPOSE 8011

CMD ["uvicorn", "main:app", "--host", "0.0.0.0", "--port", "8011"]
