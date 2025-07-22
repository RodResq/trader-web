from django.http import JsonResponse, HttpResponse
import requests

def recuperar_icone_team(id_team):
    api = f'http://img.sofascore.com/api/v1/team/{id_team}/image'
    try:
        response = requests.get(api, timeout=5)
        if response.status_code == 200:
            return HttpResponse(
                response.content,
                content_type='image/png'
            )
        else:
            return HttpResponse('Imagem não encontrada', status=404)
            
    except requests.exceptions.RequestException as e:
        return HttpResponse('Erro ao buscar imagem', status=500)
    
    