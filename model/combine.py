import json
import re
import pandas as pd

# # Load the JSON data
# with open("/home/ahmedabdullahi/NLP590/NLPJobsFinder/backend/data/companies.json", "r") as f:
#     companies = json.load(f)
# import json

# Load the dataset from the uploaded file
file_path = '/home/ahmedabdullahi/NLP590/NLPJobsFinder/backend/data/companies.json'
with open(file_path, 'r', encoding='utf-8') as file:
    data = json.load(file)

# Create a new dataset combining location and description
combined_data = []
for entry in data:
    location = entry.get('location', '')
    description = entry.get('description', '')
    combined_entry = f"This location {location} description: {description}"
    combined_data.append(combined_entry)

# Display a sample of the combined dataset
print(combined_data[:5])
