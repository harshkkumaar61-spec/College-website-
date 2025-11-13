from django.db import models
# from apps.accounts.models import CustomUser # <-- ISKO HATA DIYA HAI
from django.conf import settings # <-- Naya import, settings se user lene ke liye
import os

class Subject(models.Model):
    name = models.CharField(max_length=100)
    branch = models.CharField(max_length=100, blank=True) # Jaise 'CSE', 'ME'
    semester = models.IntegerField(blank=True, null=True) # Jaise 1, 2, 3

    def __str__(self):
        return f"{self.name} (Sem {self.semester})"

class Resource(models.Model):
    # PDF ka type (Notes, Paper, ya Syllabus)
    TYPE_CHOICES = (
        ('notes', 'Notes'),
        ('question_paper', 'Question Paper'),
        ('syllabus', 'Syllabus'),
    )
    
    title = models.CharField(max_length=200)
    
    # Subject ko 'Foreign Key' se link kiya
    subject = models.ForeignKey(Subject, on_delete=models.CASCADE, related_name='resources')
    
    resource_type = models.CharField(max_length=20, choices=TYPE_CHOICES, default='notes')
    
    # File ko 'media/resource_pdfs/' folder mein save karega
    pdf_file = models.FileField(upload_to='resource_pdfs/')
    
    # --- YEH LINE BADAL DI GAYI HAI ---
    # Humne CustomUser class ki jagah string ka istemaal kiya hai
    uploaded_by = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.SET_NULL, null=True, blank=True)
    # --- Yahaan tak ---

    uploaded_at = models.DateTimeField(auto_now_add=True)
    
    # Admin approval ke liye (Isse files check karke live kar sakte hain)
    is_approved = models.BooleanField(default=False)

    def __str__(self):
        return self.title
    
    # File ka naam lene ke liye (hum ise API mein use karenge)
    def filename(self):
        return os.path.basename(self.pdf_file.name)