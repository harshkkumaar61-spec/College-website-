from rest_framework import status, permissions
from rest_framework.response import Response
from rest_framework.views import APIView
from rest_framework_simplejwt.views import TokenObtainPairView
from rest_framework_simplejwt.tokens import RefreshToken

# Serializers ko import kar rahe hain
from .serializers import UserCreateSerializer, MyTokenObtainPairSerializer, UserProfileSerializer # Naya serializer

# --- YEH NAYI VIEW CLASS ADD KI GAYI HAI ---
class UserProfileView(APIView):
    """
    Token ke basis par user ki details fetch karne ke liye (Refresh fix ke liye).
    """
    permission_classes = [permissions.IsAuthenticated] # Sirf logged-in user hi access kar sakta hai

    def get(self, request, *args, **kwargs):
        # 'request.user' mein authenticated user ki details hoti hain
        serializer = UserProfileSerializer(request.user, context={'request': request})
        return Response(serializer.data, status=status.HTTP_200_OK)
# --- YAHAN TAK ---


# --- Yeh humari Register View hai ---
class RegisterView(APIView):
    """
    Naye user ko register karne ke liye API endpoint.
    Yeh sirf register karega, login nahi karwayega.
    """
    permission_classes = [permissions.AllowAny]
    serializer_class = UserCreateSerializer

    def post(self, request, *args, **kwargs):
        serializer = self.serializer_class(data=request.data)
        
        if serializer.is_valid():
            user = serializer.save()
            return Response(
                {"message": "User registered successfully! Please login."}, 
                status=status.HTTP_201_CREATED
            )
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

    def get_serializer_context(self):
        return {'request': self.request}


# --- Yeh humari Login View hai ---
class MyTokenObtainPairView(TokenObtainPairView):
    """
    Default Login view ko override kar rahe hain taaki humara
    custom serializer (MyTokenObtainPairSerializer) use ho.
    """
    serializer_class = MyTokenObtainPairSerializer
    
    def get_serializer_context(self):
        context = super().get_serializer_context()
        context['request'] = self.request
        return context