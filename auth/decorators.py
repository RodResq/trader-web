from functools import wraps
from django.http import JsonResponse
from django.shortcuts import redirect
from django.contrib.auth import get_user_model

from rest_framework.response import Response
from rest_framework import status

import logging

logger = logging.getLogger(__name__)
User = get_user_model()

def jwt_required(view_func=None, *, redirect_url=None, json_response=False):
    
    def decorator(view_func):
        @wraps(view_func)
        def wrapper(request, *args, **kwargs):
            is_authenticated = hasattr(request, 'is_jwt_authenticated') and request.is_jwt_authenticated
            
            if not is_authenticated:
                logger.warning(f'Acesso negado para o path {request.path} - usuario nao authenticado')
                
                if json_response or request.headers.get('Content-Type') == 'application/json':
                    return JsonResponse({
                        'success': False,
                        'message': 'Autencitacacao necessaria, Faca login novamente',
                        'code': 'JWT-REQUIRED'
                    }, status=401)
                else:
                    if redirect_url:
                        return redirect(redirect_url)
                    else:
                        return JsonResponse({
                            'success': False,
                            'message': 'Autenticacao necessaria'
                        }, status=401)
            return view_func(request, *args, **kwargs)
        return wrapper    
    
    if view_func is None:
        return decorator
    else:
        return decorator(view_func)
    

def jwt_required_api(view_func):
    return jwt_required(view_func, json_response=True)


