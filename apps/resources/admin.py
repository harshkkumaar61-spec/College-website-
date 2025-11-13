from django.contrib import admin
from .models import Subject, Resource

@admin.register(Resource)
class ResourceAdmin(admin.ModelAdmin):
    list_display = ('title', 'subject', 'resource_type', 'uploaded_by', 'is_approved', 'uploaded_at')
    list_filter = ('resource_type', 'is_approved', 'subject')
    search_fields = ('title', 'subject__name')
    actions = ['approve_resources']

    def approve_resources(self, request, queryset):
        queryset.update(is_approved=True)
    approve_resources.short_description = "Approve selected resources"

@admin.register(Subject)
class SubjectAdmin(admin.ModelAdmin):
    list_display = ('name', 'branch', 'semester')
    search_fields = ('name', 'branch')