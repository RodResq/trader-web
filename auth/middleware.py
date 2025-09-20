from django.utils.deprecation import MiddlewareMixin

from rest_framework_simplejwt.tokens import UntypedToken
from rest_framework_simplejwt.exceptions import InvalidToken, TokenError

import logging

logger = logging.getLogger(__name__)

class JWTSessionMiddleware(MiddlewareMixin):
    
    def process_request(self, request):
        skip_path = [
            'api/token',
            'api/token/refresh/',
            '/admin/',
            '/api-auth/',
            '/static/',
            '/media/'
        ]
        
        if any(request.path.startswith(path) for path in skip_path):
            return None
        
        jwt_data = request.session.get('jwt_data')
        if jwt_data:
            try:
                access_token = jwt_data.get('access_token')
                if access_token:
                    try:
                        UntypedToken(access_token)
                        
                        user_data = jwt_data.get('user', {})
                        request.jwt_user_id = user_data.get('id')
                        request.jwt_username = user_data.get('username')
                        request.jwt_groups = jwt_data.get('groups', [])
                        request.jwt_permissions = jwt_data.get('permissions', [])
                        request.is_jwt_authenticated = True
                        
                        logger.info(f'Token valido para o usuario: {request.jwt_username}')
                    except (InvalidToken, TokenError) as e:
                        logger.warning(f'Token invalido removido da sessao: {str(e)}')
                        self._clear_session_jwt(request)
            except Exception as e:
                logger.error(f'Erro ao processar token da sessao: {str(e)}')
                self._clear_session_jwt(request)
        else:
            request.is_jwt_authenticated = False
        
        return None
    
    
    def process_response(self, request, response):
        xrequest_with = request.headers.get('X-Resquest_With')
        
        if xrequest_with == 'XMLHttpRequest':
            if hasattr(request, 'is_jwt_authenticated') and request.is_jwt_authenticated:
                response['X-JWT-Authenticsted'] = 'true'
                response['X-JWT-Username'] = getattr(request, 'jwt_username', '')
            else:
                response['X-JWT-Authenticated'] = 'false'
                
        return response
    
    
    def _clear_session_jwt(self, request):
        if 'jwt_data' in request.session:
            del request.session['jwt_date']
            
        request.is_jwt_authenticated = False