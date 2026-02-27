from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from rest_framework.authentication import TokenAuthentication, BaseAuthentication
from .services import GeminiService
from analytics.models import Entrada

import json
from datetime import datetime, timedelta    

class AnalisePartidaAPIView(APIView):
    
    authentication_classes = []
    permission_classes = []
    
    def post(self, request):
        id_event = request.data.get("id_event")
        team_home = request.data.get("team_home")
        team_away = request.data.get("team_away")
        tournament_name = request.data.get("tournament_name")
        
        tournament_formated = str(tournament_name).lower().replace(" ", "-")
        tomorow = (datetime.now() + timedelta(days=1)).strftime("%d-%m-%Y")
        
        urls_especializadas = [
            f"https://aposta10.com/futebol/{team_home}-{team_away}-{tomorow}-{tournament_formated}/palpite "
        ]
        
        print(f"Url Pesquisada: {urls_especializadas}")
        
        prompt = f"""
            Você é um analista esportivo profissional e especialista em apostas.
            
            TAREFA:
            Pesquise e analise o confronto entre {team_home} x {team_away} no campeonato {tournament_name}.
            Se possível, utilize informações desta fonte: {urls_especializadas}.
            
            REQUISITOS DA ANÁLISE:
            1. Analise o sentimento dos especialistas (otimistas ou pessimistas com o {team_home}).
            2. Calcule a probabilidade de vitória ajustada para cada resultado (Home, Empate, Away).
            3. Resuma as 3 principais justificativas táticas ou estatísticas.

            FORMATO DE RESPOSTA:
            Retorne EXCLUSIVAMENTE um objeto JSON válido. Não inclua explicações fora do JSON.
            Estrutura esperada:
            {{
                "partida": "{team_home} x {team_away}",
                "data_hora": "data evento",
                "sentimento_analistas": "string",
                "probabilidades_vitoria": {{
                    "{team_home.lower()}": 0,
                    "empate": 0,
                    "{team_away.lower()}": 0
                }},
                "analise_especialistas": {{
                    "sentimento_geral": "analise 1",
                    "consenso_mercado": "analise 2",
                    "principais_fontes": ["fonte 1", "fonte 2", "fonte 3"]
                }},
                "justificativas": [
                    "ponto 1",
                    "ponto 2",
                    "ponto 3"
                ],
                "placar_estimado": "placar"
            }}
        """
        
        if not prompt:
            return Response({"error": "Prompt e obrigatorio"}, status=status.HTTP_400_BAD_REQUEST)

        try:
            service = GeminiService()
            response_ia = service.analisar_partida(prompt)
            limpa_resposta = response_ia.replace("```json", "").replace("```", "").strip()

            dados_json = json.loads(limpa_resposta)
            
            entrada = Entrada.objects.get(id_event=id_event)
            entrada.ia_home = dados_json['probabilidades_vitoria'][team_home.lower()]
            entrada.ia_draw = dados_json['probabilidades_vitoria']['empate']
            entrada.ia_away = dados_json['probabilidades_vitoria'][team_away.lower()]
            entrada.save()
            
            return Response(dados_json, status=status.HTTP_200_OK)
        except json.JSONDecodeError as e:
            return Response({
                "error": str(e),
                "raw_response": response_ia
                }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
        except Exception as e:
            return Response({'error': str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)