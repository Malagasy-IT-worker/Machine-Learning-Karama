FROM python:3.12-slim AS compile-image
RUN apt-get update
RUN apt-get install -y --no-install-recommends build-essential gcc
WORKDIR /app
RUN python -m venv /opt/venv
ENV PATH="/opt/venv/bin:$PATH"
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt


FROM python:3.12-slim AS prod
WORKDIR /app
COPY --from=compile-image /opt/venv /opt/venv
ENV PATH="/opt/venv/bin:$PATH"
COPY . .
EXPOSE 8080
RUN touch logs.log
CMD ["gunicorn", "--workers", "5", "--worker-class", "uvicorn.workers.UvicornWorker", "app:app", "--bind", "0.0.0.0:8080", "--log-file", "logs.log"]
