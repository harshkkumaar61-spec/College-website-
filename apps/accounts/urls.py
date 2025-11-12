from django.urls import path
from .views import (
    RegisterView, 
    MyTokenObtainPairView, 
    UserProfileView,
    UserProfileUpdateView,
    ContactFormView,
    VerifyEmailView # <-- Naya view import karein
)

urlpatterns = [
    path('register/', RegisterView.as_view(), name='register'),
    path('login/', MyTokenObtainPairView.as_view(), name='token_obtain_pair'),
    path('profile/', UserProfileView.as_view(), name='user_profile'), 
    path('profile/update/', UserProfileUpdateView.as_view(), name='user_profile_update'),
    path('contact/', ContactFormView.as_view(), name='contact_form'),
    path('verify/', VerifyEmailView.as_view(), name='email_verify'), # <-- YEH NAYI LINE ADD KARO
]