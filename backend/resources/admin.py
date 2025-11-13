from django.contrib import admin
from .models import Subject, ResourceFile, DownloadHistory

@admin.register(Subject)
class SubjectAdmin(admin.ModelAdmin):
    list_display = ('name', 'semester')
    search_fields = ('name',)

@admin.register(ResourceFile)
class ResourceFileAdmin(admin.ModelAdmin):
    list_display = ('title', 'subject', 'resource_type', 'uploaded_by', 'is_approved', 'uploaded_at')
    list_filter = ('is_approved', 'resource_type', 'subject')
    search_fields = ('title', 'uploaded_by__email')

    # Admin panel se approve karne ke liye action
    actions = ['approve_files']

    def approve_files(self, request, queryset):
        queryset.update(is_approved=True)
    approve_files.short_description = "Mark selected files as approved"

@admin.register(DownloadHistory)
class DownloadHistoryAdmin(admin.ModelAdmin):
    list_display = ('user', 'resource', 'downloaded_at')
    search_fields = ('user__email', 'resource__title')