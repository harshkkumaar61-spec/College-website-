// ===== GLOBAL VARIABLES =====
const API_BASE = 'http://localhost:8000/api'; // <-- YEH WAPAS LOCALHOST HAI
let currentUser = null;
let authToken = localStorage.getItem('authToken'); // Token ko load kiya
let currentResources = [];

// ===== INITIALIZATION =====
document.addEventListener('DOMContentLoaded', function () {
    initializeApp();
});

async function initializeApp() {
    // Check authentication status
    if (authToken) {
        // Agar token hai, toh profile fetch karne ki koshish karo
        await fetchUserProfile(); 
    } else {
        // Agar token nahi hai, toh logged-out UI dikhao
        updateNavForLoggedInUser();
    }

    // Load initial data
    loadResources();
    loadSubjects();

    // Setup event listeners
    setupEventListeners();

    // Initialize scroll to top button
    initScrollToTop();
    
    // Naye dropdown ke liye listener setup karein
    setupDropdownListener();
}

function setupEventListeners() {
    // Search functionality
    document.getElementById('searchInput').addEventListener('input', debounce(searchResources, 300));
    document.getElementById('searchInput').addEventListener('keypress', function (e) {
        if (e.key === 'Enter') {
            searchResources();
        }
    });

    // Filter changes
    document.getElementById('subjectFilter').addEventListener('change', loadResources);
    document.getElementById('typeFilter').addEventListener('change', loadResources);
    document.getElementById('yearFilter').addEventListener('change', loadResources);
    document.getElementById('semesterFilter').addEventListener('change', loadResources);

    // Modal events
    setupModalEvents();

    // Navigation smooth scroll
    setupSmoothScroll();
}

// ===== AUTHENTICATION FUNCTIONS =====
async function fetchUserProfile() {
    // YEH FUNCTION AB PAGE REFRESH PAR LOGIN FIX KAREGA
    if (!authToken) {
        updateNavForLoggedInUser(); // Ensure UI is logged out
        return;
    }
    
    try {
        const response = await fetch(`${API_BASE}/auth/profile/`, { 
            headers: {
                'Authorization': `Bearer ${authToken}` // Token ko header mein bhej rahe hain
            }
        });
        
        if (response.ok) {
            // Agar token valid hai aur details mil gayi
            currentUser = await response.json();
            updateNavForLoggedInUser(); // Navbar ko update karo
        } else {
            // Token invalid (expire) ho gaya hai
            console.error('Token invalid, logging out.');
            logout(); // Bad token ko clear karo
        }
    } catch (error) {
        console.error('Error fetching profile:', error);
        logout(); // Error par logout kar dein
    }
}

function updateNavForLoggedInUser() {
    const navAuth = document.querySelector('.nav-auth');
    
    if (currentUser && navAuth) {
        // Check karein ki profile_pic hai ya nahi
        const profilePicUrl = currentUser.profile_pic;

        let profileElement = '';
        if (profilePicUrl) {
            profileElement = `<img src="${profilePicUrl}" alt="Profile Picture" class="nav-profile-pic">`;
        } else {
            const firstName = currentUser.first_name || 'User';
            const initial = firstName.charAt(0).toUpperCase();
            profileElement = `<div class="nav-profile-initial">${initial}</div>`;
        }

        navAuth.innerHTML = `
            <button class="btn-primary" onclick="openUploadModal()">
                <i class="fas fa-upload"></i> Upload Resource
            </button>
            <div class="nav-user-profile" onclick="toggleProfileDropdown(event)">
                ${profileElement}
            </div>
            <div class="profile-dropdown-menu" id="profileDropdown">
                <div class="dropdown-header">
                    <div class="dropdown-profile-icon">
                        ${profileElement}
                    </div>
                    <div class="dropdown-profile-info">
                        <strong>${currentUser.first_name || 'User'} ${currentUser.last_name || ''}</strong>
                        <span>${currentUser.email}</span>
                    </div>
                </div>
                <a href="#" class="dropdown-item">
                    <i class="fas fa-cog"></i> Settings
                </a>
                <a href="#" class="dropdown-item">
                    <i class="fas fa-history"></i> History
                </a>
                <div class="dropdown-divider"></div>
                <a href="#" class="dropdown-item logout-btn" onclick="logout()">
                    <i class="fas fa-sign-out-alt"></i> Logout
                </a>
            </div>
        `;

    } else if (navAuth) {
        // Logged out state
        navAuth.innerHTML = `
            <button class="btn-login" onclick="openLoginModal()">
                <i class="fas fa-sign-in-alt"></i> Login
            </button>
            <button class="btn-register" onclick="openRegisterModal()">
                <i class="fas fa-user-plus"></i> Register
            </button>
        `;
    }
}

function logout() {
    localStorage.removeItem('authToken');
    localStorage.removeItem('refreshToken');
    currentUser = null;
    authToken = null;
    
    updateNavForLoggedInUser(); 
    
    const dropdown = document.getElementById('profileDropdown');
    if (dropdown) {
        dropdown.classList.remove('active');
    }
    
    showNotification('You have been logged out.', 'info');
}

// ===== MODAL FUNCTIONS =====
function setupModalEvents() {
    document.getElementById('loginForm').addEventListener('submit', handleLogin);
    document.getElementById('registerForm').addEventListener('submit', handleRegister);
    window.addEventListener('click', function (event) {
        const modals = document.querySelectorAll('.modal');
        modals.forEach(modal => {
            if (event.target === modal) {
                modal.style.display = 'none';
                document.body.style.overflow = 'auto';
            }
        });
    });
}

function openLoginModal() {
    document.getElementById('loginModal').style.display = 'block';
    document.body.style.overflow = 'hidden';
}
function closeLoginModal() {
    document.getElementById('loginModal').style.display = 'none';
    document.body.style.overflow = 'auto';
}
function openRegisterModal() {
    document.getElementById('loginModal').style.display = 'none';
    document.getElementById('registerModal').style.display = 'block';
    document.body.style.overflow = 'hidden';
}
function closeRegisterModal() {
    document.getElementById('registerModal').style.display = 'none';
    document.body.style.overflow = 'auto';
}
function openUploadModal() {
    if (!authToken) {
        showNotification('Please login to upload resources', 'warning');
        openLoginModal();
        return;
    }
    document.getElementById('uploadModal').style.display = 'block';
}
function closeUploadModal() {
    document.getElementById('uploadModal').style.display = 'none';
}
function switchToRegister() {
    closeLoginModal();
    openRegisterModal();
}
function switchToLogin() {
    closeRegisterModal();
    openLoginModal();
}

// ===== NAYE DROPDOWN FUNCTIONS =====
function toggleProfileDropdown(event) {
    event.stopPropagation();
    document.getElementById('profileDropdown').classList.toggle('active');
}
function setupDropdownListener() {
    document.addEventListener('click', function(event) {
        const dropdown = document.getElementById('profileDropdown');
        const profileIcon = document.querySelector('.nav-user-profile');
        if (dropdown && dropdown.classList.contains('active')) {
            if (!dropdown.contains(event.target) && !profileIcon.contains(event.target)) {
                dropdown.classList.remove('active');
            }
        }
    });
}

// ===== FORM HANDLERS =====
async function handleLogin(e) {
    e.preventDefault();
    const email = document.getElementById('loginEmail').value;
    const password = document.getElementById('loginPassword').value;
    const submitBtn = e.target.querySelector('button[type="submit"]');
    const originalText = submitBtn.innerHTML;
    submitBtn.innerHTML = '<div class="loading"></div> Logging in...';
    submitBtn.disabled = true;

    try {
        const response = await fetch(`${API_BASE}/auth/login/`, {
            method: 'POST',
            headers: {'Content-Type': 'application/json'},
            body: JSON.stringify({ email, password })
        });
        const data = await response.json();
        if (response.ok) {
            localStorage.setItem('authToken', data.access);
            localStorage.setItem('refreshToken', data.refresh);
            authToken = data.access;
            currentUser = data.user;
            updateNavForLoggedInUser();
            closeLoginModal();
            showNotification('Login successful! Welcome back.', 'success');
            loadResources();
        } else {
            const errorMsg = data.detail || 'Login failed. Please check your credentials.';
            showNotification(errorMsg, 'error');
        }
    } catch (error) {
        console.error('Login error:', error);
        showNotification('Login failed. Please try again.', 'error');
    } finally {
        submitBtn.innerHTML = originalText;
        submitBtn.disabled = false;
    }
}

async function handleRegister(e) {
    e.preventDefault();
    const formData = {
        first_name: document.getElementById('regFirstName').value,
        last_name: document.getElementById('regLastName').value,
        email: document.getElementById('regEmail').value,
        password: document.getElementById('regPassword').value,
        role: document.getElementById('regRole').value
    };
    const submitBtn = e.target.querySelector('button[type="submit"]');
    const originalText = submitBtn.innerHTML;
    submitBtn.innerHTML = '<div class="loading"></div> Creating account...';
    submitBtn.disabled = true;

    try {
        const response = await fetch(`${API_BASE}/auth/register/`, {
            method: 'POST',
            headers: {'Content-Type': 'application/json'},
            body: JSON.stringify(formData)
        });
        const data = await response.json();
        if (response.status === 201) {
            showNotification('Registration successful! Please login to continue.', 'success');
            closeRegisterModal();
            openLoginModal();
            document.getElementById('loginEmail').value = formData.email;
        } else {
            const errorMsg = data.email ? data.email[0] :
                data.password ? data.password[0] :
                'Registration failed. Please try again.';
            showNotification(errorMsg, 'error');
        }
    } catch (error) {
        console.error('Registration error:', error);
        showNotification('Registration failed. Please try again.', 'error');
    } finally {
        submitBtn.innerHTML = originalText;
        submitBtn.disabled = false;
    }
}

// ===== RESOURCE MANAGEMENT =====
async function loadResources() {
    const subjectFilter = document.getElementById('subjectFilter').value;
    const typeFilter = document.getElementById('typeFilter').value;
    const yearFilter = document.getElementById('yearFilter').value;
    const semesterFilter = document.getElementById('semesterFilter').value;

    showLoading('resourcesGrid');

    try {
        let url = `${API_BASE}/resources/`; // Yeh endpoint humein abhi banana hai
        const params = new URLSearchParams();

        if (subjectFilter) params.append('subject', subjectFilter);
        if (typeFilter) params.append('type', typeFilter);
        if (yearFilter) params.append('year', yearFilter);

        if (params.toString()) {
            url += `?${params.toString()}`;
        }

        // --- ABHI KE LIYE PLACEHOLDER ---
        // Kyunki /api/resources/ abhi bana nahi hai
        // Hum sample data dikhayenge
        console.warn('loadResources: /api/resources/ endpoint abhi bana nahi hai. Sample data use kar rahe hain.');
        const resources = getSampleResources();
        currentResources = resources;
        displayResources(resources);
        
        // --- ASLI CODE (JAB BACKEND READY HOGA) ---
        /*
        const response = await fetch(url);
        if (!response.ok) {
            throw new Error('Failed to fetch resources');
        }
        const resources = await response.json();
        currentResources = resources;
        displayResources(resources);
        */

    } catch (error) {
        console.error('Error loading resources:', error);
        showError('resourcesGrid', 'Failed to load resources. Please try again.');
    }
}

function getSampleResources() {
    // Yeh sample data hai, backend se aane waale data ki jagah
    return [
        { id: 1, type: 'notes', title: 'Mathematics - Calculus Complete Notes', subject_name: 'Mathematics', year: 2024, uploaded_by_name: 'Admin' },
        { id: 2, type: 'question_paper', title: 'Physics - Final Exam 2023', subject_name: 'Physics', year: 2023, uploaded_by_name: 'Admin' },
        { id: 3, type: 'syllabus', title: 'Computer Science Syllabus 2024', subject_name: 'Computer Science', year: 2024, uploaded_by_name: 'Admin' }
    ];
}


function displayResources(resources) {
    const grid = document.getElementById('resourcesGrid');

    if (resources.length === 0) {
        grid.innerHTML = `
            <div class="no-resources">
                <i class="fas fa-inbox"></i>
                <h3>No Resources Found</h3>
                <p>Try adjusting your filters or search terms</p>
                <button class="btn-primary" onclick="clearFilters()">Clear All Filters</button>
            </div>
        `;
        return;
    }

    grid.innerHTML = resources.map(resource => `
        <div class="resource-card" data-id="${resource.id}">
            <div class="resource-type type-${resource.type}">
                <i class="${getTypeIcon(resource.type)}"></i> 
                ${getTypeDisplayName(resource.type)}
            </div>
            <h3 class="resource-title">${escapeHtml(resource.title)}</h3>
            <div class="resource-meta">
                <span class="meta-item">
                    <i class="fas fa-book-open"></i> ${resource.subject_name || 'Unknown Subject'}
                </span>
                <span class="meta-item">
                    <i class="fas fa-calendar"></i> ${resource.year || 'N/A'}
                </span>
                <span class="meta-item">
                    <i class="fas fa-user-graduate"></i> ${resource.uploaded_by_name || 'Unknown User'}
                </span>
            </div>
            <p class="resource-description">
                ${getResourceDescription(resource)}
            </p>
            <div class="resource-actions">
                <button class="download-btn" onclick="downloadResource(${resource.id})" ${!authToken ? 'disabled' : ''}>
                    <i class="fas fa-download"></i> 
                    ${authToken ? 'Download PDF' : 'Login to Download'}
                </button>
                <button class="preview-btn" onclick="previewResource(${resource.id})">
                    <i class="fas fa-eye"></i> Preview
                </button>
            </div>
        </div>
    `).join('');
}

function getTypeIcon(type) {
    const icons = {
        'notes': 'fas fa-book',
        'question_paper': 'fas fa-file-pdf',
        'syllabus': 'fas fa-clipboard-list'
    };
    return icons[type] || 'fas fa-file';
}

function getTypeDisplayName(type) {
    const typeMap = {
        'notes': 'Handwritten Notes',
        'question_paper': 'Question Paper',
        'syllabus': 'Syllabus'
    };
    return typeMap[type] || type;
}

function getResourceDescription(resource) {
    if (resource.description) {
        return resource.description;
    }

    const baseDescription = `Download this ${getTypeDisplayName(resource.type).toLowerCase()} for ${resource.subject_name}`;
    if (resource.year) {
        return `${baseDescription} from year ${resource.year}.`;
    }
    return `${baseDescription}.`;
}

async function loadSubjects() {
    // Yeh function abhi sample data use karega
    const subjects = [
        { id: 1, name: 'Mathematics', semester: 1 },
        { id: 2, name: 'Physics', semester: 2 },
        { id: 3, name: 'Computer Science', semester: 3 }
    ];
    populateSubjectFilter(subjects);
    
    /*
    try {
        const response = await fetch(`${API_BASE}/resources/subjects/`);
        if (response.ok) {
            const subjects = await response.json();
            populateSubjectFilter(subjects);
        }
    } catch (error) {
        console.error('Error loading subjects:', error);
    }
    */
}

function populateSubjectFilter(subjects) {
    const subjectSelect = document.getElementById('subjectFilter');
    subjectSelect.innerHTML = '<option value="">All Subjects</option>' +
        subjects.map(subject =>
            `<option value="${subject.id}">${subject.name} - Sem ${subject.semester}</option>`
        ).join('');
}

// ===== SEARCH AND FILTER =====
function searchResources() {
    const searchTerm = document.getElementById('searchInput').value.toLowerCase().trim();

    if (searchTerm === '') {
        displayResources(currentResources);
        return;
    }

    const filteredResources = currentResources.filter(resource =>
        resource.title.toLowerCase().includes(searchTerm) ||
        (resource.subject_name && resource.subject_name.toLowerCase().includes(searchTerm)) ||
        (resource.description && resource.description.toLowerCase().includes(searchTerm))
    );

    displayResources(filteredResources);
}

function clearFilters() {
    document.getElementById('subjectFilter').value = '';
    document.getElementById('typeFilter').value = '';
    document.getElementById('yearFilter').value = '';
    document.getElementById('semesterFilter').value = '';
    document.getElementById('searchInput').value = '';

    loadResources();
}

function loadMoreResources() {
    showNotification('Loading more resources...', 'info');
    loadResources();
}

// ===== RESOURCE ACTIONS =====
function downloadResource(resourceId) {
    if (!authToken) {
        showNotification('Please login to download resources', 'warning');
        openLoginModal();
        return;
    }
    showNotification('Download feature will be available soon!', 'info');
}

function previewResource(resourceId) {
    // Login check ki zaroorat nahi, preview free ho sakta hai
    showNotification('Preview feature coming soon!', 'info');
}

// ===== NAVIGATION AND UI =====
function setupSmoothScroll() {
    // Add smooth scroll to navigation links
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function (e) {
            e.preventDefault();
            const target = document.querySelector(this.getAttribute('href'));
            if (target) {
                target.scrollIntoView({
                    behavior: 'smooth',
                    block: 'start'
                });
            }
        });
    });
}

function scrollToResources() {
    document.getElementById('resources').scrollIntoView({
        behavior: 'smooth'
    });
}

function scrollToTop() {
    window.scrollTo({
        top: 0,
        behavior: 'smooth'
    });
}

function initScrollToTop() {
    const scrollBtn = document.getElementById('scrollToTop');

    window.onscroll = () => {
        if (document.body.scrollTop > 100 || document.documentElement.scrollTop > 100) {
            scrollBtn.style.display = "block";
        } else {
            scrollBtn.style.display = "none";
        }
    };
}

// Mobile menu functionality
function toggleMobileMenu() {
    const navMenu = document.getElementById('navMenu');
    navMenu.classList.toggle('active');
}

// ===== UTILITY FUNCTIONS =====
function debounce(func, wait) {
    let timeout;
    return function executedFunction(...args) {
        const later = () => {
            clearTimeout(timeout);
            func(...args);
        };
        clearTimeout(timeout);
        timeout = setTimeout(later, wait);
    };
}

function escapeHtml(unsafe) {
    if (typeof unsafe !== 'string') {
        return '';
    }
    return unsafe
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&#039;");
}

function showLoading(containerId) {
    const container = document.getElementById(containerId);
    container.innerHTML = `
        <div class="loading-state">
            <div class="loading-spinner"></div>
            <p>Loading resources...</p>
        </div>
    `;
}

function showError(containerId, message) {
    const container = document.getElementById(containerId);
    container.innerHTML = `
        <div class="error-state">
            <i class="fas fa-exclamation-triangle"></i>
            <h3>Something went wrong</h3>
            <p>${message}</p>
            <button class="btn-primary" onclick="loadResources()">Try Again</button>
        </div>
    `;
}

function showNotification(message, type = 'info') {
    // Remove existing notifications
    const existingNotifications = document.querySelectorAll('.notification');
    existingNotifications.forEach(notification => notification.remove());

    const notification = document.createElement('div');
    notification.className = `notification notification-${type}`;
    notification.innerHTML = `
        <div class="notification-content">
            <i class="fas ${getNotificationIcon(type)}"></i>
            <span>${message}</span>
            <button class="notification-close" onclick="this.parentElement.parentElement.remove()">
                <i class="fas fa-times"></i>
            </button>
        </div>
    `;

    document.body.appendChild(notification);

    // Auto remove after 5 seconds
    setTimeout(() => {
        if (notification.parentElement) {
            notification.remove();
        }
    }, 5000);
}

function getNotificationIcon(type) {
    const icons = {
        'success': 'fa-check-circle',
        'error': 'fa-exclamation-circle',
        'warning': 'fa-exclamation-triangle',
        'info': 'fa-info-circle'
    };
    return icons[type] || 'fa-info-circle';
}

// ===== CONTACT FORM =====
document.querySelector('.contact-form')?.addEventListener('submit', function (e) {
    e.preventDefault();
    showNotification('Thank you for your message! We\'ll get back to you soon.', 'success');
    this.reset();
});

// ===== DYNAMICALLY INJECTED STYLES =====
// (Kyunki humare paas main.js hi hai, CSS hum yahin inject kar rahe hain)
const additionalStyles = `
    .loading-state, .error-state, .no-resources {
        grid-column: 1 / -1;
        text-align: center;
        padding: 3rem;
        color: var(--text-gray);
    }
    
    .loading-spinner {
        width: 40px;
        height: 40px;
        border: 4px solid var(--border-color);
        border-top-color: var(--primary-blue); /* Changed */
        border-radius: 50%;
        animation: spin 1s linear infinite;
        margin: 0 auto 1rem;
    }
    
    .notification {
        position: fixed;
        top: 100px;
        right: 20px;
        background: white;
        padding: 1rem;
        border-radius: var(--radius-lg);
        box-shadow: var(--shadow-lg);
        border-left: 4px solid var(--primary-blue);
        z-index: 10000;
        max-width: 400px;
        animation: slideInRight 0.3s ease;
    }
    
    .notification-success { border-left-color: var(--success); }
    .notification-error { border-left-color: var(--error); }
    .notification-warning { border-left-color: var(--warning); }
    .notification-info { border-left-color: var(--info); }
    
    .notification-content {
        display: flex;
        align-items: center;
        gap: 0.75rem;
    }
    .notification-content i {
        font-size: 1.25rem;
    }
    .notification-success i { color: var(--success); }
    .notification-error i { color: var(--error); }
    .notification-warning i { color: var(--warning); }
    .notification-info i { color: var(--info); }

    .notification-close {
        background: none;
        border: none;
        color: var(--text-light);
        cursor: pointer;
        padding: 0.25rem;
        margin-left: auto;
    }
    
    @keyframes slideInRight {
        from {
            opacity: 0;
            transform: translateX(100%);
        }
        to {
            opacity: 1;
            transform: translateX(0);
        }
    }
    
    .resource-card .download-btn:disabled {
        opacity: 0.6;
        cursor: not-allowed;
    }
    
    @keyframes spin {
        0% { transform: rotate(0deg); }
        100% { transform: rotate(360deg); }
    }
    
    .scroll-to-top {
        position: fixed;
        bottom: 30px;
        right: 30px;
        width: 50px;
        height: 50px;
        background: var(--gradient-primary);
        color: white;
        border: none;
        border-radius: 50%;
        display: none; /* Hidden by default */
        align-items: center;
        justify-content: center;
        font-size: 1.25rem;
        cursor: pointer;
        box-shadow: var(--shadow-lg);
        z-index: 999;
        transition: all 0.3s ease;
    }
    .scroll-to-top:hover {
        transform: translateY(-5px);
    }

    @media (max-width: 768px) {
        .notification {
            top: 80px;
            left: 20px;
            right: 20px;
            max-width: none;
        }
        .scroll-to-top {
            width: 40px;
            height: 40px;
            font-size: 1rem;
            bottom: 20px;
            right: 20px;
        }
    }
`;

// Inject additional styles
const styleSheet = document.createElement('style');
styleSheet.textContent = additionalStyles;
document.head.appendChild(styleSheet);