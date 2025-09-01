from rest_framework_simplejwt.views import TokenObtainPairView
from auth.serializers import CustomTokenObtainPairSerializer

class CustomTokenObteinPairView(TokenObtainPairView):
    serializer_class = CustomTokenObtainPairSerializer
