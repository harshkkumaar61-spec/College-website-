from django.db import models
from auth_api.models import CustomUser
# Create your models here.
class Subject(models.Model):
    name = models.CharField(max_length=100, unique=True)
    semester = models.IntegerField(null=True, blank=True, help_text="e.g., 1, 2, 3...")

    def __str__(self):
        if self.semester:
            return f"{self.name} - Sem {self.semester}"
        return self.name

class ResourceFile(models.Model):
    RESOURCE_TYPES = [
        ('notes', 'Notes'),
        ('question_paper', 'Question Paper'),
        ('syllabus', 'Syllabus'),
    ]

    uploaded_by = models.ForeignKey(CustomUser, on_delete=models.SET_NULL, null=True, related_name='uploaded_files')
    title = models.CharField(max_length=200)
    subject = models.ForeignKey(Subject, on_delete=models.CASCADE, related_name='resources')
    resource_type = models.CharField(max_length=20, choices=RESOURCE_TYPES)
    
    # !! IMPORTANT !!
    # File upload ke liye 'django-storages' aur 'boto3' install karna padega
    # Abhi hum FileField use kar rahe hain, Render par deploy karte time isse S3Boto3Storage se badal denge
    pdf_file = models.FileField(upload_to='resource_files/')
    
    uploaded_at = models.DateTimeField(auto_now_add=True)
    
    # Admin approval ke liye
    is_approved = models.BooleanField(default=False) 

    def __str__(self):
        return self.title

class DownloadHistory(models.Model):
    user = models.ForeignKey(CustomUser, on_delete=models.CASCADE, related_name='download_history')
    resource = models.ForeignKey(ResourceFile, on_delete=models.CASCADE, related_name='downloads')
    downloaded_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        # Ek user ek resource ko history mein ek hi baar add kare (latest download time ke saath)
        # Isse behtar hai ki hum unique check na karein, taaki har download count ho.
        # Agar aap sirf unique downloads track karna chahte hain toh neeche wali line uncomment karein
        # unique_together = ('user', 'resource') 
        ordering = ['-downloaded_at'] # History hamesha nayi upar dikhaye

    def __str__(self):
        return f"{self.user.email} downloaded {self.resource.title}"