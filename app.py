from fastapi import FastAPI
from pydantic import BaseModel
import pandas as pd
import numpy as np
import joblib

app = FastAPI()

class InputData(BaseModel):
    company: str
    title: str
    year_experience: float

model = joblib.load('models/model.pkl')

@app.get("/")
async def read_root():
    return {"salary_check": "OK", "model_version": 1}

@app.post("/predict")
async def predict(input_data: InputData):
    company_mapping = {'Tana': 2, 'Faritra': 0, 'Remote': 1}
    title_mapping = {'dev': 1, 'AI': 0, 'devops': 2}
    exp_mapping = {
        'Junior': 4,
        'Débutant': 0,
        'Intermédiaire': 3,
        'Expérimenté': 2,
        'Expert': 1
    }

    def categorize_title(title):
        title = title.lower()
        devops_keywords = ['devops', 'sre', 'infrastructure', 'administrateur', 'sysadmin', 'cloud']
        ai_keywords = ['ai', 'data', 'analyst', 'scientist', 'intelligence', 'machine learning', 'ml', 'ia', 'bi']

        if any(kw in title for kw in devops_keywords):
            return 'devops'
        if any(kw in title for kw in ai_keywords):
            return 'AI'
        return 'dev'

    company_encoded = company_mapping.get(input_data.company, -1)
    title_encoded = title_mapping.get(categorize_title(input_data.title), -1)
    exp_category = pd.cut([input_data.year_experience], bins=[0, 1, 3, 5, 10, 100], labels=['Junior', 'Débutant', 'Intermédiaire', 'Expérimenté', 'Expert'],  include_lowest=True)[0]
    exp_encoded = exp_mapping.get(exp_category, -1)

    if -1 in [company_encoded, title_encoded, exp_encoded]:
        return {"error": "Valeur d'entrée invalide."}

    df = pd.DataFrame([[company_encoded, title_encoded, exp_encoded]], columns=['company_encoded', 'title_encoded', 'exp_encoded'])
    pred = model.predict(df)
    return {"predicted_salary": round(np.expm1(pred)[0], 2)}
