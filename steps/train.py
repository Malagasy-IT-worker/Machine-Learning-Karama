"""
Train our best model from the research.ipynb
"""

import os
import joblib
import yaml
from sklearn.model_selection import train_test_split, GridSearchCV
from sklearn.neighbors import KNeighborsRegressor
from sklearn.metrics import mean_squared_error, r2_score, mean_absolute_error
import numpy as np

class Trainer:
    def __init__(self):
        self.config = self.load_config()
        self.model_name = self.config['model']['name']
        self.model_params = self.config['model']['params']
        self.model_path = self.config['model']['store_path']
        self.model = self.create_model()

    def load_config(self):
        with open('config.yml', 'r') as config_file:
            return yaml.safe_load(config_file)

    def create_model(self):
        if self.model_name == "KNeighborsRegressor":
            return KNeighborsRegressor(**self.model_params)
        raise ValueError("Model not supported")

    def feature_target_separator(self, data):
        X = data[['company_encoded', 'title_encoded', 'exp_encoded']]
        y = data['log_salary']
        return X, y

    def train_model(self, X_train, y_train):
        self.model.fit(X_train, y_train)

    def save_model(self):
        os.makedirs(self.model_path, exist_ok=True)
        model_file_path = os.path.join(self.model_path, 'model.pkl')
        joblib.dump(self.model, model_file_path)
