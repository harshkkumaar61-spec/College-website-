from rest_framework import viewsets, permissions, status
from rest_framework.response import Response
from .models import Resource, Subject
from .serializers import ResourceSerializer, SubjectSerializer

class SubjectViewSet(viewsets.ReadOnlyModelViewSet):
    """
    Sabhi Subjects ko list karne ke liye API.
    (ReadOnly = Sirf dekh sakte hain, frontend se add/delete nahi kar sakte)
    """
    queryset = Subject.objects.all()
    serializer_class = SubjectSerializer
    permission_classes = [permissions.AllowAny] # Koi bhi subjects dekh sakta hai


class ResourceViewSet(viewsets.ModelViewSet):
    """
    Sabhi Resources ko list karne aur naye upload karne ke liye API.
    """
    queryset = Resource.objects.filter(is_approved=True) # Sirf approved resources dikhao
    serializer_class = ResourceSerializer
    
    # Permissions set kar rahe hain
    def get_permissions(self):
        if self.action == 'list' or self.action == 'retrieve':
            # 'list' (saare dekhna) ya 'retrieve' (ek dekhna) koi bhi kar sakta hai
            permission_classes = [permissions.AllowAny]
        else:
            # 'create' (upload), 'update', 'delete' sirf logged-in user hi kar sakta hai
            permission_classes = [permissions.IsAuthenticated]
        return [permission() for permission in permission_classes]

    def perform_create(self, serializer):
        # Jab koi naya resource 'create' (upload) kare,
        # toh 'uploaded_by' field mein current user ko automatically save kar do.
        # Hum 'is_approved=False' bhi set kar sakte hain, taaki admin pehle check kare.
        serializer.save(uploaded_by=self.request.user, is_approved=True) # Abhi ke liye auto-approve