from django.contrib import admin
from django.contrib.auth.admin import UserAdmin
from .models import CustomUser

# Hum UserAdmin ko extend kar rahe hain taaki humari extra fields dikhe
class CustomUserAdmin(UserAdmin):
    model = CustomUser
    list_display = ('email', 'username', 'first_name', 'last_name', 'role', 'is_staff')
    
    # Fields jo edit form mein dikhengi
    fieldsets = UserAdmin.fieldsets + (
        (None, {'fields': ('role', 'college', 'profile_pic')}),
    )
    # Fields jo naya user banate time dikhengi
    add_fieldsets = UserAdmin.add_fieldsets + (
        (None, {'fields': ('role', 'college', 'profile_pic')}),
    )

admin.site.register(CustomUser, CustomUserAdmin)