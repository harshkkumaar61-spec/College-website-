from django.contrib import admin
# --- Naya model import karo ---
from .models import Subject, Resource, DownloadHistory

@admin.register(Resource)
class ResourceAdmin(admin.ModelAdmin):
    # ... (puraana code waise hi) ...
    list_display = ('title', 'subject', 'resource_type', 'uploaded_by', 'is_approved', 'uploaded_at')
    list_filter = ('resource_type', 'is_approved', 'subject')
    search_fields = ('title', 'subject__name')
    actions = ['approve_resources']

    def approve_resources(self, request, queryset):
        queryset.update(is_approved=True)
    approve_resources.short_description = "Approve selected resources"

@admin.register(Subject)
class SubjectAdmin(admin.ModelAdmin):
    # ... (puraana code waise hi) ...
    list_display = ('name', 'branch', 'semester')
    search_fields = ('name', 'branch')

# --- YEH NAYA CODE ADD KARO ---
@admin.register(DownloadHistory)
class DownloadHistoryAdmin(admin.ModelAdmin):
    list_display = ('user', 'resource', 'downloaded_at')
    list_filter = ('user', 'resource')
    search_fields = ('user__email', 'resource__title')
# --- YAHAN TAK ---