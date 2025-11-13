from django.urls import path
from .views import (
    RegisterView, 
    MyTokenObtainPairView, 
    UserProfileView,
    UserProfileUpdateView,
    VerifyEmailView, # <-- NAYA IMPORT
    ContactFormView    # <-- NAYA IMPORT
)

urlpatterns = [
    path('register/', RegisterView.as_view(), name='register'),
    path('login/', MyTokenObtainPairView.as_view(), name='token_obtain_pair'),
    path('profile/', UserProfileView.as_view(), name='user_profile'), 
    path('profile/update/', UserProfileUpdateView.as_view(), name='user_profile_update'),
    path('verify-email/', VerifyEmailView.as_view(), name='verify_email'), # <-- NAYI LINE
    path('contact/', ContactFormView.as_view(), name='contact'), # <-- NAYI LINE
]