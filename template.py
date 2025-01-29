"""
Project Template Generator Script
This script automates the creation of a predefined project structure
"""

import os
from pathlib import Path
import logging

logging.basicConfig(level=logging.INFO, format='[%(asctime)s: %(message)s]')

list_of_files = [
    ".github/workflows/docs.yml",
    "data/production.csv",
    "data/train.csv",
    "data/test.csv",
    "docs/index.md",
    "docs/project_structure.txt",
    "models/",
    "mlruns/",
    "steps/__init__.py",
    "steps/ingest.py",
    "steps/clean.py",
    "steps/train.py",
    "steps/predict.py",
    "tests/__init__.py",
    "tests/test_ingest.py",
    "tests/test_clean.py",
    ".gitignore",
    "app.py",
    "config.yml",
    "data.dvc",
    "dataset.py",
    "dockerfile",
    "LICENSE",
    "main.py",
    "Makefile",
    "mkdocs.yml",
    "README.md",
    "requirements.txt",
    "samples.json",

    #Monitoring files
    "monitor.ipynb",
    "test_data.html",
    "production_data.html"
]

for filepath in list_of_files:
    filepath = Path(filepath)
    filedir, filename = os.path.split(filepath)

    if filedir:
        os.makedirs(filedir, exist_ok=True)
        logging.info(f"Creating directory: {filedir} for the file {filename}")

    if not filepath.exists():
        with open(filepath, 'w') as f:
            logging.info(f"Creating empty file: {filepath}")

    else:
        logging.info(f"File already exists: {filepath}")
        