import smtplib
from email.message import EmailMessage
import os

# Email configuration
SMTP_SERVER = 'smtp.gmail.com'
SMTP_PORT = 587

def get_email_credentials():
    try:
        file_path = os.path.join(os.path.dirname(__file__), 'files', 'emailInfo.txt')
        with open(file_path, 'r') as f:
            username = f.readline().strip()
            password = f.readline().strip()
            return username, password
    except FileNotFoundError:
        print("Error: emailInfo.txt not found. Cannot send emails.")
        return None, None



def create_welcome_email(to_email, user_name, sender_email):
    msg = EmailMessage()
    msg['Subject'] = 'Welcome to OpenHand!'
    msg['From'] = sender_email
    msg['To'] = to_email
    
    # Using localhost for the image for now as per previous context, 
    # but in production this should be a hosted URL.
    mascot_url = "https://firebasestorage.googleapis.com/v0/b/csc490-capstone.firebasestorage.app/o/b6.png?alt=media&token=b77beef3-584c-4ea3-8e7b-8db3f88e781f"
    
    msg.set_content(f'''
    <!DOCTYPE html>
    <html>
    <head>
        <style>
            body {{ font-family: Arial, sans-serif; line-height: 1.6; color: #333; }}
            .container {{ max-width: 600px; margin: 0 auto; padding: 20px; }}
            .header {{ background-color: #00a6ff; color: white; padding: 20px; text-align: center; border-radius: 5px 5px 0 0; }}
            .content {{ padding: 20px; border: 1px solid #ddd; border-top: none; border-radius: 0 0 5px 5px; }}
            .footer {{ text-align: center; margin-top: 20px; font-size: 0.8em; color: #777; }}
        </style>
    </head>
    <body>
        <div class="container">
            <div class="header">
                <img src="{mascot_url}" alt="OpenHand Mascot" style="max-width: 150px; height: auto; margin-bottom: 10px;">
                <h1>Welcome to OpenHand!</h1>
            </div>
            <div class="content">
                <p>Hello {user_name},</p>
                <p>Hello from the Dev team, We are happy to have you signed up for Open Hand.</p>
                <p>We're excited to help you start your journey in learning sign language.</p>
                <p>Happy signing!</p>
                <p>- The OpenHand Team</p>
            </div>
            <div class="footer">
                <p>&copy; 2024 OpenHand. All rights reserved.</p>
            </div>
        </div>
    </body>
    </html>
    ''', subtype='html')
    return msg

def send_welcome_email(to_email, user_name):
    """
    Sends a welcome email to the specified address.
    Returns True if successful, False otherwise.
    """
    username, password = get_email_credentials()
    if not username or not password:
        return False

    print(f"Attempting to send email from {username}...")
    try:
        server = smtplib.SMTP(SMTP_SERVER, SMTP_PORT)
        server.starttls()
        try:
            server.login(username, password)
        except smtplib.SMTPAuthenticationError:
            print("ERROR: Authentication failed. Please ensure you are using a specific App Password, not your regular Gmail password.")
            return False
            
        msg = create_welcome_email(to_email, user_name, username)
        server.send_message(msg)
        print(f'Welcome email sent successfully to {to_email}')
        server.quit()
        return True
    except Exception as e:
        print(f'Error sending welcome email details: {e}')
        return False
