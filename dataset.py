"""
    This file contains the code to filter data from Madagascar only
    and to separate the train and test data.
"""

import pandas as pd
import os
from sklearn.model_selection import train_test_split

def extract_data():

    df = pd.read_csv("data/Karama (réponses) - Réponses _cleaned_.csv")

    #Firenena Hitoerana is Madagascar
    df = df[df['Firenena Hitoerana'] == 'Madagascar']

    train_data, test_data = train_test_split(df, test_size=0.2, random_state=17)

    if not os.path.exists("data"):
        os.mkdir("data")

    #Save data
    train_data.to_csv("data/train.csv", index=False)
    test_data.to_csv("data/test.csv", index=False)

    print("Extracted and saved data successfully")

if __name__ == "__main__":
    extract_data()
