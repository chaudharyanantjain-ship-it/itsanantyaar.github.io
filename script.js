import { initializeApp } from "https://www.gstatic.com/firebasejs/11.6.1/firebase-app.js";
import { getAuth, createUserWithEmailAndPassword, signInWithEmailAndPassword, onAuthStateChanged, signOut, RecaptchaVerifier, signInWithPhoneNumber } from "https://www.gstatic.com/firebasejs/11.6.1/firebase-auth.js";
import { getFirestore, collection, addDoc, onSnapshot, doc, deleteDoc, getDoc, setDoc, updateDoc } from "https://www.gstatic.com/firebasejs/11.6.1/firebase-firestore.js";

// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
    apiKey: "AIzaSyCuQEZZJplC6jWHlcTzbmuNhOYfvihpn5E",
    authDomain: "chaudhary-cleanenergy-183a8.firebaseapp.com",
    projectId: "chaudhary-cleanenergy-183a8",
    storageBucket: "chaudhary-cleanenergy-183a8.firebasestorage.app",
    messagingSenderId: "84964892092",
    appId: "1:84964892092:web:eda197231667904f81dfb9",
    measurementId: "G-N44TD7MXZK"
};
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);
const auth = getAuth(app);
let userId = null;
let confirmationResult = null; // To store the confirmation result for OTP verification

let products = [];

const ADMIN_PASSWORD = 'password123';
let cart = JSON.parse(localStorage.getItem('solarCart')) || {};

// Element references
const cartCountElement = document.getElementById('cart-count');
const productGallery = document.getElementById('product-gallery');
const productDetailsSection = document.getElementById('product-details-section');
const backToProductsBtn = document.getElementById('back-to-products-btn');
const productMainImage = document.getElementById('product-main-image');
const productThumbnails = document.getElementById('product-thumbnails');
const productDetailsName = document.getElementById('product-details-name');
const productDetailsCategory = document.getElementById('product-details-category');
const productDetailsPrice = document.getElementById('product-details-price');
const productDetailsDescription = document.getElementById('product-details-description');
const addToCartDetailsBtn = document.getElementById('add-to-cart-details-btn');
const cartModal = document.getElementById('cart-modal');
const closeCartBtn = document.getElementById('close-cart-btn');
const cartItemsContainer = document.getElementById('cart-items');
const cartTotalElement = document.getElementById('cart-total');
const cartLink = document.getElementById('cart-link');
const modalCheckoutBtn = document.getElementById('checkout-btn');
const productsLink = document.getElementById('products-link');
const calculatorLink = document.getElementById('calculator-link');
const contactLink = document.getElementById('contact-link');
const aboutLink = document.getElementById('about-link');
const adminLink = document.getElementById('admin-link');
const dealersLink = document.getElementById('dealers-link');
const loginBtn = document.getElementById('login-btn');
const logoutBtn = document.getElementById('logout-btn');

const mainContent = document.getElementById('main-content');

const loginModal = document.getElementById('login-modal');
const closeLoginModalBtn = document.getElementById('close-login-modal');
const loginOptionsContainer = document.getElementById('login-options-container');
const consumerLoginCard = document.getElementById('consumer-login-card');
const consumerSignupCard = document.getElementById('consumer-signup-card');
const otpLoginCard = document.getElementById('otp-login-card');
const adminLoginCard = document.getElementById('admin-login-card');
const dealerLoginCard = document.getElementById('dealer-login-card');

const showConsumerLoginBtn = document.getElementById('show-consumer-login-btn');
const showOtpLoginBtn = document.getElementById('show-otp-login-btn');
const showAdminLoginBtn = document.getElementById('show-admin-login-btn');
const showDealerLoginBtn = document.getElementById('show-dealer-login-btn');
const showSignupFormBtn = document.getElementById('show-signup-form');
const showLoginFormBtn = document.getElementById('show-login-form');
const consumerLoginForm = document.getElementById('consumer-login-form');
const consumerSignupForm = document.getElementById('consumer-signup-form');
const consumerLoginErrorMsg = document.getElementById('consumer-login-error');
const consumerSignupErrorMsg = document.getElementById('consumer-signup-error');

const otpForm = document.getElementById('otp-form');
const phoneNumberInput = document.getElementById('phone-number');
const phoneInputContainer = document.getElementById('phone-input-container');
const otpInputContainer = document.getElementById('otp-input-container');
const otpCodeInput = document.getElementById('otp-code');
const otpErrorMsg = document.getElementById('otp-error-message');

const solarCalculatorSection = document.getElementById('solar-calculator-section');
const checkoutSummary = document.getElementById('checkout-summary');
const checkoutTotal = document.getElementById('checkout-total');
const checkoutForm = document.getElementById('checkout-form');
const contactForm = document.getElementById('contact-form');
const solarCalculatorForm = document.getElementById('solar-calculator-form');
const applianceListDiv = document.getElementById('appliance-list');
const calculatorResult = document.getElementById('calculator-result');
const filterButtons = document.getElementById('filter-buttons');
const addProductForm = document.getElementById('add-product-form');
const adminProductList = document.getElementById('admin-product-list');
const adminOrdersList = document.getElementById('admin-orders-list');
const adminComplaintsList = document.getElementById('admin-complaints-list');
const noOrdersMessage = document.getElementById('no-orders-message');
const noComplaintsMessage = document.getElementById('no-complaints-message');
const adminSection = document.getElementById('admin-section');
const adminContent = document.getElementById('admin-content');
const createDealerForm = document.getElementById('create-dealer-form');
const createDealerError = document.getElementById('dealer-creation-error');
const adminLogoutBtn = document.getElementById('admin-logout-btn');
const dealersSection = document.getElementById('dealers-section');
const dealersContent = document.getElementById('dealers-content');
const dealersOrdersList = document.getElementById('dealers-orders-list');
const dealersComplaintsList = document.getElementById('dealers-complaints-list');
const dealersNoOrdersMessage = document.getElementById('dealers-no-orders-message');
const dealersNoComplaintsMessage = document.getElementById('dealers-no-complaints-message');
const dealersLogoutBtn = document.getElementById('dealers-logout-btn');
const messageBox = document.getElementById('message-box');
const messageText = document.getElementById('message-text');
const messageBoxOkBtn = document.getElementById('message-box-ok-btn');

// --- Custom message box function ---
const showMessageBox = (message) => {
    messageText.textContent = message;
    messageBox.classList.remove('hidden');
};

messageBoxOkBtn.addEventListener('click', () => {
    messageBox.classList.add('hidden');
});
// --- End custom message box function ---

function updateNavLinks(userRole) {
    // Hide all user-specific links by default
    productsLink.classList.add('hidden');
    calculatorLink.classList.add('hidden');
    contactLink.classList.add('hidden');
    aboutLink.classList.add('hidden');
    cartLink.classList.add('hidden');
    adminLink.classList.add('hidden');
    dealersLink.classList.add('hidden');
    logoutBtn.classList.add('hidden');
    loginBtn.classList.add('hidden');
    
    // Show links based on user role or public access
    if (!userRole) {
        // Public user
        productsLink.classList.remove('hidden');
        calculatorLink.classList.remove('hidden');
        contactLink.classList.remove('hidden');
        aboutLink.classList.remove('hidden');
        loginBtn.classList.remove('hidden');
    } else if (userRole === 'admin') {
        adminLink.classList.remove('hidden');
        logoutBtn.classList.remove('hidden');
        productsLink.classList.remove('hidden');
        calculatorLink.classList.remove('hidden');
        contactLink.classList.remove('hidden');
        aboutLink.classList.remove('hidden');
    } else if (userRole === 'dealer') {
        dealersLink.classList.remove('hidden');
        logoutBtn.classList.remove('hidden');
        productsLink.classList.remove('hidden');
        calculatorLink.classList.remove('hidden');
        contactLink.classList.remove('hidden');
        aboutLink.classList.remove('hidden');
    } else if (userRole === 'consumer') {
        productsLink.classList.remove('hidden');
        calculatorLink.classList.remove('hidden');
        contactLink.classList.remove('hidden');
        aboutLink.classList.remove('hidden');
        cartLink.classList.remove('hidden');
        logoutBtn.classList.remove('hidden');
    }
}

onAuthStateChanged(auth, async (user) => {
    if (user) {
        userId = user.uid;
        const userDoc = await getDoc(doc(db, 'users', userId));
        let userRole = userDoc.exists() ? userDoc.data().role : 'consumer';
        updateNavLinks(userRole);
        if (userRole === 'admin') {
            showSection('admin-section');
        } else if (userRole === 'dealer') {
            showSection('dealers-section');
        } else {
            showSection('product-gallery-section');
        }
        setupRealtimeListeners();
    } else {
        userId = null;
        updateNavLinks(null);
        showSection('product-gallery-section');
    }
});

function setupRealtimeListeners() {
    // Products Listener
    onSnapshot(collection(db, 'products'), (snapshot) => {
        products = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        renderProducts();
        renderAdminProducts();
    });
    // Orders Listener
    onSnapshot(collection(db, 'orders'), (snapshot) => {
        const orders = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        renderAdminOrders(orders);
        renderDealersOrders(orders);
    });
    // Complaints Listener
    onSnapshot(collection(db, 'complaints'), (snapshot) => {
        const complaints = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        renderAdminComplaints(complaints);
        renderDealersComplaints(complaints);
    });
}

const showSection = (sectionId) => {
    // First, hide all sections
    document.getElementById('product-gallery-section').classList.add('hidden');
    document.getElementById('product-details-section').classList.add('hidden');
    document.getElementById('checkout-section').classList.add('hidden');
    document.getElementById('solar-calculator-section').classList.add('hidden');
    document.getElementById('contact-section').classList.add('hidden');
    document.getElementById('about-section').classList.add('hidden');
    document.getElementById('admin-section').classList.add('hidden');
    document.getElementById('dealers-section').classList.add('hidden');
    document.getElementById('login-modal').classList.add('hidden');

    // Then, show the requested section
    const targetSection = document.getElementById(sectionId);
    if (targetSection) {
        targetSection.classList.remove('hidden');
    }
};

const renderProducts = (filter = 'all') => {
    productGallery.innerHTML = '';
    const filteredProducts = products.filter(product => {
        return filter === 'all' || product.category === filter;
    });

    if (filteredProducts.length === 0) {
        productGallery.innerHTML = `<p class="text-center text-gray-600 text-lg col-span-full">No products found in this category. Please add some from the Admin Dashboard.</p>`;
    }

    filteredProducts.forEach(product => {
        const productCard = document.createElement('div');
        productCard.className = 'product-card';
        productCard.innerHTML = `
            <a href="#" class="product-link" data-product-id="${product.id}">
                <img src="${product.imageUrls[0]}" onerror="this.onerror=null;this.src='https://placehold.co/400x300/e2e8f0/e2e8f0?text=Image+Not+Found';" alt="${product.name}" class="w-full">
            </a>
            <div class="p-4">
                <a href="#" class="product-link" data-product-id="${product.id}">
                    <h3 class="product-name">${product.name}</h3>
                </a>
                <p class="product-category">Category: ${product.category}</p>
                <p class="product-price">₹${product.price.toLocaleString('en-IN')}</p>
            </div>
            <div class="p-4 pt-0">
                <button class="add-to-cart-btn btn w-full btn-primary" data-product-id="${product.id}">Add to Cart</button>
            </div>
        `;
        productGallery.appendChild(productCard);
    });
};

const renderProductDetails = (productId) => {
    const product = products.find(p => p.id == productId);
    if (!product) return;

    productMainImage.src = product.imageUrls[0];
    productMainImage.alt = product.name;
    productDetailsName.textContent = product.name;
    productDetailsCategory.textContent = `Category: ${product.category}`;
    productDetailsPrice.textContent = `₹${product.price.toLocaleString('en-IN')}`;
    productDetailsDescription.textContent = product.description;
    addToCartDetailsBtn.dataset.productId = product.id;

    productThumbnails.innerHTML = '';
    product.imageUrls.forEach((url, index) => {
        if (url) {
            const img = document.createElement('img');
            img.src = url;
            img.onerror = "this.onerror=null;this.src='https://placehold.co/100x100/e2e8f0/e2e8f0?text=Image+Not+Found';";
            img.alt = `${product.name} thumbnail ${index + 1}`;
            img.className = `w-16 h-16 rounded-md object-cover thumbnail-image ${index === 0 ? 'active' : ''}`;
            img.dataset.url = url;
            productThumbnails.appendChild(img);
        }
    });
    showSection('product-details-section');
};

const renderAdminProducts = () => {
    adminProductList.innerHTML = '';
    if (products.length === 0) {
        adminProductList.innerHTML = `<p class="text-center text-gray-600">No products added yet.</p>`;
    }
    products.forEach(product => {
        const productItem = document.createElement('div');
        productItem.className = 'flex justify-between items-center bg-gray-50 p-4 rounded-lg shadow-sm';
        productItem.innerHTML = `
            <div class="flex-1 mr-4">
                <p class="font-semibold text-gray-800">${product.name}</p>
                <p class="text-sm text-gray-600">₹${product.price.toLocaleString('en-IN')} | Category: ${product.category}</p>
            </div>
            <button class="btn btn-secondary delete-product-btn" data-product-id="${product.id}">Delete</button>
        `;
        adminProductList.appendChild(productItem);
    });
};

const renderAdminOrders = (orders) => {
    adminOrdersList.innerHTML = '';
    if (orders.length === 0) {
        noOrdersMessage.classList.remove('hidden');
    } else {
        noOrdersMessage.classList.add('hidden');
        orders.forEach(order => {
            const orderItem = document.createElement('div');
            orderItem.className = 'bg-gray-50 p-4 rounded-lg shadow-sm space-y-2';
            const orderItemsHtml = order.items.map(item => `
                <li class="text-sm text-gray-600">${item.name} x ${item.quantity} (₹${(item.price * item.quantity).toLocaleString('en-IN')})</li>
            `).join('');

            orderItem.innerHTML = `
                <div class="flex justify-between items-center">
                    <h4 class="font-semibold text-gray-800">Order ID: ${order.id}</h4>
                    <button class="text-red-500 hover:text-red-700 delete-order-btn" data-order-id="${order.id}">Delete</button>
                </div>
                <p class="text-sm text-gray-700"><strong>Customer:</strong> ${order.customerName}</p>
                <p class="text-sm text-gray-700"><strong>Email:</strong> ${order.email}</p>
                <p class="text-sm text-gray-700"><strong>Address:</strong> ${order.address}</p>
                <p class="font-semibold text-gray-800">Total: ₹${order.total.toLocaleString('en-IN')}</p>
                <ul class="list-disc list-inside mt-2 text-sm">
                    ${orderItemsHtml}
                </ul>
            `;
            adminOrdersList.appendChild(orderItem);
        });
    }
};

const renderAdminComplaints = (complaints) => {
    adminComplaintsList.innerHTML = '';
    if (complaints.length === 0) {
        noComplaintsMessage.classList.remove('hidden');
    } else {
        noComplaintsMessage.classList.add('hidden');
        complaints.forEach(complaint => {
            const complaintItem = document.createElement('div');
            complaintItem.className = 'bg-gray-50 p-4 rounded-lg shadow-sm space-y-2';
            complaintItem.innerHTML = `
                <div class="flex justify-between items-center">
                    <h4 class="font-semibold text-gray-800">Complaint from ${complaint.name}</h4>
                    <button class="text-red-500 hover:text-red-700 delete-complaint-btn" data-complaint-id="${complaint.id}">Delete</button>
                </div>
                <p class="text-sm text-gray-700"><strong>Email:</strong> ${complaint.email}</p>
                <p class="text-sm text-gray-700"><strong>Message:</strong> ${complaint.message}</p>
            `;
            adminComplaintsList.appendChild(complaintItem);
        });
    }
};

const renderDealersOrders = (orders) => {
    dealersOrdersList.innerHTML = '';
    if (orders.length === 0) {
        dealersNoOrdersMessage.classList.remove('hidden');
    } else {
        dealersNoOrdersMessage.classList.add('hidden');
        orders.forEach(order => {
            const orderItem = document.createElement('div');
            orderItem.className = 'bg-gray-50 p-4 rounded-lg shadow-sm space-y-2';
            const orderItemsHtml = order.items.map(item => `
                <li class="text-sm text-gray-600">${item.name} x ${item.quantity} (₹${(item.price * item.quantity).toLocaleString('en-IN')})</li>
            `).join('');

            orderItem.innerHTML = `
                <div class="flex justify-between items-center">
                    <h4 class="font-semibold text-gray-800">Order ID: ${order.id}</h4>
                </div>
                <p class="text-sm text-gray-700"><strong>Customer:</strong> ${order.customerName}</p>
                <p class="text-sm text-gray-700"><strong>Email:</strong> ${order.email}</p>
                <p class="text-sm text-gray-700"><strong>Address:</strong> ${order.address}</p>
                <p class="font-semibold text-gray-800">Total: ₹${order.total.toLocaleString('en-IN')}</p>
                <ul class="list-disc list-inside mt-2 text-sm">
                    ${orderItemsHtml}
                </ul>
            `;
            dealersOrdersList.appendChild(orderItem);
        });
    }
};

const renderDealersComplaints = (complaints) => {
    dealersComplaintsList.innerHTML = '';
    if (complaints.length === 0) {
        dealersNoComplaintsMessage.classList.remove('hidden');
    } else {
        dealersNoComplaintsMessage.classList.add('hidden');
        complaints.forEach(complaint => {
            const complaintItem = document.createElement('div');
            complaintItem.className = 'bg-gray-50 p-4 rounded-lg shadow-sm space-y-2';
            complaintItem.innerHTML = `
                <div class="flex justify-between items-center">
                    <h4 class="font-semibold text-gray-800">Complaint from ${complaint.name}</h4>
                </div>
                <p class="text-sm text-gray-700"><strong>Email:</strong> ${complaint.email}</p>
                <p class="text-sm text-gray-700"><strong>Message:</strong> ${complaint.message}</p>
            `;
            dealersComplaintsList.appendChild(complaintItem);
        });
    }
};

const addToCart = (productId) => {
    const product = products.find(p => product.id == productId);
    if (!product) return;
    
    if (cart[productId]) {
        cart[productId].quantity++;
    } else {
        cart[productId] = { ...product, quantity: 1, imageUrl: product.imageUrls[0] };
    }
    saveCart();
    showMessageBox('Product added to cart!');
};

const saveCart = () => {
    localStorage.setItem('solarCart', JSON.stringify(cart));
    updateCartCount();
    renderCart();
};

const increaseQuantity = (productId) => {
    if (cart[productId]) {
        cart[productId].quantity++;
        saveCart();
    }
};

const decreaseQuantity = (productId) => {
    if (cart[productId] && cart[productId].quantity > 1) {
        cart[productId].quantity--;
        saveCart();
    }
};

const removeItem = (productId) => {
    delete cart[productId];
    saveCart();
};

const updateCartCount = () => {
    let totalItems = 0;
    for (const productId in cart) {
        totalItems += cart[productId].quantity;
    }
    cartCountElement.textContent = totalItems;
};

const renderCart = () => {
    cartItemsContainer.innerHTML = '';
    let total = 0;
    
    if (Object.keys(cart).length === 0) {
        cartItemsContainer.innerHTML = `<p class="text-center text-gray-500 py-4">Your cart is empty. Add some products!</p>`;
        modalCheckoutBtn.disabled = true;
        modalCheckoutBtn.classList.add('opacity-50', 'cursor-not-allowed');
    } else {
        modalCheckoutBtn.disabled = false;
        modalCheckoutBtn.classList.remove('opacity-50', 'cursor-not-allowed');
        for (const id in cart) {
            const item = cart[id];
            const itemTotal = item.price * item.quantity;
            total += itemTotal;
            const itemElement = document.createElement('div');
            itemElement.className = 'flex items-center py-3 border-b border-gray-200 last:border-b-0';
            itemElement.innerHTML = `
                <img src="${item.imageUrl}" onerror="this.onerror=null;this.src='https://placehold.co/100x100/e2e8f0/e2e8f0?text=Image+Not+Found';" alt="${item.name}" class="w-16 h-16 rounded-md mr-4 object-cover">
                <div class="flex-1 text-sm">
                    <h4 class="font-semibold text-gray-800">${item.name}</h4>
                    <p class="text-gray-600">₹${item.price.toLocaleString('en-IN')} each</p>
                </div>
                <div class="flex items-center space-x-2">
                    <button class="text-xl font-bold text-gray-500 hover:text-gray-800 focus:outline-none" data-action="decrease" data-product-id="${item.id}">-</button>
                    <span class="font-bold w-6 text-center text-gray-800">${item.quantity}</span>
                    <button class="text-xl font-bold text-gray-500 hover:text-gray-800 focus:outline-none" data-action="increase" data-product-id="${item.id}">+</button>
                </div>
                <button class="ml-4 text-red-500 hover:text-red-700 focus:outline-none" data-action="remove" data-product-id="${item.id}">
                    <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                        <path fill-rule="evenodd" d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.728-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm6 0a1 1 0 012 0v6a1 1 0 11-2 0V8z" clip-rule="evenodd" />
                    </svg>
                </button>
            `;
            cartItemsContainer.appendChild(itemElement);
        }
    }
    
    cartTotalElement.textContent = `Total: ₹${total.toLocaleString('en-IN')}`;
};

const renderCheckoutSummary = () => {
    checkoutSummary.innerHTML = '';
    let total = 0;
    
    if (Object.keys(cart).length === 0) {
        checkoutSummary.innerHTML = `<p class="text-center text-gray-500 py-4">Your cart is empty.</p>`;
    } else {
        for (const id in cart) {
            const item = cart[id];
            const itemTotal = item.price * item.quantity;
            total += itemTotal;
            const itemElement = document.createElement('div');
            itemElement.className = 'flex justify-between items-center py-2';
            itemElement.innerHTML = `
                <p class="font-semibold text-gray-800">${item.name} <span class="text-gray-500 text-sm">x${item.quantity}</span></p>
                <p class="font-semibold text-gray-800">₹${itemTotal.toLocaleString('en-IN')}</p>
            `;
            checkoutSummary.appendChild(itemElement);
        }
    }
    checkoutTotal.textContent = `Total: ₹${total.toLocaleString('en-IN')}`;
};

// Event Listeners for Nav Links
productsLink.addEventListener('click', (e) => {
    e.preventDefault();
    showSection('product-gallery-section');
});

calculatorLink.addEventListener('click', (e) => {
    e.preventDefault();
    showSection('solar-calculator-section');
});

contactLink.addEventListener('click', (e) => {
    e.preventDefault();
    showSection('contact-section');
});

aboutLink.addEventListener('click', (e) => {
    e.preventDefault();
    showSection('about-section');
});

adminLink.addEventListener('click', (e) => {
    e.preventDefault();
    showSection('admin-section');
});

dealersLink.addEventListener('click', (e) => {
    e.preventDefault();
    showSection('dealers-section');
});

loginBtn.addEventListener('click', () => {
    loginModal.classList.remove('hidden');
    loginOptionsContainer.classList.remove('hidden');
    consumerLoginCard.classList.add('hidden');
    consumerSignupCard.classList.add('hidden');
    otpLoginCard.classList.add('hidden');
    adminLoginCard.classList.add('hidden');
    dealerLoginCard.classList.add('hidden');
});

closeLoginModalBtn.addEventListener('click', () => {
    loginModal.classList.add('hidden');
});

showConsumerLoginBtn.addEventListener('click', () => {
    loginOptionsContainer.classList.add('hidden');
    consumerLoginCard.classList.remove('hidden');
    consumerLoginErrorMsg.textContent = '';
});

showOtpLoginBtn.addEventListener('click', () => {
    loginOptionsContainer.classList.add('hidden');
    otpLoginCard.classList.remove('hidden');
    otpErrorMsg.textContent = '';
});

showAdminLoginBtn.addEventListener('click', () => {
    loginOptionsContainer.classList.add('hidden');
    adminLoginCard.classList.remove('hidden');
    document.getElementById('admin-password').value = '';
    document.getElementById('admin-login-error').textContent = '';
});

showDealerLoginBtn.addEventListener('click', () => {
    loginOptionsContainer.classList.add('hidden');
    dealerLoginCard.classList.remove('hidden');
    document.getElementById('dealers-email').value = '';
    document.getElementById('dealers-password').value = '';
    document.getElementById('dealers-login-error').textContent = '';
});

showSignupFormBtn.addEventListener('click', (e) => {
    e.preventDefault();
    consumerLoginCard.classList.add('hidden');
    consumerSignupCard.classList.remove('hidden');
    consumerSignupErrorMsg.textContent = '';
});

showLoginFormBtn.addEventListener('click', (e) => {
    e.preventDefault();
    consumerSignupCard.classList.add('hidden');
    consumerLoginCard.classList.remove('hidden');
    consumerLoginErrorMsg.textContent = '';
});

productGallery.addEventListener('click', (e) => {
    const productLink = e.target.closest('.product-link');
    if (productLink) {
        e.preventDefault();
        const productId = productLink.dataset.productId;
        renderProductDetails(productId);
    } else if (e.target.classList.contains('add-to-cart-btn')) {
        const productId = e.target.dataset.productId;
        addToCart(productId);
    }
});

filterButtons.addEventListener('click', (e) => {
    const filter = e.target.dataset.filter;
    if (filter) {
        renderProducts(filter);
        document.querySelectorAll('#filter-buttons .filter-button').forEach(btn => {
            btn.classList.remove('active');
        });
        e.target.classList.add('active');
    }
});

cartLink.addEventListener('click', (e) => {
    e.preventDefault();
    renderCart();
    cartModal.classList.remove('hidden');
});

closeCartBtn.addEventListener('click', () => {
    cartModal.classList.add('hidden');
});

cartItemsContainer.addEventListener('click', (e) => {
    const button = e.target.closest('button');
    if (button) {
        const action = button.dataset.action;
        const productId = button.dataset.productId;
        
        if (action === 'increase') {
            increaseQuantity(productId);
        } else if (action === 'decrease') {
            decreaseQuantity(productId);
        } else if (action === 'remove') {
            removeItem(productId);
        }
    }
});

modalCheckoutBtn.addEventListener('click', () => {
    cartModal.classList.add('hidden');
    renderCheckoutSummary();
    showSection('checkout-section');
});

adminLoginForm.addEventListener('submit', handleAdminLogin);
adminLogoutBtn.addEventListener('click', handleLogout);
dealersLoginForm.addEventListener('submit', handleDealerLogin);
dealersLogoutBtn.addEventListener('click', handleLogout);
createDealerForm.addEventListener('submit', handleCreateDealer);

consumerSignupForm.addEventListener('submit', handleConsumerSignup);
consumerLoginForm.addEventListener('submit', handleConsumerLogin);
otpLoginCard.querySelector('#send-otp-btn').addEventListener('click', handleSendOtp);
otpLoginCard.querySelector('#verify-otp-btn').addEventListener('click', handleVerifyOtp);
logoutBtn.addEventListener('click', handleLogout);
addProductForm.addEventListener('submit', handleAddProduct);
adminProductList.addEventListener('click', handleDeleteProduct);
adminOrdersList.addEventListener('click', handleDeleteOrder);
adminComplaintsList.addEventListener('click', handleDeleteComplaint);
checkoutForm.addEventListener('submit', handleCheckout);
contactForm.addEventListener('submit', handleContactForm);

backToProductsBtn.addEventListener('click', () => {
    showSection('product-gallery-section');
});

addToCartDetailsBtn.addEventListener('click', (e) => {
    const productId = e.target.dataset.productId;
    addToCart(productId);
});

productThumbnails.addEventListener('click', (e) => {
    if (e.target.tagName === 'IMG') {
        document.querySelectorAll('.thumbnail-image').forEach(img => img.classList.remove('active'));
        e.target.classList.add('active');
        document.getElementById('product-main-image').src = e.target.dataset.url;
    }
});

solarCalculatorForm.addEventListener('submit', handleSolarCalculator);
applianceListDiv.addEventListener('change', (e) => {
    if (e.target.type === 'checkbox' && e.target.name === 'appliance') {
        const idSlug = e.target.dataset.applianceName.toLowerCase().replace(/[\s\(\)]/g, '-').replace(/[-]{2,}/g, '-');
        const quantityInput = document.getElementById(`quantity-${idSlug}`);
        quantityInput.disabled = !e.target.checked;
        if(e.target.checked) {
            quantityInput.value = '1';
        }
    }
});

document.addEventListener('DOMContentLoaded', () => {
    renderApplianceList();
    updateCartCount();
    document.querySelector('#filter-buttons .filter-button[data-filter="all"]').classList.add('active');
});

async function handleAdminLogin(e) {
    e.preventDefault();
    const password = document.getElementById('admin-password').value;
    const adminLoginError = document.getElementById('admin-login-error');
    adminLoginError.classList.add('hidden');
    if (password === ADMIN_PASSWORD) {
        try {
            const adminEmail = 'admin@yourcompany.com';
            const adminPass = 'admin_password_placeholder';
            const userCredential = await signInWithEmailAndPassword(auth, adminEmail, adminPass);
            await setDoc(doc(db, 'users', userCredential.user.uid), { role: 'admin' }, { merge: true });
            loginModal.classList.add('hidden');
            showMessageBox('Admin logged in successfully!');
        } catch (error) {
            if (error.code === 'auth/user-not-found' || error.code === 'auth/wrong-password') {
                try {
                   const userCredential = await createUserWithEmailAndPassword(auth, 'admin@yourcompany.com', 'admin_password_placeholder');
                   await setDoc(doc(db, 'users', userCredential.user.uid), { role: 'admin' });
                   showMessageBox('Admin account created and logged in successfully!');
                   loginModal.classList.add('hidden');
                } catch (creationError) {
                    adminLoginError.textContent = 'Error logging in as admin. Check the console for details.';
                    adminLoginError.classList.remove('hidden');
                    console.error("Admin creation failed:", creationError);
                }
            } else {
                adminLoginError.textContent = error.message;
                adminLoginError.classList.remove('hidden');
            }
        }
    } else {
        adminLoginError.textContent = 'Incorrect password.';
        adminLoginError.classList.remove('hidden');
    }
}

async function handleDealerLogin(e) {
    e.preventDefault();
    const email = document.getElementById('dealers-email').value;
    const password = document.getElementById('dealers-password').value;
    document.getElementById('dealers-login-error').classList.add('hidden');
    
    try {
        const userCredential = await signInWithEmailAndPassword(auth, email, password);
        const userDoc = await getDoc(doc(db, 'users', userCredential.user.uid));
        if (userDoc.exists() && userDoc.data().role === 'dealer') {
            loginModal.classList.add('hidden');
            showMessageBox('Dealer logged in successfully!');
        } else {
            await signOut(auth);
            document.getElementById('dealers-login-error').textContent = "Invalid email or password.";
            document.getElementById('dealers-login-error').classList.remove('hidden');
        }
    } catch (error) {
        document.getElementById('dealers-login-error').textContent = error.message;
        document.getElementById('dealers-login-error').classList.remove('hidden');
    }
}

async function handleCreateDealer(e) {
    e.preventDefault();
    document.getElementById('dealer-creation-error').classList.add('hidden');
    const email = document.getElementById('dealer-email').value;
    const password = document.getElementById('dealer-password').value;
    try {
        const userCredential = await createUserWithEmailAndPassword(auth, email, password);
        await setDoc(doc(db, 'users', userCredential.user.uid), { role: 'dealer' });
        document.getElementById('create-dealer-form').reset();
        showMessageBox(`Dealer account created successfully for ${email}.`);
    } catch (error) {
        document.getElementById('dealer-creation-error').textContent = error.message;
        document.getElementById('dealer-creation-error').classList.remove('hidden');
    }
}

async function handleConsumerSignup(e) {
    e.preventDefault();
    const email = document.getElementById('signup-email').value;
    const password = document.getElementById('signup-password').value;
    document.getElementById('consumer-signup-error').classList.add('hidden');

    try {
        const userCredential = await createUserWithEmailAndPassword(auth, email, password);
        await setDoc(doc(db, 'users', userCredential.user.uid), { role: 'consumer' });
        showMessageBox('Account created successfully! You are now logged in.');
        loginModal.classList.add('hidden');
    } catch (error) {
        document.getElementById('consumer-signup-error').textContent = error.message;
        document.getElementById('consumer-signup-error').classList.remove('hidden');
    }
}

async function handleConsumerLogin(e) {
    e.preventDefault();
    const email = document.getElementById('login-email').value;
    const password = document.getElementById('login-password').value;
    document.getElementById('consumer-login-error').classList.add('hidden');

    try {
        const userCredential = await signInWithEmailAndPassword(auth, email, password);
        const userDoc = await getDoc(doc(db, 'users', userCredential.user.uid));
        if (userDoc.exists() && userDoc.data().role === 'consumer') {
            showMessageBox('Logged in successfully!');
            loginModal.classList.add('hidden');
        } else {
            await signOut(auth);
            document.getElementById('consumer-login-error').textContent = "Invalid email or password.";
            document.getElementById('consumer-login-error').classList.remove('hidden');
        }
    } catch (error) {
        document.getElementById('consumer-login-error').textContent = error.message;
        document.getElementById('consumer-login-error').classList.remove('hidden');
    }
}

async function handleSendOtp(e) {
    e.preventDefault();
    const otpErrorMsg = document.getElementById('otp-error-message');
    otpErrorMsg.classList.add('hidden');
    const phoneNumber = document.getElementById('phone-number').value;
    if (!phoneNumber) {
        otpErrorMsg.textContent = 'Please enter a valid phone number.';
        otpErrorMsg.classList.remove('hidden');
        return;
    }

    try {
        window.recaptchaVerifier = new RecaptchaVerifier(auth, 'recaptcha-container', {
            'size': 'invisible',
            'callback': (response) => {
                // reCAPTCHA solved, continue with phone sign-in
            }
        });
        const appVerifier = window.recaptchaVerifier;
        confirmationResult = await signInWithPhoneNumber(auth, phoneNumber, appVerifier);
        document.getElementById('phone-input-container').classList.add('hidden');
        document.getElementById('otp-input-container').classList.remove('hidden');
        showMessageBox('OTP has been sent to your phone.');
    } catch (error) {
        console.error("Error sending OTP:", error);
        otpErrorMsg.textContent = error.message;
        otpErrorMsg.classList.remove('hidden');
    }
}

async function handleVerifyOtp(e) {
    e.preventDefault();
    const otpErrorMsg = document.getElementById('otp-error-message');
    otpErrorMsg.classList.add('hidden');
    const otpCode = document.getElementById('otp-code').value;
    if (!otpCode) {
        otpErrorMsg.textContent = 'Please enter the verification code.';
        otpErrorMsg.classList.remove('hidden');
        return;
    }
    try {
        const result = await confirmationResult.confirm(otpCode);
        const user = result.user;
        const userDoc = await getDoc(doc(db, 'users', user.uid));
        if (!userDoc.exists()) {
            await setDoc(doc(db, 'users', user.uid), { role: 'consumer' });
        }
        showMessageBox('Logged in successfully!');
        loginModal.classList.add('hidden');
    } catch (error) {
        console.error("Error verifying OTP:", error);
        otpErrorMsg.textContent = error.message;
        otpErrorMsg.classList.remove('hidden');
    }
}

async function handleLogout() {
    await signOut(auth);
    showMessageBox('You have been logged out.');
}

async function handleAddProduct(e) {
    e.preventDefault();
    const newProduct = {
        name: document.getElementById('new-product-name').value,
        price: parseFloat(document.getElementById('new-product-price').value),
        category: document.getElementById('new-product-category').value,
        imageUrls: [
            document.getElementById('new-product-image-1').value,
            document.getElementById('new-product-image-2').value,
            document.getElementById('new-product-image-3').value
        ].filter(url => url),
        description: document.getElementById('new-product-description').value
    };
    
    try {
        await addDoc(collection(db, 'products'), newProduct);
        document.getElementById('add-product-form').reset();
        showMessageBox('Product added successfully!');
    } catch (error) {
        console.error("Error adding product: ", error);
        showMessageBox('Failed to add product. Check the console for details.');
    }
}

async function handleDeleteProduct(e) {
    if (e.target.classList.contains('delete-product-btn')) {
        const productId = e.target.dataset.productId;
        try {
            await deleteDoc(doc(db, 'products', productId));
            showMessageBox('Product deleted successfully!');
        } catch (error) {
            console.error("Error deleting product: ", error);
            showMessageBox('Failed to delete product. Check the console for details.');
        }
    }
}

async function handleDeleteOrder(e) {
    if (e.target.classList.contains('delete-order-btn')) {
        const orderId = e.target.dataset.orderId;
        try {
            await deleteDoc(doc(db, 'orders', orderId));
            showMessageBox('Order deleted successfully!');
        } catch (error) {
            console.error("Error deleting order: ", error);
            showMessageBox('Failed to delete order. Check the console for details.');
        }
    }
}

async function handleDeleteComplaint(e) {
    if (e.target.classList.contains('delete-complaint-btn')) {
        const complaintId = e.target.dataset.complaintId;
        try {
            await deleteDoc(doc(db, 'complaints', complaintId));
            showMessageBox('Complaint deleted successfully!');
        } catch (error) {
            console.error("Error deleting complaint: ", error);
            showMessageBox('Failed to delete complaint. Check the console for details.');
        }
    }
}

async function handleCheckout(e) {
    e.preventDefault();
    
    const customerName = document.getElementById('name').value;
    const customerEmail = document.getElementById('email').value;
    const customerAddress = document.getElementById('address').value;
    
    let total = 0;
    const cartItems = [];
    for (const id in cart) {
        const item = cart[id];
        total += item.price * item.quantity;
        cartItems.push({
            name: item.name,
            price: item.price,
            quantity: item.quantity
        });
    }

    const newOrder = {
        customerName: customerName,
        email: customerEmail,
        address: customerAddress,
        items: cartItems,
        total: total,
        timestamp: new Date().toLocaleString()
    };
    
    try {
        await addDoc(collection(db, 'orders'), newOrder);
        showMessageBox('Thank you for your order! It has been placed successfully.');
        
        localStorage.removeItem('solarCart');
        cart = {};
        updateCartCount();
        checkoutForm.reset();
        showSection('products-link');
    } catch (error) {
        console.error("Error placing order: ", error);
        showMessageBox('Failed to place order. Please try again.');
    }
}

async function handleContactForm(e) {
    e.preventDefault();

    const contactName = document.getElementById('contact-name').value;
    const contactEmail = document.getElementById('contact-email').value;
    const contactMessage = document.getElementById('contact-message').value;

    const newComplaint = {
        name: contactName,
        email: contactEmail,
        message: contactMessage,
        timestamp: new Date().toLocaleString()
    };

    try {
        await addDoc(collection(db, 'complaints'), newComplaint);
        showMessageBox('Thank you for your message! We will get back to you soon.');
        contactForm.reset();
    } catch (error) {
        console.error("Error submitting complaint: ", error);
        showMessageBox('Failed to submit complaint. Please try again.');
    }
}

async function handleSolarCalculator(e) {
    e.preventDefault();
    let totalLoadWatts = 0;
    const selectedAppliances = [];

    document.querySelectorAll('input[name="appliance"]:checked').forEach(checkbox => {
        const applianceName = checkbox.dataset.applianceName;
        const idSlug = applianceName.toLowerCase().replace(/[\s\(\)]/g, '-').replace(/[-]{2,}/g, '-');
        const quantityInput = document.getElementById(`quantity-${idSlug}`);
        const quantity = parseInt(quantityInput.value, 10);
        const wattage = parseInt(checkbox.value, 10);

        if (!isNaN(quantity) && quantity > 0) {
            totalLoadWatts += wattage * quantity;
            selectedAppliances.push({ name: applianceName, wattage: wattage, quantity: quantity });
        }
    });

    if (totalLoadWatts === 0) {
        document.getElementById('calculator-result').innerHTML = `<p class="text-red-500">Please select at least one appliance to calculate the load.</p>`;
        return;
    }

    const recommendedLoadWatts = totalLoadWatts * 1.2;
    const recommendedLoadKW = Math.ceil(recommendedLoadWatts / 1000);

    document.getElementById('calculator-result').innerHTML = `
        <div class="space-y-4 text-left">
            <h3 class="text-xl font-bold text-gray-800">Your Calculated Solar Load:</h3>
            <p>Total Power Load: <strong>${totalLoadWatts} Watts</strong></p>
            <p>Recommended Solar System Size: <strong>~${recommendedLoadKW} kW</strong></p>
            <p class="text-sm text-gray-500 mt-2">
                This is a useful estimate for the solar system capacity you need to run these appliances. We can help you find a suitable solution.
            </p>
        </div>
    `;
}

document.addEventListener('DOMContentLoaded', () => {
    initializeApp();
});
