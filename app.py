from fastapi import FastAPI
from pydantic import BaseModel
from typing import Optional
import pandas as pd
import numpy as np
import joblib
import os

from fastapi.middleware.cors import CORSMiddleware

app = FastAPI()

origins = ["*"]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

class InputData(BaseModel):
    company: str
    title: str
    year_experience: float

class FeedbackData(InputData):
    predicted_salary: float
    status: str
    new_salary: Optional[float] = None

@app.post("/feedback")
async def feedback(feedback_data: FeedbackData):
    print(feedback_data.dict())
    df = pd.DataFrame([feedback_data.dict()])
    file_exists = os.path.exists("data/feedback_data.csv")
    df.to_csv("data/feedback_data.csv", mode='a', index = False, header=not file_exists)
    return {"message": "Feedback saved", "count": len(feedback_data.dict())}


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

    company_encoded = company_mapping.get(str(input_data.company), -1)
    title_encoded = title_mapping.get(str(categorize_title(input_data.title)), -1)
    exp_category = str(pd.cut([input_data.year_experience], bins=[0, 1, 3, 5, 10, 100], labels=['Junior', 'Débutant', 'Intermédiaire', 'Expérimenté', 'Expert'],  include_lowest=True)[0])
    exp_encoded = exp_mapping.get(exp_category, -1)
    company_encoded = company_mapping.get(input_data.company, -1)
    title_encoded = title_mapping.get(categorize_title(input_data.title), -1)
    exp_category = str(pd.cut([input_data.year_experience], bins=[0, 1, 3, 5, 10, 100], labels=['Junior', 'Débutant', 'Intermédiaire', 'Expérimenté', 'Expert'],  include_lowest=True)[0])
    exp_encoded = exp_mapping.get(exp_category, -1)

    if -1 in [company_encoded, title_encoded, exp_encoded]:
        return {"error": "Valeur d'entrée invalide."}

    df = pd.DataFrame(
        [[company_encoded, title_encoded, exp_encoded]],
        columns=pd.Index(['company_encoded', 'title_encoded', 'exp_encoded']))
    pred = model.predict(df)
    return {"predicted_salary": round(np.expm1(pred)[0], 2)}
