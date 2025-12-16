// DOM Content Loaded
document.addEventListener('DOMContentLoaded', function() {
    console.log("🚀 Script loaded successfully!");
    initializeApp();
});

function initializeApp() {
    console.log("🔧 Initializing app...");
    // Initialize all components
    initNavigation();
    initUploadArea();
    initOptionSelection();
    initScrollAnimations();
    initSmoothScrolling();
    initGenerateButton();
}

// Navigation
function initNavigation() {
    const hamburger = document.querySelector('.hamburger');
    const navMenu = document.querySelector('.nav-menu');
    
    if (hamburger && navMenu) {
        hamburger.addEventListener('click', function() {
            hamburger.classList.toggle('active');
            navMenu.classList.toggle('active');
        });
        
        // Close menu when clicking on links
        document.querySelectorAll('.nav-link').forEach(link => {
            link.addEventListener('click', () => {
                hamburger.classList.remove('active');
                navMenu.classList.remove('active');
            });
        });
    }
    
    // Navbar scroll effect
    window.addEventListener('scroll', function() {
        const navbar = document.querySelector('.navbar');
        if (!navbar) return;
        if (window.scrollY > 100) {
            navbar.style.background = 'rgba(255, 255, 255, 0.98)';
            navbar.style.boxShadow = '0 2px 20px rgba(0, 0, 0, 0.1)';
        } else {
            navbar.style.background = 'rgba(255, 255, 255, 0.95)';
            navbar.style.boxShadow = 'none';
        }
    });
}

// Upload Area Functionality
function initUploadArea() {
    const uploadArea = document.querySelector('.upload-area');
    const fileInput = document.querySelector('.file-input');
    
    if (!uploadArea || !fileInput) {
        console.error("❌ Upload area or file input not found");
        return;
    }
    
    console.log("✅ Upload area initialized");
    
    // Click to upload
    uploadArea.addEventListener('click', function() {
        fileInput.click();
    });
    
    // File input change
    fileInput.addEventListener('change', function(e) {
        console.log("📁 File selected:", e.target.files[0]);
        handleFiles(e.target.files);
    });
    
    // Drag and drop functionality
    ['dragenter', 'dragover', 'dragleave', 'drop'].forEach(eventName => {
        uploadArea.addEventListener(eventName, preventDefaults, false);
    });
    
    function preventDefaults(e) {
        e.preventDefault();
        e.stopPropagation();
    }
    
    ['dragenter', 'dragover'].forEach(eventName => {
        uploadArea.addEventListener(eventName, highlight, false);
    });
    
    ['dragleave', 'drop'].forEach(eventName => {
        uploadArea.addEventListener(eventName, unhighlight, false);
    });
    
    function highlight() {
        uploadArea.classList.add('dragover');
        updateUploadText('Drop your image here', 'Release to upload your image');
    }
    
    function unhighlight() {
        uploadArea.classList.remove('dragover');
        updateUploadText('Upload your image', 'Drag & drop or click to browse');
    }
    
    // Handle file drop
    uploadArea.addEventListener('drop', handleDrop, false);
    
    function handleDrop(e) {
        const dt = e.dataTransfer;
        const files = dt.files;
        console.log("📁 Files dropped:", files);
        handleFiles(files);
    }
    
    function updateUploadText(title, subtitle) {
        const uploadText = uploadArea.querySelector('.upload-text h3');
        const uploadSubtext = uploadArea.querySelector('.upload-text p');
        
        if (uploadText) uploadText.textContent = title;
        if (uploadSubtext) uploadSubtext.textContent = subtitle;
    }
    
    function handleFiles(files) {
        if (files.length > 0) {
            const file = files[0];
            console.log("📄 Processing file:", file.name);
            
            // Validate file type
            if (!file.type.match('image.*')) {
                showNotification('Please upload an image file (JPEG, PNG, GIF, etc.)', 'error');
                return;
            }
            
            // Validate file size (max 10MB)
            if (file.size > 10 * 1024 * 1024) {
                showNotification('Image size should be less than 10MB', 'error');
                return;
            }
            
            // Update UI
            const uploadIcon = uploadArea.querySelector('.upload-icon i');
            if (uploadIcon) {
                uploadIcon.className = 'fas fa-check-circle';
                uploadIcon.style.color = '#10b981';
            }
            
            updateUploadText('Image uploaded successfully!', `File: ${file.name} (${formatFileSize(file.size)})`);
            
            // Preview image
            previewImage(file);
            
            // Show options section
            showOptionsSection();
        }
    }
    
    function formatFileSize(bytes) {
        if (bytes === 0) return '0 Bytes';
        const k = 1024;
        const sizes = ['Bytes', 'KB', 'MB', 'GB'];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
    }
}

// Image Preview
function previewImage(file) {
    const reader = new FileReader();
    
    reader.onload = function(e) {
        // Remove existing preview
        const existingPreview = document.querySelector('.image-preview');
        if (existingPreview) {
            existingPreview.remove();
        }
        
        // Create new preview
        const preview = document.createElement('img');
        preview.className = 'image-preview';
        preview.src = e.target.result;
        preview.style.maxWidth = '300px';
        preview.style.maxHeight = '300px';
        preview.style.borderRadius = '10px';
        preview.style.marginTop = '1rem';
        preview.style.boxShadow = '0 4px 15px rgba(0, 0, 0, 0.1)';
        
        document.querySelector('.upload-area').appendChild(preview);
        
        // Store file for later use
        window.currentImageFile = file;
        window.currentImageDataURL = e.target.result;
        console.log("✅ Image preview created and stored");
    };
    
    reader.readAsDataURL(file);
}

// Option Selection
function initOptionSelection() {
    const optionCards = document.querySelectorAll('.option-card');
    console.log(`🎯 Found ${optionCards.length} option cards`);
    
    // map UI text -> canonical style names that server expects
    const optionMap = {
        'poetic description': 'poetic',
        'poetic': 'poetic',
        'poetic_description': 'poetic',
        'creative story': 'creative',
        'creative': 'creative',
        'caption': 'caption',
        'short caption': 'caption'
        // add more mappings if you have other labels
    };
    
    optionCards.forEach(card => {
        card.addEventListener('click', function() {
            // derive a raw label from dataset or text content
            let raw = '';
            if (this.dataset && this.dataset.option) raw = this.dataset.option;
            else if (this.getAttribute('data-value')) raw = this.getAttribute('data-value');
            else raw = (this.textContent || '').trim();
            
            const normalized = raw.toString().trim().toLowerCase().replace(/[^\w\s-]/g, '').replace(/\s+/g, ' ');
            const mapped = optionMap[normalized] || normalized.replace(/\s+/g, '_');
            
            console.log("📝 Option selected (raw):", raw, "-> style:", mapped);
            
            // Remove active class from all cards
            optionCards.forEach(c => c.classList.remove('active'));
            
            // Add active class to clicked card
            this.classList.add('active');
            
            // Store selected option (canonical)
            window.selectedOption = mapped;
            
            // Show generate button
            showGenerateButton();
        });
    });
}

// Generate Button Initialization
function initGenerateButton() {
    console.log("🔘 Initializing generate button...");
    
    // Event delegation for generate button
    document.addEventListener('click', function(e) {
        if (e.target.classList.contains('generate-btn') || 
            e.target.closest('.generate-btn')) {
            console.log("🚀 Generate button clicked!");
            // default: create new content using current image (not resetting)
            generateContent(false);
        }
    });
}

// Show Options Section
function showOptionsSection() {
    const optionsSection = document.querySelector('.options-section');
    if (optionsSection) {
        optionsSection.style.display = 'block';
        optionsSection.scrollIntoView({ behavior: 'smooth' });
        console.log("✅ Options section shown");
    }
}

// Show Generate Button
function showGenerateButton() {
    let generateSection = document.querySelector('.generate-section');
    
    if (!generateSection) {
        // Create generate section if it doesn't exist
        generateSection = document.createElement('div');
        generateSection.className = 'generate-section';
        document.querySelector('.upload-section').after(generateSection);
    }
    
    // human-friendly label for the chosen option
    const label = humanizeOption(window.selectedOption || 'Result');
    
    generateSection.innerHTML = `
        <div class="container">
            <div class="generate-btn-container" style="text-align: center; padding: 2rem;">
                <button class="btn-primary generate-btn" style="padding: 1rem 3rem; font-size: 1.2rem;">
                    Generate ${label}
                </button>
            </div>
        </div>
    `;
    
    generateSection.style.display = 'block';
    generateSection.scrollIntoView({ behavior: 'smooth' });
    console.log("✅ Generate button shown");
}

function humanizeOption(opt) {
    if (!opt) return 'Result';
    return opt.replace(/_|-/g, ' ').replace(/\b\w/g, c => c.toUpperCase());
}

// Image Processing and API Call
// reuseExistingImage - when true we tell server we want a variation (and include seeds)
async function generateContent(reuseExistingImage = false) {
    console.log("🎨 Starting content generation... reuseExistingImage=", reuseExistingImage);
    
    if (!window.currentImageFile) {
        showNotification('Please upload an image first', 'error');
        return;
    }
    
    if (!window.selectedOption) {
        showNotification('Please select an output type', 'error');
        return;
    }
    
    console.log("📤 Sending request to server...");
    
    // Show loading
    showLoading();
    
    try {
        const formData = new FormData();
        formData.append('image', window.currentImageFile);
        // send canonical style
        formData.append('style', window.selectedOption);
        // variation hint
        formData.append('variation', reuseExistingImage ? 'true' : 'false');
        // random seeds & id to avoid caching & encourage variation server-side
        const request_id = `${Date.now()}-${Math.floor(Math.random() * 1e6)}`;
        const variation_seed = Math.floor(Math.random() * 1e9);
        const temperature = reuseExistingImage ? 0.95 : 0.7;
        formData.append('request_id', request_id);
        formData.append('variation_seed', variation_seed);
        formData.append('temperature', temperature);
        
        console.log("📦 FormData keys:", Array.from(formData.keys()));
        
        // cache-busting query params
        const qs = `?ts=${Date.now()}&rid=${request_id}`;
        
        console.log("🌐 Making API call to /generate...");
        
        const response = await fetch('/generate' + qs, {
            method: 'POST',
            body: formData,
            cache: 'no-store',
            headers: {
                'Cache-Control': 'no-cache'
            }
        });
        
        console.log("📥 Response received:", response.status);
        
        let data;
        try {
            data = await response.json();
        } catch (err) {
            // If server returned non-json text, show it
            const txt = await response.text();
            throw new Error('Server returned non-JSON response: ' + txt);
        }
        console.log("📊 Response data:", data);
        
        if (data && (data.success === true || data.story || data.caption || data.text || data.result)) {
            // Normalize best available text and image
            const story = data.story || data.caption || data.text || data.result || '';
            const image_data = data.image_data || data.image || data.imageData || window.currentImageDataURL || '';
            
            // Show results using chosen label
            showResults({ story, image_data, raw_response: data });
        } else {
            throw new Error(data.error || 'Failed to generate content');
        }
        
    } catch (error) {
        console.error('❌ Error:', error);
        showNotification('Error generating content: ' + (error.message || error), 'error');
    } finally {
        hideLoading();
    }
}

// Loading States
function showLoading() {
    const generateSection = document.querySelector('.generate-section');
    if (generateSection) {
        generateSection.innerHTML = `
            <div class="loading-container fade-in-up" style="text-align:center; padding: 3rem;">
                <div class="loading-spinner" style="width:72px; height:72px; border-radius:50%; border:8px solid rgba(0,0,0,0.06); border-top-color:var(--primary-color); margin: 0 auto 1rem;"></div>
                <h3 style="margin:0.5rem 0 0;">AI is working its magic...</h3>
                <p style="opacity:0.85; margin-top:0.5rem;">Analyzing your image and creating amazing content</p>
                <div class="loading-dots" style="margin-top:12px;">
                    <span style="display:inline-block; width:10px; height:10px; border-radius:50%; background:rgba(0,0,0,0.12); margin:0 5px; animation: bounce 1.2s infinite;"></span>
                    <span style="display:inline-block; width:10px; height:10px; border-radius:50%; background:rgba(0,0,0,0.12); margin:0 5px; animation: bounce 1.2s 0.15s infinite;"></span>
                    <span style="display:inline-block; width:10px; height:10px; border-radius:50%; background:rgba(0,0,0,0.12); margin:0 5px; animation: bounce 1.2s 0.3s infinite;"></span>
                </div>
            </div>
        `;
        console.log("⏳ Loading shown");
    }
}

function hideLoading() {
    console.log("✅ Loading hidden");
}

// Show Results
function showResults(data) {
    console.log("🎉 Showing results:", data);
    
    const generateSection = document.querySelector('.generate-section');
    if (generateSection) {
        // Determine human label and article for title
        const label = humanizeOption(window.selectedOption || 'Result');
        const titleText = `Your Generated ${label}`;
        const contentLabel = (window.selectedOption === 'caption') ? 'Caption' : (window.selectedOption === 'poetic' ? 'Poetic Description' : 'Story');
        
        // Make sure text is safe to insert (escape)
        const safeStory = escapeHtml(data.story || '');
        const imageSrc = data.image_data || '';
        
        generateSection.innerHTML = `
            <div class="results-section fade-in-up">
                <h2 class="section-title">${titleText}</h2>
                <div class="result-card" style="display:flex; gap:1rem; align-items:flex-start; padding:1rem;">
                    <img src="${imageSrc}" alt="Uploaded image" class="result-image" style="max-width:420px; border-radius:12px; object-fit:cover;">
                    <div class="result-content" style="flex:1;">
                        <h3 style="margin-top:0;">${contentLabel}:</h3>
                        <p class="generated-text" style="white-space: pre-line; font-size:1.05rem; color:var(--text-dark);">${safeStory}</p>
                        <div class="result-actions" style="margin-top:1.25rem; display:flex; gap:0.75rem; flex-wrap:wrap; align-items:center;">
                            <button class="btn-primary btn-generate-new btn-animate" type="button">
                                <i class="fas fa-sync-alt" style="margin-right:8px;"></i> Generate New Variation
                            </button>
                            <button class="btn-secondary btn-copy" type="button">
                                <i class="fas fa-copy" style="margin-right:8px;"></i> Copy Text
                            </button>
                            <button class="btn-secondary btn-download" type="button">
                                <i class="fas fa-download" style="margin-right:8px;"></i> Download
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        `;
        
        // attach event listeners to new buttons
        const genNewBtn = generateSection.querySelector('.btn-generate-new');
        if (genNewBtn) genNewBtn.addEventListener('click', function() { 
            // request a new variation without resetting the upload
            generateContent(true);
        });
        const copyBtn = generateSection.querySelector('.btn-copy');
        if (copyBtn) copyBtn.addEventListener('click', function() {
            copyToClipboard(data.story || '');
        });
        const downloadBtn = generateSection.querySelector('.btn-download');
        if (downloadBtn) downloadBtn.addEventListener('click', function() {
            downloadResult(data.story || '');
        });
        
        // Scroll to results
        generateSection.scrollIntoView({ behavior: 'smooth' });
        console.log("✅ Results displayed");
    }
}

// Utility: escape HTML to prevent injection
function escapeHtml(str) {
    if (!str) return '';
    return str
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#039;')
        .replace(/\n/g, '<br>');
}

// Utility function to escape strings for JS use in attributes (not used for insertion)
function escapeString(str) {
    if (!str) return '';
    return str.replace(/'/g, "\\'").replace(/"/g, '\\"').replace(/\n/g, '\\n');
}

// Utility Functions
function generateNew() {
    // Backwards compatibility: now triggers generation of a new variation instead of resetting UI
    console.log("🔄 Generating new variation (legacy handler)");
    if (!window.currentImageFile) {
        showNotification('Please upload an image first', 'error');
        return;
    }
    generateContent(true);
}

function copyToClipboard(text) {
    const unescaped = (text || '').replace(/<br>/g, '\n').replace(/&amp;/g, '&').replace(/&lt;/g, '<').replace(/&gt;/g, '>').replace(/&quot;/g, '"').replace(/&#039;/g, "'");
    navigator.clipboard.writeText(unescaped).then(() => {
        showNotification('Text copied to clipboard!', 'success');
    }).catch(err => {
        console.error('Failed to copy: ', err);
        showNotification('Failed to copy text', 'error');
    });
}

function downloadResult(text) {
    const unescaped = (text || '').replace(/<br>/g, '\n').replace(/&amp;/g, '&').replace(/&lt;/g, '<').replace(/&gt;/g, '>').replace(/&quot;/g, '"').replace(/&#039;/g, "'");
    const blob = new Blob([unescaped], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    const safeOption = window.selectedOption || 'result';
    a.download = `ai-generated-${safeOption}-${Date.now()}.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    showNotification('Content downloaded!', 'success');
}

// Notifications
function showNotification(message, type = 'info') {
    console.log(`📢 Notification [${type}]:`, message);
    
    // Remove existing notifications
    const existingNotifications = document.querySelectorAll('.notification');
    existingNotifications.forEach(notif => notif.remove());
    
    const notification = document.createElement('div');
    notification.className = `notification notification-${type}`;
    notification.innerHTML = `
        <div class="notification-content" style="display:flex; align-items:center; gap:0.6rem;">
            <i class="fas fa-${getNotificationIcon(type)}"></i>
            <span>${message}</span>
        </div>
    `;
    
    // Add styles
    notification.style.cssText = `
        position: fixed;
        top: 100px;
        right: 20px;
        background: ${getNotificationColor(type)};
        color: white;
        padding: 1rem 1.5rem;
        border-radius: 10px;
        box-shadow: 0 10px 25px rgba(0, 0, 0, 0.2);
        z-index: 10000;
        max-width: 400px;
        animation: fadeInDown 0.3s ease;
    `;
    
    document.body.appendChild(notification);
    
    // Auto remove after 5 seconds
    setTimeout(() => {
        notification.style.animation = 'fadeInUp 0.3s ease';
        setTimeout(() => notification.remove(), 300);
    }, 5000);
}

function getNotificationIcon(type) {
    const icons = {
        success: 'check-circle',
        error: 'exclamation-circle',
        warning: 'exclamation-triangle',
        info: 'info-circle'
    };
    return icons[type] || 'info-circle';
}

function getNotificationColor(type) {
    const colors = {
        success: '#10b981',
        error: '#ef4444',
        warning: '#f59e0b',
        info: '#3b82f6'
    };
    return colors[type] || '#3b82f6';
}

// Scroll Animations
function initScrollAnimations() {
    const revealElements = document.querySelectorAll('.reveal');
    
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('active');
            }
        });
    }, {
        threshold: 0.1,
        rootMargin: '0px 0px -50px 0px'
    });
    
    revealElements.forEach(element => {
        observer.observe(element);
    });
}

// Smooth Scrolling
function initSmoothScrolling() {
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

// Make functions globally available
window.generateNew = generateNew;
window.copyToClipboard = copyToClipboard;
window.downloadResult = downloadResult;

console.log("✅ Script loaded successfully!");
