from django.urls import path
from .views import (
    RegisterView, 
    MyTokenObtainPairView, 
    UserProfileView,
    UserProfileUpdateView,
    VerifyEmailView, # <-- 1. YEH IMPORT KARO
    ContactFormView   # <-- ContactFormView bhi import kar lo (shayad missing tha)
)

urlpatterns = [
    path('register/', RegisterView.as_view(), name='register'),
    path('login/', MyTokenObtainPairView.as_view(), name='token_obtain_pair'),
    path('profile/', UserProfileView.as_view(), name='user_profile'), 
    path('profile/update/', UserProfileUpdateView.as_view(), name='user_profile_update'),
    path('verify-email/', VerifyEmailView.as_view(), name='verify_email'), # <-- 2. YEH NAYI LINE ADD KARO
    path('contact/', ContactFormView.as_view(), name='contact'), # <-- 3. YEH BHI ADD KAR LO
]