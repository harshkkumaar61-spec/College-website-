from rest_framework import serializers 
from .models import CustomUser
from django.contrib.auth.password_validation import validate_password
from rest_framework_simplejwt.serializers import TokenObtainPairSerializer
from rest_framework import serializers as drf_serializers

class RegisterSerializer(serializers.ModelSerializer):
    password = serializers.CharField(
        write_only=True, 
        required=True, 
        validators=[validate_password] # Django ke built-in password rules use karega
    )
    
    first_name = serializers.CharField(required=True)
    last_name = serializers.CharField(required=True)

    class Meta:
        model = CustomUser
        # Yeh fields hum frontend se lenge (jaisa aapke main.js mein hai)
        fields = ('email', 'password', 'first_name', 'last_name', 'role', 'college')

    def validate(self, attrs):
        # Email pehle se register hai ya nahi, 'unique=True' model mein check kar lega.
        # Hum yahan extra validation kar sakte hain. Abhi ke liye theek hai.
        return attrs

    def create(self, validated_data):
        # User create karo
        user = CustomUser.objects.create_user(
            username=validated_data['email'], # Hum email ko hi username use kar rahe hain
            email=validated_data['email'],
            first_name=validated_data['first_name'],
            last_name=validated_data['last_name'],
            role=validated_data.get('role', 'student'),
            college=validated_data.get('college')
        )
        
        # Password set karo (create_user automatically hash kar deta hai)
        user.set_password(validated_data['password'])
        
        # !! IMPORTANT !!
        # User ko login karne se roko jab tak email verify na ho
        user.is_active = False 
        user.save()
        
        return user
# --- YEH NAYA SERIALIZER ADD KARO ---
class CustomTokenObtainPairSerializer(TokenObtainPairSerializer):
    """
    Login response ko customize karta hai.
    Token ke saath user ki details bhi bhejta hai (jaisa main.js ko chahiye).
    """
    
    # Humne model mein email ko USERNAME_FIELD banaya tha
    # Toh yahan bhi batana padega
    
    def validate(self, attrs):
        # Email aur password ko validate karo
        data = super().validate(attrs)
        
        # Check karo ki user active hai (email verified hai)
        if not self.user.is_active:
            raise drf_serializers.ValidationError(
                {"detail": "Account not activated. Please verify your email first."}
            )

        # Response mein user details add karo (main.js ke liye)
        data['user'] = {
            'email': self.user.email,
            'first_name': self.user.first_name,
            'last_name': self.user.last_name,
            'profile_pic': self.user.profile_pic.url if self.user.profile_pic else None
        }
        return data

# --- YEH NAYA SERIALIZER ADD KARO ---
class ProfileSerializer(serializers.ModelSerializer):
    """
    Serializer for user profile view and update.
    """
    class Meta:
        model = CustomUser
        # Yeh fields hum GET request pe dikhayenge
        # aur PATCH request pe update kar payenge
        fields = ('email', 'first_name', 'last_name', 'role', 'college', 'profile_pic')
        
        # Email aur Role ko read-only banate hain (taaki update na ho sake)
        read_only_fields = ('email', 'role')
# --- YEH NAYA SERIALIZER ADD KARO ---
class ContactFormSerializer(serializers.Serializer):
    """
    Serializer for the contact form.
    Yeh model se nahi, seedha data se validate karega.
    """
    name = serializers.CharField(required=True)
    email = serializers.EmailField(required=True)
    subject = serializers.CharField(required=True)
    message = serializers.CharField(required=True)