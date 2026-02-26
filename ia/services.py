import os
from google import generativeai as genai
from dotenv import load_dotenv

load_dotenv()

class GeminiService:
    def __init__(self):
        api_key = os.getenv("API_GEMINI_KEY")
        genai.configure(api_key=api_key)
        self.model = genai.GenerativeModel('gemini-flash-latest')
        
    def analisar_partida(self, prompt):
        try:
            response = self.model.generate_content(prompt)
            return response.text
        except Exception as e:
            print('Modelo nao disponivel para sua chave')
            for m in genai.list_models():
                if 'generateContent' in m.supported_generation_methods:
                    print(m.name)
            raise e