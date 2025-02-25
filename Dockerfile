FROM python:3.13.2-alpine3.21

RUN apk update && apk add --no-cache \
    build-base \
    gcc \
    g++ \
    python3-dev \
    py3-pip

WORKDIR /app

COPY . ./

RUN pip install --no-cache-dir --upgrade pip setuptools wheel \
    && PIP_NO_BUILD_ISOLATION=1 pip install --no-cache-dir -r requirements.txt

EXPOSE 8080

CMD ["gunicorn", "--workers", "5", "--worker-class", "uvicorn.workers.UvicornWorker", "app:app", "--bind", "0.0.0.0:8080", "--log-file", "logs.log"]
