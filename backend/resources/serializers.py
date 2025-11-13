from rest_framework import serializers
from .models import Subject, ResourceFile, DownloadHistory
from auth_api.serializers import ProfileSerializer  # Profile data dikhane ke liye

class SubjectSerializer(serializers.ModelSerializer):
    """
    Serializer for listing subjects. (Aapke filter dropdown ke liye)
    """
    class Meta:
        model = Subject
        fields = ('id', 'name', 'semester')

class ResourceFileSerializer(serializers.ModelSerializer):
    """
    Serializer for listing and creating/uploading ResourceFiles.
    """
    # 'subject' field (jo ek ID hai) ko read-only data mein 
    # poore Subject object se replace karega
    subject = SubjectSerializer(read_only=True)
    
    # 'uploaded_by' field ko user ke naam se replace karega
    # Humne 'ProfileSerializer' mein 'email', 'first_name' etc. define kiya tha
    # Lekin yahan humein sirf naam chahiye, toh ek alag chhota serializer banate hain
    
    # Uploader ka naam dikhane ke liye
    uploaded_by = serializers.SerializerMethodField()
    
    # File upload ke liye (yeh sirf CREATE/POST ke time use hoga)
    # 'write_only=True' matlab yeh list karte time nahi dikhega
    subject_id = serializers.IntegerField(write_only=True)

    class Meta:
        model = ResourceFile
        fields = (
            'id', 
            'title', 
            'subject', # Read-only nested object
            'subject_id', # Write-only ID
            'resource_type', 
            'pdf_file', 
            'uploaded_at',
            'uploaded_by', # Read-only method field
        )
        read_only_fields = ('pdf_file', 'uploaded_at', 'uploaded_by')

    def get_uploaded_by(self, obj):
        # 'obj' yahan ResourceFile hai
        if obj.uploaded_by:
            return f"{obj.uploaded_by.first_name} {obj.uploaded_by.last_name}"
        return "Admin"

    def create(self, validated_data):
        # 'subject_id' ko 'subject' object mein badalna
        subject_id = validated_data.pop('subject_id')
        subject = Subject.objects.get(id=subject_id)
        
        # 'uploaded_by' ko request se lena (yeh View se aayega)
        user = self.context['request'].user
        
        resource = ResourceFile.objects.create(
            subject=subject,
            uploaded_by=user, 
            **validated_data
        )
        return resource

class DownloadHistorySerializer(serializers.ModelSerializer):
    """
    Serializer for listing user's download history.
    """
    # Hum history mein poori resource ki detail dikhana chahte hain
    resource = ResourceFileSerializer(read_only=True)
    
    class Meta:
        model = DownloadHistory
        fields = ('id', 'resource', 'downloaded_at')