from rest_framework_simplejwt.views import TokenObtainPairView
from auth.serializers import CustomTokenObtainPairSerializer


import logging

logger = logging.getLogger(__name__)


class CustomTokenObteinPairView(TokenObtainPairView):
    serializer_class = CustomTokenObtainPairSerializer
    
    def post(self, request, *args, **kwargs):
        response = super().post(request, *args, **kwargs)
        
        if response.status_code == 200:
            jwt_data = response.data
            
            session_data = {
                'access_token': jwt_data.get('acess'),
                'refresh_token': jwt_data.get('refresh'),
                'user': jwt_data.get('user', {}),
                'groups': jwt_data.get('groups', []),
                'permissions': jwt_data.get('permissions', []),
                'login_time': jwt_data.get('login_time'),
                'expires_in': jwt_data.get('expires_in'),
                'message': jwt_data.get('message', '')
            }
            
            request.session['jwt_data'] = session_data
            request.session.modified = True
            
            logger.info(f'Token JWT salvo na sessao para o usuario: {session_data['user'].get('username')}')
            response.data['session_data'] = True
            response.data['session_key'] = request.session.session_key

        return response