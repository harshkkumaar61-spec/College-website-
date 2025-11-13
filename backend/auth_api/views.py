from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from rest_framework.permissions import AllowAny
from .serializers import RegisterSerializer
from .models import CustomUser

# Email bhejne ke liye imports
from django.core.mail import EmailMessage
from django.conf import settings
from django.utils.http import urlsafe_base64_encode
from django.utils.encoding import force_bytes
from django.contrib.auth.tokens import default_token_generator
from django.utils.http import urlsafe_base64_decode
from django.utils.encoding import force_str
from rest_framework_simplejwt.views import TokenObtainPairView
from .serializers import CustomTokenObtainPairSerializer
from rest_framework.permissions import IsAuthenticated # Permission check karne ke liye
from .serializers import ProfileSerializer # Humara naya serializer
from .serializers import ContactFormSerializer # Naya serializer import karo
from django.core.mail import send_mail # Standard email function

# ... RegisterView ka code jaisa hai waisa rehne do ...

# --- YEH NAYA VIEW ADD KARO ---
class VerifyEmailView(APIView):
    """
    API endpoint to verify email and activate user.
    Handles POST request from main.js (jo URL se uid/token nikal kar bhej raha hai).
    """
    permission_classes = [AllowAny]

    def post(self, request):
        try:
            # main.js yeh data bhej raha hai (humne main.js mein fix kiya tha)
            uidb64 = request.data.get('uidb64')
            token = request.data.get('token')
            
            if not uidb64 or not token:
                return Response(
                    {"error": "UID and Token are required."},
                    status=status.HTTP_400_BAD_REQUEST
                )

            # UID ko decode karo
            uid = force_str(urlsafe_base64_decode(uidb64))
            user = CustomUser.objects.get(pk=uid)

        except (TypeError, ValueError, OverflowError, CustomUser.DoesNotExist):
            user = None

        # Token check karo
        if user is not None and default_token_generator.check_token(user, token):
            if user.is_active:
                return Response(
                    {"message": "Account already verified. Please login."},
                    status=status.HTTP_200_OK
                )
            
            # User ko activate karo
            user.is_active = True
            user.save()
            return Response(
                {"message": "Email verified successfully! You can now login."},
                status=status.HTTP_200_OK
            )
        else:
            # Invalid link
            return Response(
                {"error": "Verification link is invalid or has expired."},
                status=status.HTTP_400_BAD_REQUEST
            )

class RegisterView(APIView):
    """
    API endpoint for user registration.
    Handles POST request from main.js registerForm.
    """
    permission_classes = [AllowAny] # Register karne ke liye login ki zaroorat nahi

    def post(self, request):
        serializer = RegisterSerializer(data=request.data)
        
        if serializer.is_valid():
            user = serializer.save() # Serializer ka .create() method call hoga
            
            # --- Email Verification Logic ---
            try:
                # Token generate karo
                token = default_token_generator.make_token(user)
                uid = urlsafe_base64_encode(force_bytes(user.pk))
                
                # Yeh link aapke FRONTEND ka URL hona chahiye
                # Aapke main.js mein '?verify_uid=' check ho raha hai
                
                # !! IMPORTANT: Ise apne live frontend URL se badal dena !!
                # Abhi hum local testing ke liye http://127.0.0.1:5500 use kar lete hain
                # (Aapka index.html 'live server' par 5500 port par chalta hai)
                frontend_url = 'http://127.0.0.1:5500' 
                
                verification_link = f"{frontend_url}/?verify_uid={uid}&verify_token={token}"
                
                subject = 'Verify your CollegeResources Account'
                message = f"""
Hi {user.first_name},

Thank you for registering!

Please click the link below to verify your email address and activate your account:
{verification_link}

Thanks,
The CollegeResources Team
"""
                
                email = EmailMessage(
                    subject,
                    message,
                    settings.DEFAULT_FROM_EMAIL, # Yeh settings.py se aayega
                    [user.email]
                )
                email.send() # Yeh terminal par print hoga (settings.py ki wajah se)

                # Aapke main.js ke 'showNotification' ke liye response
                return Response(
                    {"message": "Please check your email to verify your account."}, 
                    status=status.HTTP_201_CREATED
                )
                
            except Exception as e:
                # Agar email fail ho, toh user ko delete kar do taaki woh dobara try kar sake
                user.delete()
                return Response(
                    {"error": f"Failed to send verification email. {str(e)}"},
                    status=status.HTTP_500_INTERNAL_SERVER_ERROR
                )
        
        # Agar data valid nahi hai (e.g., email exists)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

# --- YEH NAYA VIEW ADD KARO ---
class CustomTokenLoginView(TokenObtainPairView):
    """
    Default login view ko humare custom serializer ke saath jodata hai.
    """
    serializer_class = CustomTokenObtainPairSerializer

# --- YEH NAYA VIEW ADD KARO ---
class ProfileView(APIView):
    """
    API endpoint for fetching and updating user profile.
    Handles GET and PATCH requests for /api/auth/profile/
    """
    permission_classes = [IsAuthenticated] # Sirf logged-in user hi access kar sakte hain

    def get(self, request):
        """
        Fetch current user's profile (main.js page refresh pe use karta hai)
        """
        user = request.user
        # Humne CustomTokenObtainPairSerializer mein bhi 'user' data bheja tha,
        # par yeh view tab kaam aata hai jab page refresh ho aur main.js
        # token se user ka data dobara fetch karna chahe.
        serializer = ProfileSerializer(user)
        return Response(serializer.data, status=status.HTTP_200_OK)

    def patch(self, request):
        """
        Update current user's profile (first_name, last_name, profile_pic)
        main.js isse FormData ke saath call karta hai.
        """
        user = request.user
        
        # 'partial=True' ka matlab hai ki user saari fields nahi bhej raha,
        # sirf kuch hi fields update kar raha hai.
        serializer = ProfileSerializer(user, data=request.data, partial=True)
        
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data, status=status.HTTP_200_OK)
        
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
# --- YEH NAYA VIEW ADD KARO ---
class ContactFormView(APIView):
    """
    API endpoint for the contact form.
    Handles POST request from main.js contactForm.
    """
    permission_classes = [AllowAny] # Koi bhi contact form bhar sakta hai

    def post(self, request):
        serializer = ContactFormSerializer(data=request.data)
        
        if serializer.is_valid():
            data = serializer.validated_data
            name = data.get('name')
            email = data.get('email')
            subject = data.get('subject')
            message = data.get('message')

            try:
                # Admin ko email bhejo
                send_mail(
                    subject=f"Contact Form: {subject}",
                    message=f"You received a new message from:\n\n"
                            f"Name: {name}\n"
                            f"Email: {email}\n\n"
                            f"Message:\n{message}",
                    from_email=settings.DEFAULT_FROM_EMAIL,
                    recipient_list=[settings.DEFAULT_FROM_EMAIL] # Admin ko bhejo
                )
                
                return Response(
                    {"message": "Message sent successfully! We will get back to you soon."},
                    status=status.HTTP_200_OK
                )
            except Exception as e:
                return Response(
                    {"error": f"Failed to send message. {str(e)}"},
                    status=status.HTTP_500_INTERNAL_SERVER_ERROR
                )
        
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)