"""
Clean Fashions - Python Flask Backend
Handles email notifications, orders, and user management
"""

from flask import Flask, request, jsonify
from flask_cors import CORS
from datetime import datetime
import os
from dotenv import load_dotenv
import smtplib
from email.mime.text import MIMEText
from email.mime.multipart import MIMEMultipart

load_dotenv()

app = Flask(__name__)
CORS(app)
app.config['SECRET_KEY'] = os.getenv('SECRET_KEY', 'dev-secret-key')

# Email configuration
MAIL_SERVER = os.getenv('MAIL_SERVER', 'smtp.gmail.com')
MAIL_PORT = int(os.getenv('MAIL_PORT', 587))
MAIL_USERNAME = os.getenv('MAIL_USERNAME')
MAIL_PASSWORD = os.getenv('MAIL_PASSWORD')
MAIL_FROM = os.getenv('MAIL_FROM', 'noreply@cleanfashions.com')


def send_email(recipient, subject, body_html):
    """Send email notification"""
    if not MAIL_USERNAME or not MAIL_PASSWORD:
        print(f"⚠️ Email not configured. Would send to {recipient}: {subject}")
        return False
    
    try:
        msg = MIMEMultipart('alternative')
        msg['Subject'] = subject
        msg['From'] = MAIL_FROM
        msg['To'] = recipient
        
        msg.attach(MIMEText(body_html, 'html'))
        
        with smtplib.SMTP(MAIL_SERVER, MAIL_PORT) as server:
            server.starttls()
            server.login(MAIL_USERNAME, MAIL_PASSWORD)
            server.send_message(msg)
        
        print(f"✅ Email sent to {recipient}")
        return True
    except Exception as e:
        print(f"❌ Error sending email: {str(e)}")
        return False


@app.route('/api/health', methods=['GET'])
def health():
    """Health check endpoint"""
    return jsonify({'status': 'ok', 'message': 'Clean Fashions API is running'})


@app.route('/api/orders', methods=['POST'])
def create_order():
    """
    Create a new order and send confirmation email
    Expected JSON:
    {
        "customer_email": "user@example.com",
        "customer_name": "John Doe",
        "items": [
            {"id": 1, "name": "Product", "price": 45.00, "quantity": 1}
        ],
        "total": 45.00,
        "shipping_address": "123 Main St, City, State 12345"
    }
    """
    try:
        data = request.json
        
        # Validate required fields
        required_fields = ['customer_email', 'customer_name', 'items', 'total']
        if not all(field in data for field in required_fields):
            return jsonify({'error': 'Missing required fields'}), 400
        
        # Generate order ID
        order_id = f"ORD-{datetime.now().strftime('%Y%m%d%H%M%S')}"
        
        # Build email HTML
        items_html = ''.join([
            f"<tr><td>{item['name']}</td><td>${item['price']:.2f}</td><td>{item['quantity']}</td><td>${item['price'] * item['quantity']:.2f}</td></tr>"
            for item in data['items']
        ])
        
        email_body = f"""
        <html>
            <body style="font-family: Arial, sans-serif; color: #333;">
                <h2>Order Confirmation - Clean Fashions</h2>
                <p>Hi {data['customer_name']},</p>
                <p>Thank you for your order! Here are your details:</p>
                
                <p><strong>Order ID:</strong> {order_id}</p>
                <p><strong>Order Date:</strong> {datetime.now().strftime('%B %d, %Y')}</p>
                
                <h3>Items:</h3>
                <table border="1" cellpadding="10" style="width:100%; border-collapse: collapse;">
                    <thead style="background-color: #f5f5f5;">
                        <tr><th>Product</th><th>Price</th><th>Qty</th><th>Subtotal</th></tr>
                    </thead>
                    <tbody>
                        {items_html}
                        <tr style="font-weight: bold; background-color: #f9f9f9;">
                            <td colspan="3" style="text-align: right;">Total:</td>
                            <td>${data['total']:.2f}</td>
                        </tr>
                    </tbody>
                </table>
                
                <h3>Shipping Address:</h3>
                <p>{data.get('shipping_address', 'N/A')}</p>
                
                <p style="margin-top: 2rem; padding-top: 1rem; border-top: 1px solid #ddd; color: #666; font-size: 0.9rem;">
                    You will receive tracking information via email within 24 hours.
                    <br><br>
                    Questions? Contact us at support@cleanfashions.com
                </p>
            </body>
        </html>
        """
        
        # Send confirmation email
        send_email(
            data['customer_email'],
            f"Order Confirmation - {order_id}",
            email_body
        )
        
        return jsonify({
            'success': True,
            'order_id': order_id,
            'message': 'Order created and confirmation email sent',
            'timestamp': datetime.now().isoformat()
        }), 201
    
    except Exception as e:
        return jsonify({'error': str(e)}), 500


@app.route('/api/orders/<order_id>', methods=['GET'])
def get_order(order_id):
    """Get order status (demo endpoint)"""
    return jsonify({
        'order_id': order_id,
        'status': 'Processing',
        'message': 'Your order is being prepared for shipment'
    })


@app.route('/api/contact', methods=['POST'])
def contact_form():
    """
    Handle contact form submissions
    Expected JSON:
    {
        "name": "John Doe",
        "email": "user@example.com",
        "subject": "Question",
        "message": "Your message here"
    }
    """
    try:
        data = request.json
        
        # Validate fields
        required_fields = ['name', 'email', 'subject', 'message']
        if not all(field in data for field in required_fields):
            return jsonify({'error': 'Missing required fields'}), 400
        
        # Send confirmation to user
        user_email_body = f"""
        <html>
            <body style="font-family: Arial, sans-serif; color: #333;">
                <h2>We Received Your Message</h2>
                <p>Hi {data['name']},</p>
                <p>Thank you for contacting Clean Fashions. We will review your message and get back to you soon.</p>
                <p style="margin-top: 1rem; color: #666;">Message Reference: {datetime.now().strftime('%Y%m%d%H%M%S')}</p>
            </body>
        </html>
        """
        
        send_email(data['email'], "We received your message - Clean Fashions", user_email_body)
        
        return jsonify({
            'success': True,
            'message': 'Your message has been received'
        }), 201
    
    except Exception as e:
        return jsonify({'error': str(e)}), 500


@app.route('/api/newsletter', methods=['POST'])
def newsletter_signup():
    """Newsletter signup endpoint"""
    try:
        data = request.json
        
        if 'email' not in data:
            return jsonify({'error': 'Email required'}), 400
        
        email_body = """
        <html>
            <body style="font-family: Arial, sans-serif; color: #333;">
                <h2>Welcome to Clean Fashions Newsletter!</h2>
                <p>Thank you for subscribing. You'll now receive updates about:</p>
                <ul>
                    <li>New fashion collections</li>
                    <li>Exclusive discounts</li>
                    <li>Style tips and trends</li>
                </ul>
                <p style="margin-top: 1rem; color: #666; font-size: 0.9rem;">
                    Unsubscribe anytime by replying to any email.
                </p>
            </body>
        </html>
        """
        
        send_email(data['email'], "Welcome to Clean Fashions", email_body)
        
        return jsonify({
            'success': True,
            'message': 'Successfully subscribed to newsletter'
        }), 201
    
    except Exception as e:
        return jsonify({'error': str(e)}), 500


@app.route('/api/products', methods=['GET'])
def get_products():
    """Get all products (demo endpoint)"""
    products = [
        {'id': 1, 'name': 'Classic White T-Shirt', 'price': 45.00, 'category': 'Men'},
        {'id': 2, 'name': 'Black Skinny Jeans', 'price': 89.99, 'category': 'Men'},
        {'id': 3, 'name': 'Summer Floral Dress', 'price': 75.00, 'category': 'Women'},
        {'id': 4, 'name': 'Leather Brown Belt', 'price': 35.00, 'category': 'Accessories'},
        {'id': 5, 'name': "Women's Blazer", 'price': 129.99, 'category': 'Women'},
        {'id': 6, 'name': 'Athletic Shorts', 'price': 55.00, 'category': 'Men'},
        {'id': 7, 'name': 'Designer Sunglasses', 'price': 150.00, 'category': 'Accessories'},
        {'id': 8, 'name': 'White Sneakers', 'price': 99.99, 'category': 'Accessories'},
    ]
    return jsonify(products)


@app.errorhandler(404)
def not_found(error):
    """Handle 404 errors"""
    return jsonify({'error': 'Endpoint not found'}), 404


@app.errorhandler(500)
def server_error(error):
    """Handle server errors"""
    return jsonify({'error': 'Internal server error'}), 500


if __name__ == '__main__':
    print("🚀 Clean Fashions Backend Starting...")
    print(f"📧 Email: {MAIL_USERNAME if MAIL_USERNAME else 'Not configured'}")
    app.run(debug=True, port=5000)
