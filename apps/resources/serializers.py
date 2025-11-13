from rest_framework import serializers
from .models import Resource, Subject
# from apps.accounts.serializers import UserProfileSerializer # <-- ISKO HATA DIYA HAI

class SubjectSerializer(serializers.ModelSerializer):
    class Meta:
        model = Subject
        fields = ['id', 'name', 'branch', 'semester']


class ResourceSerializer(serializers.ModelSerializer):
    # --- YEH LINE BADAL DI GAYI HAI ---
    # Humne poora profile dikhane ki jagah, sirf user ka naam/email (jo __str__ method se aata hai)
    # dikhane ka faisla kiya hai, taaki import error fix ho jaaye.
    uploaded_by = serializers.StringRelatedField(read_only=True)
    
    # Hum 'subject' ki ID ki jagah poori subject details dikhana chahte hain
    subject = SubjectSerializer(read_only=True)
    
    # File ka naam dikhane ke liye
    filename = serializers.CharField(source='filename', read_only=True)

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