from django.urls import path, include
from rest_framework.routers import DefaultRouter
# --- Naya view import karo ---
from .views import ResourceViewSet, SubjectViewSet, DownloadHistoryViewSet

router = DefaultRouter()
router.register(r'subjects', SubjectViewSet, basename='subject')
router.register(r'files', ResourceViewSet, basename='resource')
# --- YEH NAYI LINE ADD KARO ---
router.register(r'history', DownloadHistoryViewSet, basename='history')

urlpatterns = [
    path('', include(router.urls)),
]