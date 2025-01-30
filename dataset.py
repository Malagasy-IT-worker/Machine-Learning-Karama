"""
    This file contains the code to scrape the data from the google sheet in the drive of the owner
"""

import gspread 
import pandas as pd
from oauth2client.service_account import ServiceAccountCredentials

## Définir les permissions
scope = ["https://spreadsheets.google.com/feeds", "https://www.googleapis.com/auth/drive"]

## Charger les identifiants (télécharge ton fichier JSON depuis Google Cloud Console)
creds = ServiceAccountCredentials.from_json_keyfile_name("credentials.json", scope)
client = gspread.authorize(creds)

#URL du gsheet 'karama'
spreadsheet_url = "https://docs.google.com/spreadsheets/d/1xy90IapIRhTUjDMRRJjqjihPFjvfK9HbjzWCYDpLmP8/edit#gid=1951714951"
## Récupérer le "data cleaned réponses" Merci Aina ^-^
sheet = client.open_by_url(spreadsheet_url).sheet1

## Récupérer les données sous forme de DataFrame
data = sheet.get_all_records()
df = pd.DataFrame(data)

df.to_csv("data/Karama (réponses) - Réponses _cleaned_.csv", index=False)
print("Données sauvegardées dans data/train.csv avec succès !")
