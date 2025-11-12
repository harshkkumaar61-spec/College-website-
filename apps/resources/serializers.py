from rest_framework import serializers
# --- Naya model import karo ---
from .models import Resource, Subject, DownloadHistory
# UserProfileSerializer waala import humne pehle hi hata diya tha

class SubjectSerializer(serializers.ModelSerializer):
    class Meta:
        model = Subject
        fields = ['id', 'name', 'branch', 'semester']


class ResourceSerializer(serializers.ModelSerializer):
    # Yeh "read-only" serializer hai (data dikhane ke liye)
    uploaded_by = serializers.StringRelatedField(read_only=True)
    subject = SubjectSerializer(read_only=True)
    filename = serializers.CharField(read_only=True)

    class Meta:
        model = Resource
        fields = [
            'id', 
            'title', 
            'subject', 
            'resource_type', 
            'pdf_file', 
            'filename', 
            'uploaded_by', 
            'uploaded_at',
            'is_approved'
        ]


class ResourceCreateSerializer(serializers.ModelSerializer):
    """
    Yeh "write-only" serializer hai (data upload karne ke liye).
    """
    subject = serializers.PrimaryKeyRelatedField(queryset=Subject.objects.all())

    class Meta:
        model = Resource
        fields = ['title', 'subject', 'resource_type', 'pdf_file']

# --- YEH NAYA SERIALIZER ADD KARO (History dikhane ke liye) ---
class DownloadHistorySerializer(serializers.ModelSerializer):
    """
    User ki download history dikhane ke liye.
    """
    # Hum 'resource' ki poori details dikhana chahte hain, ID nahi
    resource = ResourceSerializer(read_only=True)
    
    class Meta:
        model = DownloadHistory
        fields = ['id', 'resource', 'downloaded_at']
# --- YAHAN TAK ---