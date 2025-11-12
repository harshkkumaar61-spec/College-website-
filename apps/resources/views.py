from rest_framework import viewsets, permissions, status
from rest_framework.response import Response
# --- Naye imports ---
from rest_framework.decorators import action
from .models import Resource, Subject, DownloadHistory # Naya model
from .serializers import (
    ResourceSerializer, 
    SubjectSerializer, 
    ResourceCreateSerializer, 
    DownloadHistorySerializer # Naya serializer
)
from django.db.models import Q

class SubjectViewSet(viewsets.ReadOnlyModelViewSet):
    """
    Sabhi Subjects ko list karne ke liye API.
    """
    queryset = Subject.objects.all()
    serializer_class = SubjectSerializer
    permission_classes = [permissions.AllowAny]


class ResourceViewSet(viewsets.ModelViewSet):
    """
    Sabhi Resources ko list karne aur naye upload karne ke liye API.
    """
    serializer_class = ResourceSerializer
    
    def get_queryset(self):
        """
        Yeh function ab 'type', 'subject', 'semester', aur 'search' ko handle karega.
        """
        queryset = Resource.objects.filter(is_approved=True)
        
        # Filters
        subject_id = self.request.query_params.get('subject')
        if subject_id:
            queryset = queryset.filter(subject__id=subject_id)
            
        resource_type = self.request.query_params.get('type')
        if resource_type:
            queryset = queryset.filter(resource_type=resource_type)
            
        semester = self.request.query_params.get('semester')
        if semester:
            queryset = queryset.filter(subject__semester=semester)

        # Search
        search_query = self.request.query_params.get('search')
        if search_query:
            queryset = queryset.filter(
                Q(title__icontains=search_query) | 
                Q(subject__name__icontains=search_query)
            )
            
        return queryset.order_by('-uploaded_at')

    def get_serializer_class(self):
        if self.action == 'create':
            return ResourceCreateSerializer
        return ResourceSerializer 

    def get_permissions(self):
        # --- Permission ko update karo taaki 'download' action bhi authenticated ho ---
        if self.action in ['list', 'retrieve']:
            permission_classes = [permissions.AllowAny]
        else:
            # create, update, delete, aur naya 'download' action
            permission_classes = [permissions.IsAuthenticated]
        return [permission() for permission in permission_classes]

    def perform_create(self, serializer):
        serializer.save(uploaded_by=self.request.user, is_approved=False) 

    # --- YEH NAYA FUNCTION ADD KARO (Download log karne ke liye) ---
    @action(detail=True, methods=['POST'])
    def download(self, request, pk=None):
        """
        Ek resource ko download karne ke liye log entry banata hai.
        'pk' (Primary Key) resource ki ID hai.
        """
        try:
            resource = self.get_object()
        except Resource.DoesNotExist:
            return Response({"error": "Resource not found."}, status=status.HTTP_404_NOT_FOUND)
            
        # Naya history record banao
        DownloadHistory.objects.create(user=request.user, resource=resource)
        
        return Response(
            {"message": "Download logged successfully."}, 
            status=status.HTTP_200_OK
        )
    # --- YAHAN TAK ---


# --- YEH NAYI VIEW CLASS ADD KARO (History dikhane ke liye) ---
class DownloadHistoryViewSet(viewsets.ReadOnlyModelViewSet):
    """
    Current user ki download history dikhane ke liye API.
    """
    serializer_class = DownloadHistorySerializer
    permission_classes = [permissions.IsAuthenticated] # Sirf logged-in user hi dekh sakta hai

    def get_queryset(self):
        # Sirf current user (request.user) ki history fetch karo
        return DownloadHistory.objects.filter(user=self.request.user)
# --- YAHAN TAK ---