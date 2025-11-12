from django.contrib import admin
from django.contrib.auth.admin import UserAdmin
from .models import CustomUser

class CustomUserAdmin(UserAdmin):
    model = CustomUser
    list_display = ('email', 'first_name', 'last_name', 'role', 'is_staff')
    search_fields = ('email', 'first_name', 'last_name')
    list_filter = ('role', 'is_staff', 'is_active')
    
    # Humare model mein 'username' field nahi hai (email hai), 
    # isliye default admin forms ko override kar rahe hain
    
    # Yeh form fields user ko edit karte waqt dikhenge
    fieldsets = (
        (None, {'fields': ('email', 'password')}),
        ('Personal Info', {'fields': ('first_name', 'last_name', 'role', 'profile_pic')}),
        ('Permissions', {'fields': ('is_active', 'is_staff', 'is_superuser', 'groups', 'user_permissions')}),
        
        # 'Important dates' ko 'readonly_fields' mein hona chahiye, yahaan nahi
        # ('Important dates', {'fields': ('last_login', 'date_joined')}), <-- YEH GALAT THA
    )
    
    # Non-editable fields ko yahaan daalein
    readonly_fields = ('last_login', 'date_joined')
    
    # Yeh form fields naya user banate waqt dikhenge
    add_fieldsets = (
        (None, {
            'classes': ('wide',),
            'fields': ('email', 'password', 'first_name', 'last_name', 'role', 'profile_pic'),
        }),
    )
    ordering = ('email',)

# Humare naye model ko admin panel mein register kar rahe hain
admin.site.register(CustomUser, CustomUserAdmin)