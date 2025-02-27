"""
    Predict with the best model giving random new dataset
"""

import os
import joblib
import numpy as np
import pandas as pd

class Predictor:
    def __init__(self):
        self.config = self.load_config()
        self.model_path = self.config['model']['store_path']
        self.model = self.load_model()

    def load_config(self):
        import yaml
        with open('config.yml', 'r') as config_file:
            return yaml.safe_load(config_file)

    def load_model(self):
        model_file_path = os.path.join(self.model_path, 'model.pkl')
        return joblib.load(model_file_path)

    def predict(self, company, title, experience):
        """
        -- company: Tana, year_exp: 3, title: 'Développeur'
        --> salary: 3064183.65 Ariary
        """
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

        company_encoded = company_mapping.get(company, -1)
        title_encoded = title_mapping.get(categorize_title(title), -1)
        exp_category = pd.cut([experience], bins=[0, 1, 3, 5, 10, 100], labels=['Junior', 'Débutant', 'Intermédiaire', 'Expérimenté', 'Expert'])[0]
        exp_encoded = exp_mapping.get(exp_category, -1)

        if -1 in [company_encoded, title_encoded, exp_encoded]:
            return "Erreur : Valeur d'entrée invalide."

        prediction = self.model.predict([[company_encoded, title_encoded, exp_encoded]])
        return np.expm1(prediction)[0]

