/* ========================================
   Clean Fashions - Main JavaScript
   ======================================== */

// Product data
const PRODUCTS = [
  {
    id: 1,
    name: 'Classic White T-Shirt',
    category: 'Men',
    price: 45.00,
    image: 'https://images.pexels.com/photos/3018395/pexels-photo-3018395.jpeg?auto=compress&cs=tinysrgb&w=800',
    rating: 4.5,
    reviews: 128,
    isNew: true,
    description: 'Premium cotton blend t-shirt perfect for everyday wear.'
  },
  {
    id: 2,
    name: 'Black Skinny Jeans',
    category: 'Men',
    price: 89.99,
    image: 'https://images.pexels.com/photos/3584621/pexels-photo-3584621.jpeg?auto=compress&cs=tinysrgb&w=800',
    rating: 4.8,
    reviews: 256,
    isNew: false,
    description: 'Comfortable and stylish skinny fit denim jeans.'
  },
  {
    id: 3,
    name: 'Summer Floral Dress',
    category: 'Women',
    price: 75.00,
    image: 'https://images.pexels.com/photos/1536619/pexels-photo-1536619.jpeg?auto=compress&cs=tinysrgb&w=800',
    rating: 4.7,
    reviews: 342,
    isNew: true,
    description: 'Light and breathable floral print summer dress.'
  },
  {
    id: 4,
    name: 'Leather Brown Belt',
    category: 'Accessories',
    price: 35.00,
    image: 'https://images.pexels.com/photos/3407903/pexels-photo-3407903.jpeg?auto=compress&cs=tinysrgb&w=800',
    rating: 4.6,
    reviews: 89,
    isNew: false,
    description: 'Premium leather belt with gold buckle.'
  },
  {
    id: 5,
    name: 'Women\'s Blazer',
    category: 'Women',
    price: 129.99,
    image: 'https://images.pexels.com/photos/5055742/pexels-photo-5055742.jpeg?auto=compress&cs=tinysrgb&w=800',
    rating: 4.9,
    reviews: 167,
    isNew: true,
    description: 'Professional and elegant blazer for work or casual wear.'
  },
  {
    id: 6,
    name: 'Athletic Shorts',
    category: 'Men',
    price: 55.00,
    image: 'https://images.pexels.com/photos/3408717/pexels-photo-3408717.jpeg?auto=compress&cs=tinysrgb&w=800',
    rating: 4.4,
    reviews: 95,
    isNew: false,
    description: 'Moisture-wicking shorts perfect for sports and fitness.'
  },
  {
    id: 7,
    name: 'Designer Sunglasses',
    category: 'Accessories',
    price: 150.00,
    image: 'https://images.pexels.com/photos/6624049/pexels-photo-6624049.jpeg?auto=compress&cs=tinysrgb&w=800',
    rating: 4.8,
    reviews: 203,
    isNew: true,
    description: 'Premium UV protection with elegant frame design.'
  },
  {
    id: 8,
    name: 'White Sneakers',
    category: 'Accessories',
    price: 99.99,
    image: 'https://images.pexels.com/photos/3945683/pexels-photo-3945683.jpeg?auto=compress&cs=tinysrgb&w=800',
    rating: 4.7,
    reviews: 318,
    isNew: false,
    description: 'Clean and versatile white sneakers for any outfit.'
  }
];

// Cart management
class Cart {
  constructor() {
    this.items = this.loadCart();
  }

  loadCart() {
    const saved = localStorage.getItem('cart');
    return saved ? JSON.parse(saved) : [];
  }

  saveCart() {
    localStorage.setItem('cart', JSON.stringify(this.items));
    this.updateCartCount();
  }

  addItem(productId, quantity = 1) {
    const product = PRODUCTS.find(p => p.id === productId);
    if (!product) return;

    const existingItem = this.items.find(item => item.id === productId);
    if (existingItem) {
      existingItem.quantity += quantity;
    } else {
      this.items.push({
        ...product,
        quantity
      });
    }
    this.saveCart();
  }

  removeItem(productId) {
    this.items = this.items.filter(item => item.id !== productId);
    this.saveCart();
  }

  updateQuantity(productId, quantity) {
    const item = this.items.find(item => item.id === productId);
    if (item) {
      item.quantity = quantity;
      if (item.quantity <= 0) {
        this.removeItem(productId);
      } else {
        this.saveCart();
      }
    }
  }

  getTotal() {
    return this.items.reduce((total, item) => total + (item.price * item.quantity), 0);
  }

  getItemCount() {
    return this.items.reduce((count, item) => count + item.quantity, 0);
  }

  clear() {
    this.items = [];
    this.saveCart();
  }

  updateCartCount() {
    const countElement = document.querySelector('.cart-count');
    const count = this.getItemCount();
    if (countElement) {
      if (count > 0) {
        countElement.textContent = count;
        countElement.style.display = 'flex';
      } else {
        countElement.style.display = 'none';
      }
    }
  }
}

const cart = new Cart();

// Google Authentication
function parseJwt(token) {
  const base64Url = token.split('.')[1];
  const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
  const jsonPayload = decodeURIComponent(
    atob(base64)
      .split('')
      .map((c) => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
      .join('')
  );
  return JSON.parse(jsonPayload);
}

function handleCredentialResponse(response) {
  const user = parseJwt(response.credential);
  const userDisplay = document.getElementById('logged-in-user');
  if (userDisplay) {
    userDisplay.textContent = `Signed in: ${user.name || user.email}`;
  }
  document.getElementById('g_id_button').style.display = 'none';
  document.getElementById('google-signout').style.display = 'inline-block';
}

function googleSignOut() {
  document.getElementById('g_id_button').style.display = 'inline-block';
  document.getElementById('google-signout').style.display = 'none';
  document.getElementById('logged-in-user').textContent = '';
  window.google.accounts.id.disableAutoSelect();
}

function initGoogleAuth() {
  if (!window.google || !window.google.accounts || !window.google.accounts.id) {
    return;
  }

  window.google.accounts.id.initialize({
    client_id: 'YOUR_GOOGLE_CLIENT_ID.apps.googleusercontent.com',
    callback: handleCredentialResponse,
  });

  window.google.accounts.id.renderButton(document.getElementById('g_id_button'), {
    theme: 'outline',
    size: 'small',
    type: 'standard',
    width: 180,
  });

  window.google.accounts.id.prompt();

  const signoutBtn = document.getElementById('google-signout');
  if (signoutBtn) {
    signoutBtn.addEventListener('click', googleSignOut);
  }
}

// Initialize cart count on page load
document.addEventListener('DOMContentLoaded', () => {
  cart.updateCartCount();
  initializePageFunctions();
  initGoogleAuth();
});

// Render products grid
function renderProducts(products = PRODUCTS) {
  const grid = document.querySelector('.products-grid');
  if (!grid) return;

  grid.innerHTML = products.map(product => `
    <div class="product-card" data-id="${product.id}">
      <div class="product-image">
        ${product.image.startsWith('http') ? `
          <img src="${product.image}" alt="${product.name}" loading="lazy" style="width:100%; height:100%; object-fit: cover;" onerror="this.src='data:image/svg+xml,%3Csvg xmlns=%22http://www.w3.org/2000/svg%22 width=%22256%22 height=%22256%22%3E%3Crect fill=%22%23ddd%22 width=%22256%22 height=%22256%22/%3E%3Ctext x=%2250%25%22 y=%2250%25%22 text-anchor=%22middle%22 dy=%22.3em%22 font-family=%22sans-serif%22 font-size=%2216%22 fill=%22%23999%22%3EImage unavailable%3C/text%3E%3C/svg%3E';" />
        ` : `<div style="font-size: 5rem;">${product.image}</div>`}
        ${product.isNew ? '<div class="product-badge">New</div>' : ''}
      </div>
      <div class="product-info">
        <div class="product-category">${product.category}</div>
        <div class="product-name">${product.name}</div>
        <div class="product-price">$${product.price.toFixed(2)}</div>
        <div class="product-rating">⭐ ${product.rating} (${product.reviews})</div>
        <div class="product-actions">
          <button class="add-to-cart-btn" data-id="${product.id}">Add to Cart</button>
          <button class="wishlist-btn" data-id="${product.id}">❤️</button>
        </div>
      </div>
    </div>
  `).join('');

  // Add event listeners
  document.querySelectorAll('.add-to-cart-btn').forEach(btn => {
    btn.addEventListener('click', (e) => {
      const productId = parseInt(e.target.dataset.id);
      cart.addItem(productId, 1);
      showNotification('Added to cart!');
    });
  });

  document.querySelectorAll('.wishlist-btn').forEach(btn => {
    btn.addEventListener('click', (e) => {
      e.target.style.opacity = e.target.style.opacity !== '1' ? '1' : '0.3';
    });
  });
}

// Product details page loader
function loadProductDetails() {
  const productId = parseInt(new URLSearchParams(window.location.search).get('id'));
  const product = PRODUCTS.find((p) => p.id === productId) || PRODUCTS[0];
  if (!product) return;

  const mainImageContainer = document.getElementById('product-main-image');
  const thumbImage = document.getElementById('product-thumb');

  if (mainImageContainer) {
    mainImageContainer.innerHTML = `
      <img src="${product.image}" alt="${product.name}" loading="lazy" style="width:100%;height:100%;object-fit:cover;" onerror="this.src='data:image/svg+xml,%3Csvg xmlns=%22http://www.w3.org/2000/svg%22 width=%22800%22 height=%22600%22%3E%3Crect fill=%22%23ddd%22 width=%22800%22 height=%22600%22/%3E%3Ctext x=%2250%25%22 y=%2250%25%22 text-anchor=%22middle%22 dy=%22.3em%22 font-family=%22sans-serif%22 font-size=%2224%22 fill=%22%23999%22%3EImage unavailable%3C/text%3E%3C/svg%3E';" />
    `;
  }

  if (thumbImage) {
    thumbImage.innerHTML = `
      <img src="${product.image}" alt="${product.name} thumbnail" loading="lazy" style="width:100%;height:100%;object-fit:cover;" onerror="this.src='data:image/svg+xml,%3Csvg xmlns=%22http://www.w3.org/2000/svg%22 width=%22120%22 height=%22100%22%3E%3Crect fill=%22%23ddd%22 width=%22120%22 height=%22100%22/%3E%3Ctext x=%2250%25%22 y=%2250%25%22 text-anchor=%22middle%22 dy=%22.3em%22 font-family=%22sans-serif%22 font-size=%2212%22 fill=%22%23999%22%3EImage%3C/text%3E%3C/svg%3E';" />
    `;
    thumbImage.addEventListener('click', () => {
      if (mainImageContainer) {
        mainImageContainer.querySelector('img').src = product.image;
      }
    });
  }

  const mapText = (id, value) => {
    const element = document.getElementById(id);
    if (element) element.textContent = value;
  };

  mapText('breadcrumb-product', product.name);
  mapText('product-category', product.category);
  mapText('product-name', product.name);
  mapText('product-rating', `⭐ ${product.rating}`);
  mapText('product-reviews', product.reviews);
  mapText('product-price', `$${product.price.toFixed(2)}`);
  mapText('product-description', product.description);
}

// Filter and sort products
function filterProducts() {
  const categorySelect = document.querySelector('.category-filter');
  const sortSelect = document.querySelector('.sort-filter');
  const searchInput = document.querySelector('.search-input');

  let filtered = [...PRODUCTS];

  // Filter by category
  if (categorySelect && categorySelect.value) {
    filtered = filtered.filter(p => p.category === categorySelect.value);
  }

  // Search
  if (searchInput && searchInput.value) {
    const query = searchInput.value.toLowerCase();
    filtered = filtered.filter(p => 
      p.name.toLowerCase().includes(query) || 
      p.category.toLowerCase().includes(query)
    );
  }

  // Sort
  if (sortSelect) {
    switch (sortSelect.value) {
      case 'price-low':
        filtered.sort((a, b) => a.price - b.price);
        break;
      case 'price-high':
        filtered.sort((a, b) => b.price - a.price);
        break;
      case 'popular':
        filtered.sort((a, b) => b.reviews - a.reviews);
        break;
      case 'rating':
        filtered.sort((a, b) => b.rating - a.rating);
        break;
    }
  }

  renderProducts(filtered);
}

// Render cart items
function renderCart() {
  const cartItems = document.querySelector('.cart-items');
  if (!cartItems) return;

  if (cart.items.length === 0) {
    cartItems.innerHTML = '<div style="padding: 2rem; text-align: center;">Your cart is empty</div>';
    return;
  }

  cartItems.innerHTML = cart.items.map(item => `
    <div class="cart-item" data-id="${item.id}">
      <div class="cart-item-image" style="font-size: 3rem;">${item.image}</div>
      <div class="cart-item-details">
        <h3>${item.name}</h3>
        <p>$${item.price.toFixed(2)}</p>
      </div>
      <div class="cart-item-quantity">
        <button onclick="updateQuantity(${item.id}, ${item.quantity - 1})">−</button>
        <input type="number" value="${item.quantity}" readonly>
        <button onclick="updateQuantity(${item.id}, ${item.quantity + 1})">+</button>
      </div>
      <div style="text-align: right;">
        <div style="font-weight: bold; margin-bottom: 0.5rem;">$${(item.price * item.quantity).toFixed(2)}</div>
        <button class="btn btn-dark" style="padding: 0.5rem 1rem; font-size: 0.85rem;" onclick="removeFromCart(${item.id})">Remove</button>
      </div>
    </div>
  `).join('');

  updateCartSummary();
}

function updateQuantity(productId, newQuantity) {
  if (newQuantity <= 0) {
    removeFromCart(productId);
  } else {
    cart.updateQuantity(productId, newQuantity);
    renderCart();
  }
}

function removeFromCart(productId) {
  cart.removeItem(productId);
  renderCart();
  if (cart.items.length === 0 && window.location.pathname.includes('cart')) {
    // Show empty cart message
  }
}

function updateCartSummary() {
  const subtotal = cart.getTotal();
  const shipping = subtotal > 100 ? 0 : 10;
  const total = subtotal + shipping;

  const summaryHTML = `
    <div class="summary-row">
      <span>Subtotal:</span>
      <span>$${subtotal.toFixed(2)}</span>
    </div>
    <div class="summary-row">
      <span>Shipping:</span>
      <span>${shipping === 0 ? 'FREE' : '$' + shipping.toFixed(2)}</span>
    </div>
    <div class="summary-row total">
      <span>Total:</span>
      <span>$${total.toFixed(2)}</span>
    </div>
  `;

  const summaryContainer = document.querySelector('.cart-summary');
  if (summaryContainer) {
    const existing = summaryContainer.querySelector('[class*="summary-row"]');
    if (existing) {
      existing.parentElement.innerHTML = summaryHTML;
    } else {
      summaryContainer.innerHTML += summaryHTML;
    }
  }
}

// Notification system
function showNotification(message, duration = 3000) {
  const notification = document.createElement('div');
  notification.style.cssText = `
    position: fixed;
    bottom: 20px;
    right: 20px;
    background-color: var(--success-color);
    color: white;
    padding: 1rem 1.5rem;
    border-radius: 4px;
    z-index: 1000;
    animation: slideIn 0.3s ease-out;
  `;
  notification.textContent = message;
  document.body.appendChild(notification);

  setTimeout(() => {
    notification.style.animation = 'slideOut 0.3s ease-out';
    setTimeout(() => notification.remove(), 300);
  }, duration);
}

// Form validation
function validateForm(formSelector) {
  const form = document.querySelector(formSelector);
  if (!form) return true;

  const inputs = form.querySelectorAll('input[required], select[required]');
  let isValid = true;

  inputs.forEach(input => {
    if (!input.value.trim()) {
      input.style.borderColor = 'var(--danger-color)';
      isValid = false;
    } else {
      input.style.borderColor = 'var(--border-color)';
    }
  });

  return isValid;
}

// Checkout progress
function updateCheckoutStep(stepNumber) {
  document.querySelectorAll('.step').forEach((step, index) => {
    if (index + 1 < stepNumber) {
      step.classList.add('completed');
      step.classList.remove('active');
    } else if (index + 1 === stepNumber) {
      step.classList.add('active');
      step.classList.remove('completed');
    } else {
      step.classList.remove('active', 'completed');
    }
  });
}

// Account management
function loadAccountPage(page) {
  const links = document.querySelectorAll('.account-menu a');
  links.forEach(link => link.classList.remove('active'));
  event.target.classList.add('active');

  // Load appropriate content based on page selected
  // This would typically load from a backend or stored data
}

// Initialize page-specific functions
function initializePageFunctions() {
  const path = window.location.pathname;

  // Shop page
  if (path.includes('shop')) {
    renderProducts();
    document.querySelector('.category-filter')?.addEventListener('change', filterProducts);
    document.querySelector('.sort-filter')?.addEventListener('change', filterProducts);
    document.querySelector('.search-input')?.addEventListener('input', filterProducts);
  }

  // Cart page
  if (path.includes('cart')) {
    renderCart();
    document.querySelector('.checkout-btn')?.addEventListener('click', () => {
      if (cart.items.length > 0) {
        window.location.href = 'checkout.html';
      }
    });
  }

  // Checkout page
  if (path.includes('checkout')) {
    updateCheckoutStep(1);
    setupCheckoutFlows();
  }

  // Account page
  if (path.includes('account')) {
    setupAccountPage();
  }

  // Product page
  if (path.includes('product')) {
    loadProductDetails();
  }
}

// Checkout flow setup
function setupCheckoutFlows() {
  const nextBtns = document.querySelectorAll('.next-step-btn');
  nextBtns.forEach((btn, index) => {
    btn.addEventListener('click', () => {
      const currentStep = index + 1;
      const formSelector = `.step-form-${currentStep}`;
      if (validateForm(formSelector)) {
        updateCheckoutStep(currentStep + 1);
        document.querySelectorAll('[class*="step-content"]').forEach(el => {
          el.classList.add('hidden');
        });
        const nextContent = document.querySelector(`.step-content-${currentStep + 1}`);
        if (nextContent) nextContent.classList.remove('hidden');
      } else {
        showNotification('Please fill all required fields', 3000);
      }
    });
  });
}

// Account page setup
function setupAccountPage() {
  const menuLinks = document.querySelectorAll('.account-menu a');
  menuLinks.forEach(link => {
    link.addEventListener('click', (e) => {
      e.preventDefault();
      menuLinks.forEach(l => l.classList.remove('active'));
      link.classList.add('active');

      const target = link.dataset.target;
      document.querySelectorAll('[class*="account-section"]').forEach(section => {
        section.classList.add('hidden');
      });
      const targetSection = document.querySelector(`.${target}`);
      if (targetSection) targetSection.classList.remove('hidden');
    });
  });

  // Load first menu item by default
  if (menuLinks.length > 0) {
    menuLinks[0].click();
  }
}

// Add CSS animations
const style = document.createElement('style');
style.textContent = `
  @keyframes slideIn {
    from {
      transform: translateX(400px);
// Backend API Integration
const API_BASE_URL = 'http://localhost:5000/api';

// Submit order to backend (triggers email confirmation)
async function submitOrderToBackend(customerEmail, customerName, shippingAddress) {
  try {
    const orderData = {
      customer_email: customerEmail,
      customer_name: customerName,
      items: cart.items,
      total: cart.getTotal(),
      shipping_address: shippingAddress
    };
    
    const response = await fetch(`${API_BASE_URL}/orders`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(orderData)
    });
    
    const result = await response.json();
    
    if (result.success) {
      showNotification(`✅ Order ${result.order_id} created! Confirmation email sent.`, 4000);
      cart.clear();
      return result.order_id;
    } else {
      showNotification(`⚠️ Order created but email failed: ${result.error}`, 4000);
      return null;
    }
  } catch (error) {
    console.error('Backend error:', error);
    showNotification('⚠️ Backend not available, but order will be processed locally', 3000);
    return null;
  }
}

// Submit contact form to backend
async function submitContactForm(name, email, subject, message) {
  try {
    const response = await fetch(`${API_BASE_URL}/contact`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name, email, subject, message })
    });
    
    const result = await response.json();
    return result.success;
  } catch (error) {
    console.error('Contact form error:', error);
    return false;
  }
}

// Newsletter signup with backend
async function submitNewsletterSignup(email) {
  try {
    const response = await fetch(`${API_BASE_URL}/newsletter`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email })
    });
    
    const result = await response.json();
    return result.success;
  } catch (error) {
    console.error('Newsletter error:', error);
    return false;
  }
}

// Fetch products from backend
async function fetchProductsFromBackend() {
  try {
    const response = await fetch(`${API_BASE_URL}/products`);
    return await response.json();
  } catch (error) {
    console.error('Error fetching products:', error);
    return PRODUCTS; // Fall back to local products
  }
}

      opacity: 0;
    }
    to {
      transform: translateX(0);
      opacity: 1;
    }
  }

  @keyframes slideOut {
    from {
      transform: translateX(0);
      opacity: 1;
    }
    to {
      transform: translateX(400px);
      opacity: 0;
    }
  }
`;
document.head.appendChild(style);
