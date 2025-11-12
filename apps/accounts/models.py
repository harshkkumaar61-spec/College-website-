from django.db import models
from django.contrib.auth.models import AbstractBaseUser, BaseUserManager, PermissionsMixin, Group, Permission
import uuid # Token ke liye import kiya
from django.conf import settings # Naya import

class CustomUserManager(BaseUserManager):
    """
    Custom user model manager jahan email default username hai.
    """
    def create_user(self, email, password, **extra_fields):
        """
        Normal user banata hai email aur password se.
        """
        if not email:
            raise ValueError('Email address zaroori hai')
        email = self.normalize_email(email)
        user = self.model(email=email, **extra_fields)
        user.set_password(password)
        user.save()
        return user

    def create_superuser(self, email, password, **extra_fields):
        """
        Superuser banata hai email aur password se.
        """
        extra_fields.setdefault('is_staff', True)
        extra_fields.setdefault('is_superuser', True)
        extra_fields.setdefault('is_active', True) # Superuser hamesha active hota hai

        if extra_fields.get('is_staff') is not True:
            raise ValueError('Superuser ke liye is_staff=True hona chahiye.')
        if extra_fields.get('is_superuser') is not True:
            raise ValueError('Superuser ke liye is_superuser=True hona chahiye.')
        return self.create_user(email, password, **extra_fields)


class CustomUser(AbstractBaseUser, PermissionsMixin):
    """
    Humara Custom User Model
    """
    ROLE_CHOICES = (
        ('student', 'Student'),
        ('teacher', 'Teacher'),
        ('admin', 'Admin'),
    )

    email = models.EmailField(unique=True)
    username = models.CharField(max_length=150, unique=True, blank=True, null=True) 
    first_name = models.CharField(max_length=150, blank=True)
    last_name = models.CharField(max_length=150, blank=True)
    role = models.CharField(max_length=20, choices=ROLE_CHOICES, default='student')
    
    profile_pic = models.ImageField(upload_to='profile_pics/', null=True, blank=True)
    is_staff = models.BooleanField(default=False)
    
    is_active = models.BooleanField(default=False)
    date_joined = models.DateTimeField(auto_now_add=True)

    # --- YEH LINE THEEK KAR DI GAYI HAI ---
    # Humne 'unique=True' hata diya hai
    verification_token = models.UUIDField(default=uuid.uuid4, editable=False)
    # --- YAHAN TAK ---

    groups = models.ManyToManyField(
        Group,
        verbose_name=('groups'),
        blank=True,
        help_text=(
            'The groups this user belongs to. A user will get all permissions '
            'granted to each of their groups.'
        ),
        related_name="custom_user_groups",
        related_query_name="user",
    )
    user_permissions = models.ManyToManyField(
        Permission,
        verbose_name=('user permissions'),
        blank=True,
        help_text=('Specific permissions for this user.'),
        related_name="custom_user_permissions",
        related_query_name="user",
    )

    USERNAME_FIELD = 'email'
    REQUIRED_FIELDS = ['first_name', 'last_name'] 

    objects = CustomUserManager()

    def __str__(self):
        return self.email