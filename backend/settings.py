"""
Django settings for backend project.
"""
import sys
from pathlib import Path
from datetime import timedelta

# BASE_DIR ko aapke structure ke hisaab se set kiya hai
BASE_DIR = Path(__file__).resolve().parent.parent 

# 'apps' folder ko Python ke search path mein add kar rahe hain
sys.path.append(str(BASE_DIR / 'apps'))


SECRET_KEY = 'django-insecure-gnji_y%1(dlb)&(6i=)&n%j*^0^m3#_vtv2h_nraf6n$u^g6yc'
DEBUG = True

# --- YAHAN APNA NGROK URL CHECK KARO ---
ALLOWED_HOSTS = [
    'localhost',
    '127.0.0.1',
    '.ngrok-free.app', # Generic
    'ungregariously-unbangled-braxton.ngrok-free.dev' # <-- YEH AAPKA NGROK URL HAI
]


# Application definition
INSTALLED_APPS = [
    'django.contrib.admin',
    'django.contrib.auth',
    'django.contrib.contenttypes',
    'django.contrib.sessions',
    'django.contrib.messages',
    'django.contrib.staticfiles',
    'rest_framework',
    'rest_framework_simplejwt',
    'corsheaders',
    'accounts', 
    'resources',
]

MIDDLEWARE = [
    'django.middleware.security.SecurityMiddleware',
    'django.contrib.sessions.middleware.SessionMiddleware',
    'corsheaders.middleware.CorsMiddleware',  # Yeh CommonMiddleware se upar hona chahiye
    'django.middleware.common.CommonMiddleware', 
    'django.middleware.csrf.CsrfViewMiddleware',
    'django.contrib.auth.middleware.AuthenticationMiddleware',
    'django.contrib.messages.middleware.MessageMiddleware',
    'django.middleware.clickjacking.XFrameOptionsMiddleware',
]

ROOT_URLCONF = 'backend.urls'

TEMPLATES = [
    {
        'BACKEND': 'django.template.backends.django.DjangoTemplates',
        'DIRS': [], # Khaali rahega
        'APP_DIRS': True,
        'OPTIONS': {
            'context_processors': [
                'django.template.context_processors.request',
                'django.contrib.auth.context_processors.auth',
                'django.contrib.messages.context_processors.messages',
            ],
        },
    },
]

WSGI_APPLICATION = 'backend.wsgi.application'


# Database
DATABASES = {
    'default': {
        'ENGINE': 'django.db.backends.mysql',
        'NAME': 'college_hub_db',        
        'USER': 'root',                  
        'PASSWORD': 'secret@code', # YEH PASSWORD SAHI HONA CHAHIYE
        'HOST': 'localhost',             
        'PORT': '3306',                  
    }
}


# Password validation
AUTH_PASSWORD_VALIDATORS = [
    {'NAME': 'django.contrib.auth.password_validation.UserAttributeSimilarityValidator',},
    {'NAME': 'django.contrib.auth.password_validation.MinimumLengthValidator',},
    {'NAME': 'django.contrib.auth.password_validation.CommonPasswordValidator',},
    {'NAME': 'django.contrib.auth.password_validation.NumericPasswordValidator',},
]

LANGUAGE_CODE = 'en-us'
TIME_ZONE = 'UTC'
USE_I18N = True
USE_TZ = True

STATIC_URL = 'static/'
DEFAULT_AUTO_FIELD = 'django.db.models.BigAutoField'

# --- Custom User Model ---
AUTH_USER_MODEL = 'accounts.CustomUser'

# --- YEH SECTION FIX KIYA GAYA HAI ---
CORS_ALLOWED_ORIGINS = [
    "https://ai-study-hub-delta.vercel.app", # <-- AAPKA VERCEL URL
    "http://localhost:5500",
    "http://127.0.0.1:5500",
    "null",
]
CSRF_TRUSTED_ORIGINS = [
    "https://ungregariously-unbangled-braxton.ngrok-free.dev", # <-- AAPKA NGROK URL
    "https://*.ngrok-free.app"
]
# --- YAHAN TAK ---


# --- REST Framework aur Simple JWT ki settings ---
REST_FRAMEWORK = {
    'DEFAULT_AUTHENTICATION_CLASSES': (
        'rest_framework_simplejwt.authentication.JWTAuthentication',
    ),
}

SIMPLE_JWT = {
    'ACCESS_TOKEN_LIFETIME': timedelta(minutes=60),
    'REFRESH_TOKEN_LIFETIME': timedelta(days=1),
}

# --- Media Files (Uploaded Images) Settings ---
MEDIA_URL = '/media/'
# FINAL FIX: MEDIA_ROOT ko root-level 'media' folder mein point kiya
MEDIA_ROOT = BASE_DIR / 'media'

# Email settings
EMAIL_BACKEND = 'django.core.mail.backends.smtp.EmailBackend'
EMAIL_HOST = 'smtp.gmail.com'
EMAIL_PORT = 587
EMAIL_USE_TLS = True
EMAIL_HOST_USER = 'hk015609@gmail.com' # <-- YAHAN APNA GMAIL EMAIL DAALO
EMAIL_HOST_PASSWORD = 'wgdy tejb ovdz nwix' # <-- YAHAN APNA 16-DIGIT APP PASSWORD DAALO
DEFAULT_FROM_EMAIL = EMAIL_HOST_USER