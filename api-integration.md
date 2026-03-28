# Clean Fashions Backend API Integration

## Setup

1. **Install dependencies:**
```bash
pip install -r requirements.txt
```

2. **Configure email:**
   - Copy `.env.example` to `.env`
   - Add your Gmail credentials:
     - `MAIL_USERNAME`: your-email@gmail.com
     - `MAIL_PASSWORD`: [App Password from Google](https://myaccount.google.com/apppasswords)

3. **Run the server:**
```bash
python app.py
```

Server runs at: `http://localhost:5000`

---

## API Endpoints

### 1. Health Check
```
GET /api/health
```
Response:
```json
{"status": "ok", "message": "Clean Fashions API is running"}
```

---

### 2. Create Order (Send Confirmation Email)
```
POST /api/orders
Content-Type: application/json

{
  "customer_email": "john@example.com",
  "customer_name": "John Doe",
  "items": [
    {"id": 1, "name": "Classic White T-Shirt", "price": 45.00, "quantity": 2}
  ],
  "total": 90.00,
  "shipping_address": "123 Main St, New York, NY 10001"
}
```

Response:
```json
{
  "success": true,
  "order_id": "ORD-20260328143522",
  "message": "Order created and confirmation email sent",
  "timestamp": "2026-03-28T14:35:22.123456"
}
```

---

### 3. Get Order Status
```
GET /api/orders/{order_id}
```

---

### 4. Contact Form Submission
```
POST /api/contact
Content-Type: application/json

{
  "name": "John Doe",
  "email": "john@example.com",
  "subject": "Question about shipping",
  "message": "How long does shipping take?"
}
```

---

### 5. Newsletter Signup
```
POST /api/newsletter
Content-Type: application/json

{
  "email": "john@example.com"
}
```

---

### 6. Get All Products
```
GET /api/products
```

---

## Frontend Integration Example

**Update checkout to send order to backend:**

```javascript
// In script.js - checkout function
async function submitOrder(orderData) {
  try {
    const response = await fetch('http://localhost:5000/api/orders', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(orderData)
    });
    
    const result = await response.json();
    if (result.success) {
      alert(`Order confirmed! Order ID: ${result.order_id}`);
      // Redirect to confirmation page
      window.location.href = `confirmation.html?order=${result.order_id}`;
    }
  } catch (error) {
    console.error('Order error:', error);
    alert('Failed to process order');
  }
}
```

---

## Gmail Setup for Email Sending

1. Enable 2-Factor Authentication on your Google account
2. Generate an **App Password**: https://myaccount.google.com/apppasswords
3. Use the 16-character password in `.env`

---

## Environment Variables

```env
# Email
MAIL_SERVER=smtp.gmail.com
MAIL_PORT=587
MAIL_USERNAME=your-email@gmail.com
MAIL_PASSWORD=your-16-char-app-password
MAIL_FROM=noreply@cleanfashions.com

# Flask
FLASK_ENV=development
SECRET_KEY=your-secret-key-here
```

---

## Deployment

For production, update:
- FLASK_ENV to `production`
- Use a secure SECRET_KEY
- Use environment-based email credentials
- Deploy to Heroku, Railway, or similar

Example Heroku deployment:
```bash
heroku create clean-fashions-api
heroku config:set MAIL_USERNAME="your-email@gmail.com"
heroku config:set MAIL_PASSWORD="your-app-password"
git push heroku main
```
