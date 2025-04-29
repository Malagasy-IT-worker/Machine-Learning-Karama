from fastapi import FastAPI, HTTPException
from pydantic import BaseModel, Field, validator
from typing import Optional
import pandas as pd
import numpy as np
import joblib
import os
import logging
from fastapi.middleware.cors import CORSMiddleware

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000", "https://yourfrontenddomain.com"],  # À adapter
    allow_credentials=True,
    allow_methods=["GET", "POST", "OPTIONS"],
    allow_headers=["*"],
)

class InputData(BaseModel):
    company: str = Field(..., example="Tana")
    title: str = Field(..., example="Développeur")
    year_experience: float = Field(..., ge=0, le=50, example=3.5)

    @validator('company')
    def validate_company(cls, v):
        valid_companies = ['Tana', 'Faritra', 'Remote']
        if v not in valid_companies:
            raise ValueError(f"Société doit être parmi {valid_companies}")
        return v

class FeedbackData(InputData):
    predicted_salary: float = Field(..., gt=0)
    status: str = Field(..., example="success")
    new_salary: Optional[float] = Field(None, gt=0)

try:
    model = joblib.load('models/model.pkl')
    logger.info("Modèle chargé avec succès")
except Exception as e:
    logger.error(f"Erreur de chargement du modèle: {e}")
    raise RuntimeError("Impossible de charger le modèle")

@app.post("/feedback")
async def create_feedback(feedback_data: FeedbackData):
    """Enregistre un feedback dans un fichier CSV"""
    try:
        logger.info(f"Reçu feedback: {feedback_data.dict()}")

        os.makedirs("data", exist_ok=True)

        df = pd.DataFrame([feedback_data.dict()])
        file_exists = os.path.exists("data/feedback_data.csv")
        df.to_csv("data/feedback_data.csv", mode='a', index=False, header=not file_exists)

        return {"status": "success", "message": "Feedback enregistré"}

    except Exception as e:
        logger.error(f"Erreur feedback: {str(e)}")
        raise HTTPException(status_code=500, detail="Erreur serveur")

@app.get("/")
async def health_check():
    """Endpoint de vérification de santé"""
    return {
        "salary_check": "OK",
        "model_version": 1,
        "status": "healthy",
        "api_version": "1.0.0"
    }

@app.post("/predict")
async def predict_salary(input_data: InputData):
    """Prédit le salaire basé sur les données d'entrée"""
    try:
        COMPANY_MAPPING = {'Tana': 2, 'Faritra': 0, 'Remote': 1}
        TITLE_MAPPING = {'dev': 1, 'AI': 0, 'devops': 2}
        EXP_MAPPING = {
            'Débutant': 0,
            'Junior': 4,
            'Intermédiaire': 3,
            'Expérimenté': 2,
            'Expert': 1
        }

        def categorize_title(title: str) -> str:
            title = title.lower()
            if any(kw in title for kw in ['devops', 'sre', 'infra']):
                return 'devops'
            if any(kw in title for kw in ['ai', 'ml', 'data science']):
                return 'AI'
            return 'dev'

        company_encoded = COMPANY_MAPPING[input_data.company]
        title_category = categorize_title(input_data.title)
        title_encoded = TITLE_MAPPING.get(title_category, -1)

        exp_bins = [0, 1, 3, 5, 10, 50]
        exp_labels = ['Débutant', 'Junior', 'Intermédiaire', 'Expérimenté', 'Expert']
        exp_category = pd.cut(
            [input_data.year_experience],
            bins=exp_bins,
            labels=exp_labels,
            include_lowest=True
        )[0]
        exp_encoded = EXP_MAPPING.get(str(exp_category), -1)

        if -1 in [title_encoded, exp_encoded]:
            raise ValueError("Combinaison titre/expérience non valide")

        features = pd.DataFrame(
            [[company_encoded, title_encoded, exp_encoded]],
            columns=['company_encoded', 'title_encoded', 'exp_encoded']
        )
        prediction = np.expm1(model.predict(features)[0])

        return {
            "predicted_salary": round(prediction, 2),
            "metadata": {
                "company": input_data.company,
                "title_category": title_category,
                "experience_level": str(exp_category)
            }
        }

    except ValueError as ve:
        logger.warning(f"Erreur validation: {ve}")
        raise HTTPException(status_code=400, detail=str(ve))
    except Exception as e:
        logger.error(f"Erreur prédiction: {str(e)}")
        raise HTTPException(status_code=500, detail="Erreur de prédiction")
