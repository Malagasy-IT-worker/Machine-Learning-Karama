"""
    make all the stuff until the model choice
"""

import logging
import yaml
import numpy as np
from steps.ingest import Ingestion
from steps.clean import Cleaner
from steps.train import Trainer
from steps.predict import Predictor
from sklearn.metrics import mean_absolute_error, r2_score, mean_squared_error

# Set up logging
logging.basicConfig(level=logging.INFO, format='%(asctime)s:%(levelname)s:%(message)s')

def main():
    with open('config.yml', 'r') as file:
        config = yaml.safe_load(file)

    # Load data
    ingestion = Ingestion()
    train, test = ingestion.load_data()
    logging.info("Data ingestion completed successfully")

    # Clean data
    cleaner = Cleaner()
    train_data = cleaner.clean_data(train)
    test_data = cleaner.clean_data(test)
    logging.info("Data cleaning completed successfully")

    # Prepare and train model
    trainer = Trainer()
    X_train, y_train = trainer.feature_target_separator(train_data)
    trainer.train_model(X_train, y_train)
    trainer.save_model()
    logging.info("Model training completed successfully")

    # Evaluate model
    predictor = Predictor()
    X_test, y_test = trainer.feature_target_separator(test_data)
    y_pred = predictor.model.predict(X_test)
    rmse = np.sqrt(mean_squared_error(y_test, y_pred))
    r2 = r2_score(y_test, y_pred)
    mae = mean_absolute_error(y_test, y_pred)

    logging.info(f"Model evaluation completed successfully. RMSE: {rmse}, R2: {r2}, MAE: {mae}")

    # Example prediction
    company = 'Tana'
    title = 'Développeur'
    experience = 3
    predicted_salary = predictor.predict(company, title, experience)
    print(f"Le salaire prédit est : {predicted_salary:.2f}")

if __name__ == "__main__":
    main()
