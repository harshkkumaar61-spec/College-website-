// ===== GLOBAL VARIABLES =====
// FINAL FIX: API_BASE Ngrok URL par set hai
const API_BASE = 'https://ungregariously-unbangled-braxton.ngrok-free.dev/api';
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
    
    // NAYA FIX 2: Email verification check karo
    checkEmailVerification();

    // Load initial data
    loadResources(); // <-- Ab yeh API se data layega
    loadSubjects();  // <-- Ab yeh API se data layega

    // Setup event listeners
    setupEventListeners();

    // Initialize scroll to top button
    initScrollToTop();
    
    // Naye dropdown ke liye listener setup karein
    setupDropdownListener();
}

// NAYA FIX 2: URL se verification token check karne ke liye
async function checkEmailVerification() {
    const urlParams = new URLSearchParams(window.location.search);
    const token = urlParams.get('verify_token');

    if (token) {
        showNotification('Verifying your account...', 'info');

        try {
            const response = await fetch(`${API_BASE}/auth/verify-email/`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ token: token })
            });

            const data = await response.json();

            if (response.ok) {
                showNotification(data.message, 'success');
                // Token ko URL se hata do taaki refresh par dobara na chale
                history.replaceState(null, '', window.location.pathname);
                // Seedha login modal khol do
                openLoginModal();
            } else {
                showNotification(data.error || 'Verification failed.', 'error');
                history.replaceState(null, '', window.location.pathname);
            }

        } catch (error) {
            console.error('Verification error:', error);
            showNotification('An error occurred during verification.', 'error');
            history.replaceState(null, '', window.location.pathname);
        }
    }
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
    document.getElementById('typeFilter').addEventListener('change', loadResources
    );
    document.getElementById('yearFilter').addEventListener('change', loadResources);
    document.getElementById('semesterFilter').addEventListener('change', loadResources);

    // Modal events
    setupModalEvents();

    // Navigation smooth scroll
    setupSmoothScroll();
    
    // NAYA FIX 4: Contact Form ko API se connect karna
    const contactForm = document.getElementById('contactForm');
    if (contactForm) {
        contactForm.addEventListener('submit', handleContactForm);
    }
    
    // NAYA FIX 3: Upload Form ko API se connect karna
    const uploadForm = document.getElementById('uploadForm');
    if (uploadForm) {
        uploadForm.addEventListener('submit', handleUpload);
    }
    
    // NAYA FIX 3: Profile Form ko API se connect karna
    const profileForm = document.getElementById('profileForm');
    if (profileForm) {
        profileForm.addEventListener('submit', handleProfileUpdate);
    }
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
            
            // NAYA FIX: Upload modal mein subjects load karo
            populateUploadSubjects();
            
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
            // NAYA FIX: URL ke saath cache-busting parameter add karo
            profileElement = `<img src="${profilePicUrl}?v=${new Date().getTime()}" alt="Profile Picture" class="nav-profile-pic">`;
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
                <a href="#" class="dropdown-item" onclick="openProfileModal()">
                    <i class="fas fa-cog"></i> Settings
                </a>
                <a href="#" class="dropdown-item" onclick="openHistoryModal()">
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
    document.body.style.overflow = 'hidden';
}
function closeUploadModal() {
    document.getElementById('uploadModal').style.display = 'none';
    document.body.style.overflow = 'auto';
}
function switchToRegister() {
    closeLoginModal();
    openRegisterModal();
}
function switchToLogin() {
    closeRegisterModal();
    openLoginModal();
}

// --- NAYA FIX 3: Profile aur History Modals ke functions ---
function openProfileModal() {
    if (!currentUser) return;
    
    // Form mein current user data daalo
    document.getElementById('profileFirstName').value = currentUser.first_name;
    document.getElementById('profileLastName').value = currentUser.last_name;
    
    document.getElementById('profileModal').style.display = 'block';
    document.body.style.overflow = 'hidden';
}

function closeProfileModal() {
    document.getElementById('profileModal').style.display = 'none';
    document.body.style.overflow = 'auto';
}

async function openHistoryModal() {
    if (!authToken) {
        showNotification('Please login to see your history', 'warning');
        openLoginModal();
        return;
    }
    
    const modalBody = document.getElementById('historyModalBody');
    modalBody.innerHTML = `
        <div class="loading-state">
            <div class="loading-spinner"></div>
            <p>Loading history...</p>
        </div>`;
    document.getElementById('historyModal').style.display = 'block';
    document.body.style.overflow = 'hidden';

    try {
        const response = await fetch(`${API_BASE}/resources/history/`, {
            headers: {'Authorization': `Bearer ${authToken}`}
        });
        
        if (!response.ok) {
            throw new Error('Failed to load history');
        }
        
        const historyItems = await response.json();
        
        if (historyItems.length === 0) {
            modalBody.innerHTML = `<p style="text-align:center; color: var(--text-gray);">You haven't downloaded any resources yet.</p>`;
            return;
        }

        modalBody.innerHTML = historyItems.map(item => `
            <div class="history-item">
                <i class="history-item-icon ${getTypeIcon(item.resource.resource_type)}"></i>
                <div class="history-item-details">
                    <h4>${escapeHtml(item.resource.title)}</h4>
                    <p>Downloaded on: ${new Date(item.downloaded_at).toLocaleDateString()}</p>
                </div>
                <div class="history-item-action">
                    <button class="preview-btn" style="padding: 0.5rem 1rem;" onclick="previewResource('${item.resource.pdf_file}')">
                        View
                    </button>
                </div>
            </div>
        `).join('');
        
    } catch (error) {
        console.error('History Error:', error);
        modalBody.innerHTML = `<p style="text-align:center; color: var(--error);">Could not load your history.</p>`;
    }
}

function closeHistoryModal() {
    document.getElementById('historyModal').style.display = 'none';
    document.body.style.overflow = 'auto';
}
// --- YAHAN TAK ---

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
            populateUploadSubjects(); // NAYA: Login ke baad subjects load karo
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
            // NAYA FIX: Verification message dikhao
            showNotification(data.message || 'Registration successful! Check your email.', 'success');
            closeRegisterModal();
            openLoginModal();
            document.getElementById('loginEmail').value = formData.email;
        } else {
            const errorMsg = data.email ? data.email[0] :
                data.password ? data.password[0] :
                data.error || 'Registration failed. Please try again.';
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

// --- NAYA FIX 3: Upload Form Handler ---
async function handleUpload(e) {
    e.preventDefault();
    if (!authToken) {
        showNotification('Your session expired. Please login again.', 'warning');
        openLoginModal();
        return;
    }

    const form = e.target;
    const submitBtn = form.querySelector('button[type="submit"]');
    const errorContainer = document.getElementById('uploadErrors');
    const originalText = submitBtn.innerHTML;
    
    submitBtn.innerHTML = '<div class="loading"></div> Uploading...';
    submitBtn.disabled = true;
    errorContainer.style.display = 'none';
    errorContainer.innerHTML = '';

    const formData = new FormData();
    formData.append('title', document.getElementById('uploadTitle').value);
    formData.append('subject', document.getElementById('uploadSubject').value);
    formData.append('resource_type', document.getElementById('uploadType').value);
    formData.append('pdf_file', document.getElementById('uploadFile').files[0]);

    try {
        const response = await fetch(`${API_BASE}/resources/files/create/`, {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${authToken}`
                // 'Content-Type' multipart/form-data ke liye browser khud set karta hai
            },
            body: formData
        });
        
        const data = await response.json();

        if (response.status === 201) {
            showNotification('Resource uploaded successfully!', 'success');
            closeUploadModal();
            loadResources(); // List refresh karo
            form.reset();
        } else {
            // Errors dikhao
            let errors = 'Upload failed. ';
            if (typeof data === 'object') {
                errors += Object.values(data).join(' ');
            }
            errorContainer.innerHTML = errors;
            errorContainer.style.display = 'block';
        }

    } catch (error) {
        console.error('Upload error:', error);
        errorContainer.innerHTML = 'An unexpected error occurred. Please try again.';
        errorContainer.style.display = 'block';
    } finally {
        submitBtn.innerHTML = originalText;
        submitBtn.disabled = false;
    }
}

// --- NAYA FIX 3: Profile Update Handler ---
async function handleProfileUpdate(e) {
    e.preventDefault();
    if (!authToken) {
        showNotification('Your session expired. Please login again.', 'warning');
        openLoginModal();
        return;
    }

    const form = e.target;
    const submitBtn = form.querySelector('button[type="submit"]');
    const errorContainer = document.getElementById('profileErrors');
    const originalText = submitBtn.innerHTML;

    submitBtn.innerHTML = '<div class="loading"></div> Saving...';
    submitBtn.disabled = true;
    errorContainer.style.display = 'none';

    const formData = new FormData();
    formData.append('first_name', document.getElementById('profileFirstName').value);
    formData.append('last_name', document.getElementById('profileLastName').value);
    
    const profilePicFile = document.getElementById('profilePic').files[0];
    if (profilePicFile) {
        formData.append('profile_pic', profilePicFile);
    }

    try {
        const response = await fetch(`${API_BASE}/auth/profile/update/`, {
            method: 'PATCH',
            headers: {
                'Authorization': `Bearer ${authToken}`
            },
            body: formData
        });

        const data = await response.json();

        if (response.ok) {
            currentUser = data; // Current user object ko update karo
            updateNavForLoggedInUser(); // Navbar ko nayi pic ke saath refresh karo
            closeProfileModal();
            showNotification('Profile updated successfully!', 'success');
        } else {
            errorContainer.innerHTML = 'Failed to update profile. Please try again.';
            errorContainer.style.display = 'block';
        }
    } catch (error) {
        console.error('Profile update error:', error);
        errorContainer.innerHTML = 'An unexpected error occurred.';
        errorContainer.style.display = 'block';
    } finally {
        submitBtn.innerHTML = originalText;
        submitBtn.disabled = false;
    }
}


// ===== RESOURCE MANAGEMENT (AB YEH API SE CONNECTED HAI) =====
async function loadResources() {
    const subjectFilter = document.getElementById('subjectFilter').value;
    const typeFilter = document.getElementById('typeFilter').value;
    const yearFilter = document.getElementById('yearFilter').value;
    const semesterFilter = document.getElementById('semesterFilter').value;

    showLoading('resourcesGrid');

    try {
        let url = `${API_BASE}/resources/files/`; // <-- API ENDPOINT
        const params = new URLSearchParams();

        if (subjectFilter) params.append('subject', subjectFilter);
        if (typeFilter) params.append('type', typeFilter);
        // if (yearFilter) params.append('year', yearFilter); // Humne model mein year nahi daala tha
        // if (semesterFilter) params.append('semester', semesterFilter);

        if (params.toString()) {
            url += `?${params.toString()}`;
        }

        const response = await fetch(url);
        if (!response.ok) {
            throw new Error('Failed to fetch resources');
        }
        const resources = await response.json();
        currentResources = resources;
        displayResources(resources);

    } catch (error) {
        console.error('Error loading resources:', error);
        showError('resourcesGrid', 'Failed to load resources. Please try again.');
    }
}


function displayResources(resources) {
    const grid = document.getElementById('resourcesGrid');

    if (resources.length === 0) {
        grid.innerHTML = `
            <div class="no-resources">
                <i class="fas fa-inbox"></i>
                <h3>No Resources Found</h3>
                <p>Try adjusting your filters or search terms.</p>
                <button class="btn-primary" onclick="clearFilters()">Clear All Filters</button>
            </div>
        `;
        return;
    }

    grid.innerHTML = resources.map(resource => {
        const subjectName = resource.subject ? resource.subject.name : 'Unknown Subject';
        const year = resource.year || new Date(resource.uploaded_at).getFullYear();
        const uploaderName = resource.uploaded_by ? resource.uploaded_by.first_name : 'Admin';

        return `
        <div class="resource-card" data-id="${resource.id}">
            <div class="resource-type type-${resource.resource_type}">
                <i class="${getTypeIcon(resource.resource_type)}"></i> 
                ${getTypeDisplayName(resource.resource_type)}
            </div>
            <h3 class="resource-title">${escapeHtml(resource.title)}</h3>
            <div class="resource-meta">
                <span class="meta-item">
                    <i class="fas fa-book-open"></i> ${subjectName}
                </span>
                <span class="meta-item">
                    <i class="fas fa-calendar"></i> ${year}
                </span>
                <span class="meta-item">
                    <i class="fas fa-user-graduate"></i> ${uploaderName}
                </span>
            </div>
            <p class="resource-description">
                ${getResourceDescription(resource)}
            </p>
            <div class="resource-actions">
                <button class="download-btn" onclick="downloadResource(${resource.id}, '${resource.pdf_file}')" ${!authToken ? 'disabled' : ''}>
                    <i class="fas fa-download"></i> 
                    ${authToken ? 'Download PDF' : 'Login to Download'}
                </button>
                <button class="preview-btn" onclick="previewResource('${resource.pdf_file}')">
                    <i class="fas fa-eye"></i> Preview
                </button>
            </div>
        </div>
    `}).join('');
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
    return typeMap[type] || type.replace('_', ' ').toUpperCase();
}

function getResourceDescription(resource) {
    if (resource.description) {
        return resource.description;
    }
    const subjectName = resource.subject ? resource.subject.name : 'this subject';
    const baseDescription = `Download this ${getTypeDisplayName(resource.resource_type).toLowerCase()} for ${subjectName}`;
    return `${baseDescription}.`;
}

async function loadSubjects() {
    // Yeh function ab API se subjects layega
    try {
        const response = await fetch(`${API_BASE}/resources/subjects/`);
        if (response.ok) {
            const subjects = await response.json();
            populateSubjectFilter(subjects);
            // NAYA FIX: Upload modal mein bhi subjects daalo
            populateUploadSubjects(subjects); 
        }
    } catch (error) {
        console.error('Error loading subjects:', error);
    }
}

function populateSubjectFilter(subjects) {
    const subjectSelect = document.getElementById('subjectFilter');
    subjectSelect.innerHTML = '<option value="">All Subjects</option>' +
        subjects.map(subject =>
            `<option value="${subject.id}">${subject.name} ${subject.semester ? '- Sem ' + subject.semester : ''}</option>`
        ).join('');
}

// NAYA FIX: Upload form ke subject dropdown ko bharne ke liye
function populateUploadSubjects(subjects = null) {
    const uploadSelect = document.getElementById('uploadSubject');
    if (!uploadSelect) return;

    // Agar subjects pehle se nahi hain, toh fetch karo
    if (!subjects) {
        // Simple optimization: Agar filter mein hain, toh wahi use karo
        const filterSelect = document.getElementById('subjectFilter');
        if (filterSelect && filterSelect.options.length > 1) {
            uploadSelect.innerHTML = filterSelect.innerHTML.replace('<option value="">All Subjects</option>', '<option value="">Select a subject...</option>');
        }
        return;
    }
    
    uploadSelect.innerHTML = '<option value="">Select a subject...</option>' +
        subjects.map(subject =>
            `<option value="${subject.id}">${subject.name} ${subject.semester ? '- Sem ' + subject.semester : ''}</option>`
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
        (resource.subject && resource.subject.name.toLowerCase().includes(searchTerm))
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
async function downloadResource(resourceId, pdfUrl) {
    if (!authToken) {
        showNotification('Please login to download resources', 'warning');
        openLoginModal();
        return;
    }
    
    // Naya tab mein kholein
    window.open(pdfUrl, '_blank');
    
    // NAYA FIX: Download ko history mein record karo
    try {
        await fetch(`${API_BASE}/resources/history/record/`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${authToken}`
            },
            body: JSON.stringify({ resource_id: resourceId })
        });
    } catch (error) {
        console.error('Failed to record download history:', error);
    }
}

function previewResource(pdfUrl) {
    window.open(pdfUrl, '_blank');
}

// ===== NAVIGATION AND UI =====
function setupSmoothScroll() {
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
    if (!scrollBtn) return; 

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
    if (!container) return; 
    container.innerHTML = `
        <div class="loading-state">
            <div class="loading-spinner"></div>
            <p>Loading resources...</p>
        </div>
    `;
}

function showError(containerId, message) {
    const container = document.getElementById(containerId);
    if (!container) return; 
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

// ===== CONTACT FORM (NAYA FIX 4) =====
async function handleContactForm(e) {
    e.preventDefault();
    
    const form = e.target;
    const submitBtn = form.querySelector('button[type="submit"]');
    const originalText = submitBtn.innerHTML;
    submitBtn.innerHTML = '<div class="loading"></div> Sending...';
    submitBtn.disabled = true;

    const formData = {
        name: document.getElementById('contactName').value,
        email: document.getElementById('contactEmail').value,
        subject: document.getElementById('contactSubject').value,
        message: document.getElementById('contactMessage').value,
    };

    try {
        const response = await fetch(`${API_BASE}/auth/contact/`, {
            method: 'POST',
            headers: {'Content-Type': 'application/json'},
            body: JSON.stringify(formData)
        });

        const data = await response.json();

        if (response.ok) {
            showNotification(data.message || 'Message sent successfully!', 'success');
            form.reset();
        } else {
            showNotification(data.error || 'Failed to send message.', 'error');
        }
    } catch (error) {
        console.error('Contact form error:', error);
        showNotification('An error occurred. Please try again.', 'error');
    } finally {
        submitBtn.innerHTML = originalText;
        submitBtn.disabled = false;
    }
}


// ===== DYNAMICALLY INJECTED STYLES =====
// NAYA FIX 5: Scroll button ko left mein kiya
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
        left: 30px; /* <-- YAHAN FIX KAR DIYA HAI (right se left) */
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
            left: 20px; /* Mobile par bhi left kar diya */
        }
    }
`;

// Inject additional styles
const styleSheet = document.createElement('style');
styleSheet.textContent = additionalStyles;
document.head.appendChild(styleSheet);