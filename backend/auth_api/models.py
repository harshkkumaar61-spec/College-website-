from django.db import models
from django.contrib.auth.models import AbstractUser

class CustomUser(AbstractUser):
    # AbstractUser humein username, email, password, first_name, last_name
    # pehle se deta hai. Hum bas extra fields add karenge.
    
    # --- YEH NAYI LINE ADD KARO ---
    # Hum email field ko override kar rahe hain taaki usse unique=True bana sakein
    email = models.EmailField(unique=True) 
    # ---------------------------------

    ROLE_CHOICES = (
        ('student', 'Student'),
        ('teacher', 'Teacher'),
    )
    
    profile_pic = models.ImageField(upload_to='profile_pics/', null=True, blank=True)
    role = models.CharField(max_length=20, choices=ROLE_CHOICES, default='student')
    college = models.CharField(max_length=200, null=True, blank=True)

    EMAIL_FIELD = 'email'
    USERNAME_FIELD = 'email'
    
    # Ab humein 'username' ki zaroorat nahi hai, 
    # kyunki email hi humara username hai.
    # Lekin AbstractUser ko 'username' field chahiye hota hai, 
    # toh hum 'REQUIRED_FIELDS' ko empty kar sakte hain agar 'username' null=True, blank=True set karein.
    
    # Simplest Fix: username ko required fields se hata do
    REQUIRED_FIELDS = [] # Pehle yahan ['username'] tha

    def __str__(self):
        return self.email