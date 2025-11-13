from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import ResourceViewSet, SubjectViewSet

# Django REST Framework ka router automatically saare URLs (list, create, detail, etc.)
# humare ViewSet ke liye bana dega.
router = DefaultRouter()
router.register(r'subjects', SubjectViewSet, basename='subject')
router.register(r'files', ResourceViewSet, basename='resource') # /api/resources/files/

urlpatterns = [
    path('', include(router.urls)),
]