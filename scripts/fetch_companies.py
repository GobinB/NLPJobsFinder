import requests
from bs4 import BeautifulSoup
import json
import os
import time
from datetime import datetime

def fetch_companies():
    url = 'https://github.com/poteto/hiring-without-whiteboards'
    response = requests.get(url)
    soup = BeautifulSoup(response.text, 'html.parser')
    
    companies = []
    for li in soup.find_all('li'):
        company_info = li.text.strip().split('|')
        if len(company_info) >= 2:
            company = {
                'name': company_info[0].strip(),
                'location': company_info[1].strip(),
                'description': ' | '.join(company_info[2:]).strip() if len(company_info) > 2 else ''
            }
            companies.append(company)
    
    return companies

def save_companies(companies):
    script_dir = os.path.dirname(os.path.abspath(__file__))
    data_dir = os.path.join(script_dir, '..', 'backend', 'data')
    file_path = os.path.join(data_dir, 'companies.json')
    
    with open(file_path, 'w') as f:
        json.dump(companies, f, indent=2)
    
    print(f"Companies saved to {file_path}")

if __name__ == "__main__":
    companies = fetch_companies()
    save_companies(companies)

