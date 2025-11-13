"""
URL configuration for project_backend project.

The `urlpatterns` list routes URLs to views. For more information please see:
    https://docs.djangoproject.com/en/5.2/topics/http/urls/
Examples:
Function views
    1. Add an import:  from my_app import views
    2. Add a URL to urlpatterns:  path('', views.home, name='home')
Class-based views
    1. Add an import:  from other_app.views import Home
    2. Add a URL to urlpatterns:  path('', Home.as_view(), name='home')
Including another URLconf
    1. Import the include() function: from django.urls import include, path
    2. Add a URL to urlpatterns:  path('blog/', include('blog.urls'))
"""
from django.contrib import admin
from django.urls import path, include  # <-- 'include' ko import karo
from django.conf import settings
from django.conf.urls.static import static
from rest_framework.routers import DefaultRouter
from resources import views as resource_views # resources/views.py ko import karo
# --- ROUTER SETUP ---
router = DefaultRouter()
router.register(r'subjects', resource_views.SubjectViewSet, basename='subject')
router.register(r'files', resource_views.ResourceFileViewSet, basename='file')
router.register(r'history', resource_views.DownloadHistoryViewSet, basename='history')

urlpatterns = [
    path('admin/', admin.site.urls),
    
    # --- YEH NAYI LINE ADD KARO ---
    # Humare auth_api app ke URLs ko include karo
    # Saare URLs /api/auth/ se shuru honge
    path('api/auth/', include('auth_api.urls')),
    # -------------------------------
    
    # 'resources' app ke URLs hum yahan baad mein add karenge
    # path('api/resources/', include('resources.urls')),
    # --- YEH NAYI LINE ADD KARO ---
    # Humare resources app ke saare URLs (subjects, files, history)
    path('api/resources/', include(router.urls)),
    # ------------------------------
]

# Development mein media files (profile pics) serve karne ke liye
if settings.DEBUG:
    urlpatterns += static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)