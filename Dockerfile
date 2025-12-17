FROM python:3.12.3-slim

RUN apt-get update && apt-get install -y \
    libreoffice-core \
    libreoffice-calc \
    libreoffice-writer \
    fonts-liberation \
    fonts-dejavu \
    fonts-freefont-ttf \
    && apt-get clean \
    && rm -rf /var/lib/apt/lists/*

WORKDIR /app

COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

COPY . .

RUN mkdir -p /app/logs

CMD ["sh", "-c", "uvicorn web_app:app --host 0.0.0.0 --port 8000"]