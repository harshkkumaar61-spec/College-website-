from django.contrib import admin
from django.urls import path, include # 'include' yahaan import hona chahiye
from django.conf import settings
from django.conf.urls.static import static

urlpatterns = [
    path('admin/', admin.site.urls),
    
    # Humare API URLs
    path('api/auth/', include('accounts.urls')),
    path('api/resources/', include('resources.urls')), # <-- YEH NAYI LINE ADD KARO
]

# Development mein media files serve karne ke liye
if settings.DEBUG:
    urlpatterns += static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)