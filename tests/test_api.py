from fastapi.testclient import TestClient
from app import app

client = TestClient(app)

def test_read_root():
    """ Teste si l'API répond bien """
    response = client.get("/")
    assert response.status_code == 200
    assert response.json() == {"salary_check": "OK", "model_version": 1}

def test_predict():
    """ Teste la prédiction avec des valeurs valides """
    input_data = {
        "company": "Tana",
        "title": "devops",
        "year_experience": 3.5
    }
    response = client.post("/predict", json=input_data)
    assert response.status_code == 200
    data = response.json()

    # check if it return prediction value in float
    assert "predicted_salary" in data
    assert isinstance(data["predicted_salary"], float)

def test_invalid_predict_input():
    """ Teste avec une valeur invalide """
    input_data = {
        "company": "Unknown",
        "title": "Mystery Job",
        "year_experience": -5  # invalid value
    }
    response = client.post("/predict", json=input_data)
    assert response.status_code == 200
    assert "error" in response.json()

def test_feedback():
    """ test the feedback post """
    feedback_data = {
        "company": "Tana",
        "title": "devops",
        "year_experience": 3.5,
        "predicted_salary": 50000.0,
        "status": "hight"
    }
    response = client.post("/feedback", json=feedback_data)
    assert response.status_code == 200
    assert response.json()["message"] == "Feedback saved"
