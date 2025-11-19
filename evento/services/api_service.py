import requests

API_BASE = "http://127.0.0.1:8080"

class ApiService:
    
    @staticmethod
    def get_lineups(id_event):
        response = requests.get(f'{API_BASE}/event/{id_event}/lineups', timeout=5)
        response.raise_for_status()
        
        return response.json()