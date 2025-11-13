from django.urls import path
from .views import (
    RegisterView, 
    MyTokenObtainPairView, 
    UserProfileView,
    UserProfileUpdateView # <-- Naya view import karein
)

urlpatterns = [
    path('register/', RegisterView.as_view(), name='register'),
    path('login/', MyTokenObtainPairView.as_view(), name='token_obtain_pair'),
    path('profile/', UserProfileView.as_view(), name='user_profile'), 
    path('profile/update/', UserProfileUpdateView.as_view(), name='user_profile_update'), # <-- YEH NAYI LINE ADD KARO
]