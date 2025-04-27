import pandas as pd

class FeedbackTransformer:
    def __init__(self, input_path, output_path):
        self.input_path = input_path
        self.output_path = output_path
        self.df = None
        self.df_transformed = None

    def load_data(self):
        self.df = pd.read_csv(self.input_path)

    def map_company_to_location(self, company):
        mapping = {
            "Tana": "Antananarivo",
            "Remote": "Remote"
        }
        return mapping.get(company, company)

    def transform(self):
        if self.df is None:
            raise ValueError("Données non chargées. Utilise `load_data()` d'abord.")

        self.df_transformed = pd.DataFrame({
            "Firenena Hitoerana": "Madagascar",
            "Province/Remote": self.df["company"].apply(self.map_company_to_location),
            "Titre": self.df["title"],
            "Taona niasana": self.df["year_experience"].apply(lambda x: str(x).replace(".", ",")),
            "Karama": self.df["new_salary"].astype(int),
            "Unité": "Ariary",
            "Fréquence": "Volana"
        })

    def save(self):
        if self.df_transformed is None:
            raise ValueError("Données non transformées. Utilise `transform()` d'abord.")
        self.df_transformed.to_csv(self.output_path, index=False)
