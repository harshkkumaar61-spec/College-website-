"""
URL configuration for backend project.
"""
from django.contrib import admin
from django.urls import path, include
from django.conf import settings
from django.conf.urls.static import static
# TemplateView hata diya gaya hai

urlpatterns = [
    path('admin/', admin.site.urls),
    
    # Humare API URLs
    path('api/auth/', include('accounts.urls')),
    
    # Root (/) waala path hata diya gaya hai
]

# Development mein media files serve karne ke liye
if settings.DEBUG:
    urlpatterns += static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)