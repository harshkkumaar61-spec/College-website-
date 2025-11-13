# auth_api/urls.py
from django.urls import path
from .views import (
    RegisterView, 
    VerifyEmailView, 
    CustomTokenLoginView,
    ProfileView,
    ContactFormView  # <-- YEH IMPORT KARO
)

from rest_framework_simplejwt.views import TokenRefreshView

urlpatterns = [
    path('register/', RegisterView.as_view(), name='register'),
    path('verify/', VerifyEmailView.as_view(), name='email-verify'),
    path('login/', CustomTokenLoginView.as_view(), name='token_obtain_pair'),
    path('token/refresh/', TokenRefreshView.as_view(), name='token_refresh'),
    
    # --- YEH NAYI LINES HAIN ---
    
    # /api/auth/profile/ (GET request ke liye)
    path('profile/', ProfileView.as_view(), name='user-profile'),
    
    # /api/auth/profile/update/ (PATCH request ke liye)
    # Humara main.js 'profile/update/' call kar raha hai
    path('profile/update/', ProfileView.as_view(), name='user-profile-update'),
    path('contact/', ContactFormView.as_view(), name='contact-form'),
]