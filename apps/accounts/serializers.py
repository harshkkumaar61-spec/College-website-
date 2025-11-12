from rest_framework import serializers
from .models import CustomUser
from rest_framework_simplejwt.serializers import TokenObtainPairSerializer

# --- REFRESH FIX KE LIYE NAYA SERIALIZER ---
class UserProfileSerializer(serializers.ModelSerializer):
    """
    Sirf user ki details dikhane ke liye serializer (Refresh fix ke liye).
    """
    profile_pic = serializers.SerializerMethodField()

    class Meta:
        model = CustomUser
        fields = ('id', 'email', 'first_name', 'last_name', 'role', 'profile_pic')

    def get_profile_pic(self, obj):
        # Profile pic ka poora URL banayein
        if obj.profile_pic:
            request = self.context.get('request')
            if request:
                return request.build_absolute_uri(obj.profile_pic.url)
            return obj.profile_pic.url
        return None
# --- YAHAN TAK ---


# --- Register Serializer ---
class UserCreateSerializer(serializers.ModelSerializer):
    class Meta:
        model = CustomUser
        fields = ('email', 'first_name', 'last_name', 'password', 'role')
        extra_kwargs = {'password': {'write_only': True}}

    def create(self, validated_data):
        user = CustomUser.objects.create_user(
            email=validated_data['email'],
            password=validated_data['password'],
            first_name=validated_data.get('first_name', ''),
            last_name=validated_data.get('last_name', ''),
            role=validated_data.get('role', 'student')
        )
        return user


# --- Login Serializer ---
class MyTokenObtainPairSerializer(TokenObtainPairSerializer):
    """
    Default token serializer ko customize kar rahe hain
    taaki woh user ki details bhi response mein bhej sake.
    """
    
    @classmethod
    def get_token(cls, user):
        token = super().get_token(user)
        token['email'] = user.email
        token['first_name'] = user.first_name
        token['role'] = user.role
        return token

    def validate(self, attrs):
        data = super().validate(attrs)
        profile_pic_url = None
        if self.user.profile_pic:
            request = self.context.get('request')
            if request:
                profile_pic_url = request.build_absolute_uri(self.user.profile_pic.url)
            else:
                profile_pic_url = self.user.profile_pic.url

        data['user'] = {
            'id': self.user.id,
            'email': self.user.email,
            'first_name': self.user.first_name,
            'last_name': self.user.last_name,
            'role': self.user.role,
            'profile_pic': profile_pic_url
        }
        
        return data