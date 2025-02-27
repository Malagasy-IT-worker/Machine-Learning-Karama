```bash
gunicorn -w 4 -k uvicorn.workers.UvicornWorker app:app  --bind 0.0.0.0:8080 --log-file logs.log
```
