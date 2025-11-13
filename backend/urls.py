"""
URL configuration for backend project.
"""
from django.contrib import admin
from django.urls import path, include
from django.conf import settings
from django.conf.urls.static import static

urlpatterns = [
    path('admin/', admin.site.urls),
    
    # Humare API URLs
    path('api/auth/', include('accounts.urls')),
    path('api/resources/', include('resources.urls')), # <-- YEH LINE ADD KI GAYI HAI
]

# Development mein media (profile pics, pdfs) files serve karne ke liye
if settings.DEBUG:
    urlpatterns += static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)