from fastapi import FastAPI, HTTPException
from pydantic import BaseModel
from typing import Optional
import pandas as pd
import numpy as np
import joblib
import os
from fastapi.middleware.cors import CORSMiddleware

# Initialisation de l'application FastAPI
app = FastAPI()

# Configuration CORS (Cross-Origin Resource Sharing)
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000", "https://votre-frontend.com"],  # À adapter selon vos besoins
    allow_credentials=True,
    allow_methods=["GET", "POST"],
    allow_headers=["*"],
)

# Modèles Pydantic pour la validation des données
class InputData(BaseModel):
    company: str
    title: str
    year_experience: float

class FeedbackData(InputData):
    predicted_salary: float
    status: str
    new_salary: Optional[float] = None

# Route pour enregistrer les feedbacks
@app.post("/feedback")
async def feedback(feedback_data: FeedbackData):
    try:
        print(feedback_data.dict())  # Log des données reçues
        df = pd.DataFrame([feedback_data.dict()])

        # Création du dossier si inexistant
        os.makedirs("data", exist_ok=True)

        # Enregistrement dans le fichier CSV
        file_exists = os.path.exists("data/feedback_data.csv")
        df.to_csv("data/feedback_data.csv", mode='a', index=False, header=not file_exists)

        return {"message": "Feedback saved", "count": len(feedback_data.dict())}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

# Chargement du modèle de prédiction
try:
    model = joblib.load('models/model.pkl')
except Exception as e:
    raise RuntimeError(f"Erreur lors du chargement du modèle: {e}")

# Route de vérification de santé
@app.get("/")
async def read_root():
    return {"salary_check": "OK", "model_version": 1}

# Route de prédiction de salaire
@app.post("/predict")
async def predict(input_data: InputData):
    try:
        # Mappings pour l'encodage des catégories
        company_mapping = {'Tana': 2, 'Faritra': 0, 'Remote': 1}
        title_mapping = {'dev': 1, 'AI': 0, 'devops': 2}
        exp_mapping = {
            'Junior': 4,
            'Débutant': 0,
            'Intermédiaire': 3,
            'Expérimenté': 2,
            'Expert': 1
        }

        # Fonction de catégorisation du titre
        def categorize_title(title):
            title = title.lower()
            devops_keywords = ['devops', 'sre', 'infrastructure', 'administrateur', 'sysadmin', 'cloud']
            ai_keywords = ['ai', 'data', 'analyst', 'scientist', 'intelligence', 'machine learning', 'ml', 'ia', 'bi']

            if any(kw in title for kw in devops_keywords):
                return 'devops'
            if any(kw in title for kw in ai_keywords):
                return 'AI'
            return 'dev'

        # Encodage des caractéristiques
        company_encoded = company_mapping.get(input_data.company, -1)
        title_encoded = title_mapping.get(categorize_title(input_data.title), -1)

        # Catégorisation de l'expérience
        exp_category = str(pd.cut(
            [input_data.year_experience],
            bins=[0, 1, 3, 5, 10, 100],
            labels=['Junior', 'Débutant', 'Intermédiaire', 'Expérimenté', 'Expert'],
            include_lowest=True
        )[0])
        exp_encoded = exp_mapping.get(exp_category, -1)

        # Validation des entrées
        if -1 in [company_encoded, title_encoded, exp_encoded]:
            raise HTTPException(status_code=400, detail="Valeur d'entrée invalide")

        # Préparation des données pour la prédiction
        df = pd.DataFrame(
            [[company_encoded, title_encoded, exp_encoded]],
            columns=['company_encoded', 'title_encoded', 'exp_encoded']
        )

        # Prédiction et retour du résultat
        pred = model.predict(df)
        return {"predicted_salary": round(np.expm1(pred)[0], 2)}

    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Erreur de prédiction: {str(e)}")
