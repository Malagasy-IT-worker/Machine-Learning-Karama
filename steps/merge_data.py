import pandas as pd

class CSVConcatenator:
    def __init__(self, input_paths, output_path):
        """
        input_paths: liste des chemins des fichiers CSV à concaténer
        output_path: chemin du fichier CSV de sortie
        """
        self.input_paths = input_paths
        self.output_path = output_path
        self.dataframes = []
        self.df_merged = None

    def load_and_clean(self):
        for path in self.input_paths:
            df = pd.read_csv(path)
            df = df.loc[:, ~df.columns.str.contains("^Unnamed")]  # Supprimer les colonnes Unnamed
            self.dataframes.append(df)

    def concatenate(self):
        if not self.dataframes:
            raise ValueError("Aucun fichier chargé. Utilise d'abord `load_and_clean()`.")
        self.df_merged = pd.concat(self.dataframes, ignore_index=True)

    def save(self):
        if self.df_merged is None:
            raise ValueError("Aucune donnée à sauvegarder. Utilise `concatenate()` d'abord.")
        self.df_merged.to_csv(self.output_path, index=False)
