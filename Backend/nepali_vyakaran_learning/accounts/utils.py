"""
Utility functions for the accounts app.
"""

import random
import string
from datetime import datetime, timedelta
from urllib.parse import quote
from django.conf import settings
from django.core.mail import send_mail
from django.template.loader import render_to_string
from django.utils.html import strip_tags
from rest_framework.views import exception_handler
from rest_framework.response import Response
from rest_framework import status


def custom_exception_handler(exc, context):
    """
    Custom exception handler for DRF that provides consistent error responses.
    """
    response = exception_handler(exc, context)
    
    if response is not None:
        custom_response_data = {
            'success': False,
            'error': {
                'code': response.status_code,
                'message': get_error_message(response.data),
                'details': response.data if isinstance(response.data, dict) else {'detail': response.data}
            },
            'timestamp': datetime.now().isoformat()
        }
        response.data = custom_response_data
    
    return response


def get_error_message(data):
    """
    Extract a human-readable error message from DRF error data.
    """
    if isinstance(data, dict):
        if 'detail' in data:
            return str(data['detail'])
        # Get the first error message
        for key, value in data.items():
            if isinstance(value, list) and len(value) > 0:
                return f"{key}: {value[0]}"
            elif isinstance(value, str):
                return f"{key}: {value}"
    elif isinstance(data, list) and len(data) > 0:
        return str(data[0])
    return "An error occurred"


def generate_otp(length=6):
    """
    Generate a random numeric OTP of specified length.
    """
    return ''.join(random.choices(string.digits, k=length))


def get_email_base_template():
    """
    Returns the base HTML email template with consistent styling.
    """
    return """
    <!DOCTYPE html>
    <html lang="en">
    <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <style>
            * {{ margin: 0; padding: 0; box-sizing: border-box; }}
            body {{ 
                font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; 
                line-height: 1.6; 
                color: #333; 
                background-color: #f4f4f4;
            }}
            .email-wrapper {{
                max-width: 600px;
                margin: 0 auto;
                background: #ffffff;
                border-radius: 16px;
                overflow: hidden;
                box-shadow: 0 4px 20px rgba(0, 0, 0, 0.1);
            }}
            .header {{
                background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
                color: white;
                padding: 40px 30px;
                text-align: center;
            }}
            .header-icon {{
                font-size: 48px;
                margin-bottom: 15px;
            }}
            .header h1 {{
                font-size: 28px;
                margin-bottom: 5px;
                font-weight: 700;
            }}
            .header p {{
                font-size: 14px;
                opacity: 0.9;
            }}
            .content {{
                padding: 40px 30px;
            }}
            .greeting {{
                font-size: 20px;
                font-weight: 600;
                color: #333;
                margin-bottom: 20px;
            }}
            .message {{
                font-size: 16px;
                color: #555;
                margin-bottom: 25px;
                line-height: 1.7;
            }}
            .otp-container {{
                background: linear-gradient(135deg, #f5f7fa 0%, #e4e8eb 100%);
                border: 2px dashed #667eea;
                border-radius: 12px;
                padding: 30px;
                text-align: center;
                margin: 25px 0;
            }}
            .otp-label {{
                font-size: 14px;
                color: #666;
                margin-bottom: 10px;
                text-transform: uppercase;
                letter-spacing: 1px;
            }}
            .otp-code {{
                font-size: 40px;
                font-weight: 800;
                color: #667eea;
                letter-spacing: 12px;
                font-family: 'Courier New', monospace;
            }}
            .expiry {{
                display: inline-flex;
                align-items: center;
                gap: 5px;
                background: #fff3cd;
                color: #856404;
                padding: 8px 16px;
                border-radius: 20px;
                font-size: 13px;
                margin-top: 15px;
            }}
            .button-container {{
                text-align: center;
                margin: 30px 0;
            }}
            .action-button {{
                display: inline-block;
                background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
                color: white !important;
                text-decoration: none;
                padding: 16px 40px;
                border-radius: 30px;
                font-size: 16px;
                font-weight: 600;
                transition: transform 0.3s ease, box-shadow 0.3s ease;
            }}
            .action-button:hover {{
                transform: translateY(-2px);
                box-shadow: 0 8px 25px rgba(102, 126, 234, 0.4);
            }}
            .divider {{
                height: 1px;
                background: linear-gradient(to right, transparent, #ddd, transparent);
                margin: 25px 0;
            }}
            .info-box {{
                background: #e8f4fd;
                border-left: 4px solid #667eea;
                padding: 15px 20px;
                border-radius: 0 8px 8px 0;
                margin: 20px 0;
            }}
            .info-box p {{
                font-size: 14px;
                color: #555;
                margin: 0;
            }}
            .footer {{
                background: #f8f9fa;
                padding: 25px 30px;
                text-align: center;
                border-top: 1px solid #eee;
            }}
            .footer-logo {{
                font-size: 18px;
                font-weight: 700;
                color: #667eea;
                margin-bottom: 10px;
            }}
            .footer p {{
                font-size: 12px;
                color: #888;
                margin: 5px 0;
            }}
            .social-links {{
                margin: 15px 0;
            }}
            .social-links a {{
                display: inline-block;
                margin: 0 8px;
                color: #667eea;
                text-decoration: none;
            }}
            .help-text {{
                font-size: 13px;
                color: #888;
                margin-top: 20px;
            }}
            @media only screen and (max-width: 600px) {{
                .email-wrapper {{ margin: 10px; }}
                .header {{ padding: 30px 20px; }}
                .content {{ padding: 30px 20px; }}
                .otp-code {{ font-size: 32px; letter-spacing: 8px; }}
            }}
        </style>
    </head>
    <body>
        <div style="padding: 20px;">
            <div class="email-wrapper">
                {header}
                <div class="content">
                    {content}
                </div>
                <div class="footer">
                    <div class="footer-logo">📚 नेपाली व्याकरण</div>
                    <p>Nepali Vyakaran Learning Platform</p>
                    <p style="margin-top: 15px;">© 2026 Nepali Vyakaran Learning. All rights reserved.</p>
                    <p class="help-text">
                        Questions? Contact us at support@nepalivyakaran.com
                    </p>
                </div>
            </div>
        </div>
    </body>
    </html>
    """


def send_otp_email(user, otp_code, purpose='verification'):
    """
    Send beautiful OTP email to user with action links.
    
    Args:
        user: User object
        otp_code: The OTP code to send
        purpose: 'verification', 'password_reset', or 'login'
    """
    frontend_url = getattr(settings, 'FRONTEND_URL', 'http://localhost:3000')
    # Ensure http protocol for local development
    if 'localhost' in frontend_url and frontend_url.startswith('https'):
        frontend_url = frontend_url.replace('https://', 'http://')
    
    # URL encode email to handle special characters
    encoded_email = quote(user.email)
    
    # Define purpose-specific content
    purpose_config = {
        'verification': {
            'subject': '✉️ Verify Your Email - Nepali Vyakaran Learning',
            'header_icon': '✉️',
            'header_title': 'Email Verification',
            'header_subtitle': 'One step closer to learning Nepali!',
            'message': 'Thank you for registering with Nepali Vyakaran Learning! Please verify your email address to activate your account and start your learning journey.',
            'button_text': 'Verify Email',
            'button_link': f'{frontend_url}/verify-email?email={encoded_email}&otp={otp_code}',
        },
        'password_reset': {
            'subject': '🔐 Reset Your Password - Nepali Vyakaran Learning',
            'header_icon': '🔐',
            'header_title': 'Password Reset',
            'header_subtitle': 'We received a request to reset your password',
            'message': 'No worries! It happens to the best of us. Use the code below or click the button to reset your password.',
            'button_text': 'Reset Password',
            'button_link': f'{frontend_url}/reset-password?email={encoded_email}',
        },
        'login': {
            'subject': '🔑 Login Verification - Nepali Vyakaran Learning',
            'header_icon': '🔑',
            'header_title': 'Login Verification',
            'header_subtitle': 'Secure login verification',
            'message': 'We detected a login attempt to your account. Please use the code below to complete your login.',
            'button_text': 'Complete Login',
            'button_link': f'{frontend_url}/login',
        },
    }
    
    config = purpose_config.get(purpose, purpose_config['verification'])
    
    # Build the header
    header = f'''
        <div class="header">
            <div class="header-icon">{config['header_icon']}</div>
            <h1>{config['header_title']}</h1>
            <p>{config['header_subtitle']}</p>
        </div>
    '''
    
    # Build the content
    content = f'''
        <h2 class="greeting">नमस्ते, {user.username}! 🙏</h2>
        <p class="message">{config['message']}</p>
        
        <div class="otp-container">
            <div class="otp-label">Your Verification Code</div>
            <div class="otp-code">{otp_code}</div>
            <div class="expiry">⏰ Expires in {settings.OTP_EXPIRY_MINUTES} minutes</div>
        </div>
        
        <div class="button-container">
            <a href="{config['button_link']}" class="action-button">{config['button_text']}</a>
        </div>
        
        <div class="divider"></div>
        
        <div class="info-box">
            <p><strong>🔒 Security Tip:</strong> Never share this code with anyone. Our team will never ask for your OTP.</p>
        </div>
        
        <p class="message" style="font-size: 14px; color: #666;">
            If you didn't request this code, please ignore this email or contact support if you have concerns.
        </p>
    '''
    
    # Build final HTML
    html_message = get_email_base_template().format(header=header, content=content)
    
    # Plain text version
    plain_message = f"""
    नमस्ते, {user.username}!
    
    {config['message']}
    
    Your verification code is: {otp_code}
    
    This code expires in {settings.OTP_EXPIRY_MINUTES} minutes.
    
    Or click this link: {config['button_link']}
    
    If you didn't request this code, please ignore this email.
    
    Best regards,
    Nepali Vyakaran Learning Team
    """
    
    try:
        send_mail(
            subject=config['subject'],
            message=plain_message,
            from_email=settings.DEFAULT_FROM_EMAIL,
            recipient_list=[user.email],
            html_message=html_message,
            fail_silently=False,
        )
        return True
    except Exception as e:
        print(f"Error sending email: {e}")
        return False


def send_welcome_email(user):
    """
    Send beautiful welcome email after successful registration.
    """
    frontend_url = getattr(settings, 'FRONTEND_URL', 'http://localhost:3000')
    
    header = '''
        <div class="header">
            <div class="header-icon">🎉</div>
            <h1>Welcome to the Family!</h1>
            <p>Your journey to mastering Nepali grammar starts now</p>
        </div>
    '''
    
    content = f'''
        <h2 class="greeting">नमस्ते, {user.username}! 🙏</h2>
        <p class="message">
            Congratulations on joining Nepali Vyakaran Learning! We're thrilled to have you as part of our community 
            of learners dedicated to mastering Nepali grammar.
        </p>
        
        <div class="info-box" style="background: #e8f5e9; border-left-color: #4caf50;">
            <p><strong>🎯 What's Next?</strong></p>
            <p style="margin-top: 10px;">
                • Complete your profile to personalize your learning experience<br>
                • Start with basic lessons to build a strong foundation<br>
                • Play grammar games to make learning fun<br>
                • Track your progress and earn achievements
            </p>
        </div>
        
        <div class="button-container">
            <a href="{frontend_url}/lessons" class="action-button">🚀 Start Learning</a>
        </div>
        
        <div class="divider"></div>
        
        <p class="message" style="text-align: center; font-size: 18px;">
            Ready to explore? Here's what awaits you:
        </p>
        
        <table style="width: 100%; margin: 20px 0; text-align: center;">
            <tr>
                <td style="padding: 15px;">
                    <div style="font-size: 32px;">📚</div>
                    <div style="font-weight: 600; margin-top: 10px;">Lessons</div>
                    <div style="font-size: 12px; color: #666;">Interactive grammar lessons</div>
                </td>
                <td style="padding: 15px;">
                    <div style="font-size: 32px;">🎮</div>
                    <div style="font-weight: 600; margin-top: 10px;">Games</div>
                    <div style="font-size: 12px; color: #666;">Learn while having fun</div>
                </td>
                <td style="padding: 15px;">
                    <div style="font-size: 32px;">🏆</div>
                    <div style="font-weight: 600; margin-top: 10px;">Achievements</div>
                    <div style="font-size: 12px; color: #666;">Earn rewards & badges</div>
                </td>
            </tr>
        </table>
    '''
    
    html_message = get_email_base_template().format(header=header, content=content)
    
    plain_message = f"""
    नमस्ते, {user.username}!
    
    Welcome to Nepali Vyakaran Learning!
    
    We're thrilled to have you join our community of learners.
    
    Get started now: {frontend_url}/lessons
    
    Best regards,
    Nepali Vyakaran Learning Team
    """
    
    try:
        send_mail(
            subject='🎉 Welcome to Nepali Vyakaran Learning!',
            message=plain_message,
            from_email=settings.DEFAULT_FROM_EMAIL,
            recipient_list=[user.email],
            html_message=html_message,
            fail_silently=False,
        )
        return True
    except Exception as e:
        print(f"Error sending welcome email: {e}")
        return False


def success_response(data=None, message=None, status_code=status.HTTP_200_OK):
    """
    Create a standardized success response.
    """
    response_data = {
        'success': True,
        'timestamp': datetime.now().isoformat()
    }
    
    if data is not None:
        response_data['data'] = data
    
    if message is not None:
        response_data['message'] = message
    
    return Response(response_data, status=status_code)


def error_response(message, code='ERROR', details=None, status_code=status.HTTP_400_BAD_REQUEST):
    """
    Create a standardized error response.
    """
    response_data = {
        'success': False,
        'error': {
            'code': code,
            'message': message,
        },
        'timestamp': datetime.now().isoformat()
    }
    
    if details is not None:
        response_data['error']['details'] = details
    
    return Response(response_data, status=status_code)


def paginated_response(paginator, data, request):
    """
    Create a standardized paginated response.
    """
    return Response({
        'success': True,
        'data': data,
        'pagination': {
            'currentPage': paginator.page.number,
            'totalPages': paginator.page.paginator.num_pages,
            'pageSize': paginator.page_size,
            'totalItems': paginator.page.paginator.count,
            'hasNextPage': paginator.page.has_next(),
            'hasPreviousPage': paginator.page.has_previous(),
        },
        'timestamp': datetime.now().isoformat()
    })
