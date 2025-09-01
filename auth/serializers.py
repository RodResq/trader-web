from rest_framework_simplejwt.serializers import TokenObtainPairSerializer
from rest_framework_simplejwt.tokens import RefreshToken
from django.contrib.auth import get_user_model
from django.utils import timezone
from django.conf import settings

User = get_user_model()

class CustomTokenObtainPairSerializer(TokenObtainPairSerializer):
    
    @classmethod
    def get_token(cls, user):
        token = super().get_token(user)
        
        token['username'] = user.username
        token['email'] = user.email
        token['first_name'] = user.first_name
        token['last_name'] = user.last_name
        token['is_staff'] = user.is_staff
        token['is_superuser'] = user.is_superuser
        
        token['user_type'] = 'admin' if user.is_staff else 'regular'
        token['groups'] = list(user.groups.values_list('name', flat=True))
        
        return token
    
    def validate(self, attrs):
        data = super().validate(attrs)
        user = self.user
        
        data.update({
            'user': {
                'id': user.id,
                'username': user.username,
                'email': user.email,
                'first_name': user.first_name,
                'last_name': user.last_name,
                'is_staff': user.is_staff,
                'date_joined': user.date_joined.isoformat(),
                'last_login': user.last_login.isoformat() if user.last_login else None,
            },
            'permissions': list(user.get_all_permissions()),
            'groups': list(user.groups.values_list('name', flat=True)),
            'message': f'Bem-vindo, {user.first_name or user.username}!',
            'login_time': timezone.now().isoformat(),
            'expires_in': settings.SIMPLE_JWT.get('ACCESS_TOKEN_LIFETIME').total_seconds(),
        })
        
        return data