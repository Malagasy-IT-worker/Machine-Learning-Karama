"""
    Clean our dataset
"""

import numpy as np
import pandas as pd
from sklearn.preprocessing import LabelEncoder

class Cleaner:
    def __init__(self):
        self.le = LabelEncoder()

    def clean_data(self, df):
        df = df[df['Firenena Hitoerana'] == 'Madagascar']
        df = df.rename(columns={
            'Province/Remote': 'company',
            'Titre': 'title',
            'Taona niasana': 'year_experience',
            'Karama': 'salary'
        })
        df['year_experience'] = df['year_experience'].str.replace(',', '.').astype(float)
        df['company'] = df['company'].str.replace('Antananarivo', 'Tana').astype(str)
        df['salary'] = df['salary'].str.replace(' ', '').astype(int)
        df = df.drop(columns=['Firenena Hitoerana', 'Unité', 'Fréquence'])

        replace_to = {
            'Antananarivo': 'Tana', 'Analamanga': 'Tana', 'Madagascar': 'Tana', 'Tananarivo': 'Tana', 'antananarivo': 'Tana',
            'Toamasina': 'Faritra', 'Toliara': 'Faritra', 'Fianarantsoa': 'Faritra', 'Mahajanga': 'Faritra', 'Ihosy': 'Faritra',
            'Remote France': 'Remote', 'Remote Belgique': 'Remote', 'Remote USA': 'Remote'
        }

        df['company'] = df['company'].replace(replace_to)
        df['log_salary'] = np.log1p(df['salary'])
        df['exp_category'] = pd.cut(df['year_experience'],
                                    bins=[0, 1, 3, 5, 10, 100],
                                    labels=['Junior', 'Débutant', 'Intermédiaire', 'Expérimenté', 'Expert'])

        df['title_category'] = df['title'].apply(self.categorize_title)
        df['company_encoded'] = self.le.fit_transform(df['company'])
        df['title_encoded'] = self.le.fit_transform(df['title_category'])
        df['exp_encoded'] = self.le.fit_transform(df['exp_category'])

        return df

    def categorize_title(self, title):
        """
        example post: 
        Data scientist, AI Engineer, ML Engineer --> AI
        Responsable infrastructure, devops, --> devops
        other --> dev
        """
        title = title.lower()
        devops_keywords = ['devops', 'sre', 'infrastructure', 'administrateur', 'sysadmin', 'cloud']
        ai_keywords = ['ai', 'data', 'analyst', 'scientist', 'intelligence', 'machine learning', 'ml', 'ia', 'bi']

        if any(kw in title for kw in devops_keywords):
            return 'devops'
        if any(kw in title for kw in ai_keywords):
            return 'AI'
        return 'dev'
