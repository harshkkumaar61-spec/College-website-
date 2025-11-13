from django.shortcuts import render
from rest_framework import viewsets, permissions, status
from rest_framework.decorators import action
from rest_framework.response import Response
from .models import Subject, ResourceFile, DownloadHistory
from .serializers import (
    SubjectSerializer, 
    ResourceFileSerializer, 
    DownloadHistorySerializer
)

class SubjectViewSet(viewsets.ReadOnlyModelViewSet):
    """
    API endpoint for listing subjects. (GET request only)
    /api/resources/subjects/
    """
    queryset = Subject.objects.all().order_by('name')
    serializer_class = SubjectSerializer
    permission_classes = [permissions.AllowAny] # Subjects koi bhi dekh sakta hai

class ResourceFileViewSet(viewsets.ModelViewSet):
    """
    API endpoint for listing and uploading files.
    /api/resources/files/
    """
    serializer_class = ResourceFileSerializer
    
    # Sirf logged-in user hi upload kar sakta hai, par list koi bhi dekh sakta hai
    permission_classes = [permissions.IsAuthenticatedOrReadOnly]

    def get_queryset(self):
        """
        Yeh function list ko filter karega (aapke main.js ke hisaab se)
        Sirf approved files hi dikhayega
        """
        queryset = ResourceFile.objects.filter(is_approved=True).order_by('-uploaded_at')
        
        # --- Filters (jo main.js bhej raha hai) ---
        
        # ?search=...
        search = self.request.query_params.get('search')
        if search:
            queryset = queryset.filter(title__icontains=search)
            
        # ?subject=... (yeh subject ki ID hogi)
        subject = self.request.query_params.get('subject')
        if subject:
            queryset = queryset.filter(subject__id=subject)
            
        # ?type=...
        res_type = self.request.query_params.get('type')
        if res_type:
            queryset = queryset.filter(resource_type=res_type)
            
        # ?semester=...
        semester = self.request.query_params.get('semester')
        if semester:
            queryset = queryset.filter(subject__semester=semester)
            
        return queryset

    def perform_create(self, serializer):
        """
        Jab nayi file upload ho, toh 'uploaded_by' field set karo
        """
        serializer.save(uploaded_by=self.request.user)

    def get_serializer_context(self):
        """
        Serializer ko 'request' object pass karta hai (taaki hum user nikal sakein)
        """
        return {'request': self.request}

    @action(detail=True, methods=['post'], permission_classes=[permissions.IsAuthenticated])
    def download(self, request, pk=None):
        """
        Custom action for logging a download.
        /api/resources/files/<id>/download/
        """
        resource = self.get_object()
        
        # History create karo
        DownloadHistory.objects.get_or_create(user=request.user, resource=resource)
        
        return Response(
            {'status': 'download logged'}, 
            status=status.HTTP_200_OK
        )

class DownloadHistoryViewSet(viewsets.ReadOnlyModelViewSet):
    """
    API endpoint for listing user's download history.
    /api/resources/history/
    """
    serializer_class = DownloadHistorySerializer
    permission_classes = [permissions.IsAuthenticated] # Sirf logged-in user

    def get_queryset(self):
        """
        Sirf current user ki history dikhao
        """
        return DownloadHistory.objects.filter(user=self.request.user)