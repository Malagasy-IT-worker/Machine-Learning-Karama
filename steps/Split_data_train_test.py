"""
    This file contains a class to filter data from Madagascar only
    and to split the dataset into train and test sets.
"""

import pandas as pd
import os
from sklearn.model_selection import train_test_split

class Split_data_train_test:
    def __init__(self, input_file="data/merged.csv", output_dir="data", country="Madagascar", test_size=0.2, random_state=17):
        self.input_file = input_file
        self.output_dir = output_dir
        self.country = country
        self.test_size = test_size
        self.random_state = random_state
        self.train_data = None
        self.test_data = None

    def load_and_filter(self):
        df = pd.read_csv(self.input_file)
        self.filtered_df = df[df['Firenena Hitoerana'] == self.country]
        return self.filtered_df

    def split_data(self):
        if self.filtered_df is None:
            raise ValueError("No data loaded. Run load_and_filter() first.")
        self.train_data, self.test_data = train_test_split(
            self.filtered_df,
            test_size=self.test_size,
            random_state=self.random_state
        )

    def save_data(self):
        if not os.path.exists(self.output_dir):
            os.makedirs(self.output_dir)
        self.train_data.to_csv(os.path.join(self.output_dir, "train.csv"), index=False)
        self.test_data.to_csv(os.path.join(self.output_dir, "test.csv"), index=False)

    def process(self):
        self.load_and_filter()
        self.split_data()
        self.save_data()
        print("Data ingestion and saving completed successfully.")
