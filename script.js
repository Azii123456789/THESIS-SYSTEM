// --- DATA PERSISTENCE LAYER ---
// Default seed data if local storage is empty
const defaultProjects = [
    {
        id: 'seed1',
        title: 'Tagbilaran City Teen Center',
        details: 'Completion: April 2025 | Partnership: CPD Region 7',
        description: 'A newly inaugurated safe space for Tagbilaran youth, providing health resources, counseling, and recreational facilities.',
        image: 'file:///C:/Users/cjsay/.gemini/antigravity/brain/1ec7222e-36a4-4c39-b42b-09249c8514e4/sk_project_construction_1769955092148.png'
    },
    {
        id: 'seed2',
        title: 'Tagbilaran Coastal Care Drive',
        details: 'Activity: Sustainable Environment Initiative',
        description: "Youth volunteers leading the preservation of Tagbilaran's coastlines through regular clean-ups and mangrove planting along the boulevard.",
        image: 'file:///C:/Users/cjsay/.gemini/antigravity/brain/1ec7222e-36a4-4c39-b42b-09249c8514e4/sk_project_cleanup_1769955108909.png'
    },
    {
        id: 'seed3',
        title: 'Linggo ng Kabataan: Digital Pathways',
        details: 'Theme: Youth Digital Pathways for Sustainable Development',
        description: "Empowering Tagbilaran's young leaders with digital skills and innovation workshops held at the City Hall.",
        image: 'file:///C:/Users/cjsay/.gemini/antigravity/brain/1ec7222e-36a4-4c39-b42b-09249c8514e4/sk_project_meeting_1769955127171.png'
    }
];

function getProjects() {
    const stored = localStorage.getItem('sk_projects');
    if (!stored) {
        // Init with defaults
        localStorage.setItem('sk_projects', JSON.stringify(defaultProjects));
        return defaultProjects;
    }
    return JSON.parse(stored);
}

function saveProject(title, details, desc, imageBase64) {
    const projects = getProjects();
    const newProject = {
        id: Date.now().toString(),
        title: title,
        details: details,
        description: desc,
        image: imageBase64
    };
    projects.unshift(newProject); // Add to top
    localStorage.setItem('sk_projects', JSON.stringify(projects));
}

function deleteSavedProject(id) {
    let projects = getProjects();
    projects = projects.filter(p => p.id !== id);
    localStorage.setItem('sk_projects', JSON.stringify(projects));
}

// --- MAIN INIT ---
document.addEventListener('DOMContentLoaded', () => {
    // PROTECTED PAGES: List pages that require login
    const protectedPages = ['officials.html', 'board.html', 'projects.html', 'dashboard.html'];
    const currentPage = window.location.pathname.split('/').pop();

    // 1. CHECK AUTHENTICATION
    const isLoggedIn = localStorage.getItem('sk_user_session') === 'active';
    const userType = localStorage.getItem('user_type');
    const currentUser = localStorage.getItem('current_user') || 'Official';

    if (protectedPages.includes(currentPage) && !isLoggedIn) {
        alert('Access Violation: You must log in to view this page.');
        window.location.href = 'login.html';
        return;
    }

    if (currentPage === 'dashboard.html' && userType !== 'official') {
        alert('Access Denied: Only Officials can access this dashboard.');
        window.location.href = 'home.html';
        return;
    }

    // 2. UI UPDATES (Login Button -> Name/Profile)
    const logins = document.querySelectorAll('.nav-login-btn');
    // Handle specific Nav scenario
    const navUl = document.querySelector('nav ul');

    if (isLoggedIn && navUl) {
        // Remove existing login button from list
        logins.forEach(btn => btn.parentElement.style.display = 'none');

        // Add "My Dashboard" link if official
        if (userType === 'official') {
            const dashLi = document.createElement('li');
            dashLi.innerHTML = `<a href="dashboard.html" style="font-weight: bold; color: var(--gold);">Hon. ${currentUser}</a>`;
            navUl.appendChild(dashLi);
        } else {
            const userLi = document.createElement('li');
            userLi.innerHTML = `<a href="#" style="font-weight: bold; color: var(--gold);">Welcome, ${currentUser}</a>`;
            navUl.appendChild(userLi);
        }

        // Add Logout
        const logoutLi = document.createElement('li');
        logoutLi.innerHTML = `<a href="#" onclick="logout()" style="color: #ef4444;">Logout</a>`;
        navUl.appendChild(logoutLi);
    }


    // 3. MOBILE MENU TOGGLE
    const menuToggle = document.querySelector('.menu-toggle');
    const nav = document.querySelector('nav');

    if (menuToggle) {
        menuToggle.addEventListener('click', () => {
            nav.classList.toggle('active');
            menuToggle.classList.toggle('active');
        });
    }

    // 4. SCROLL ANIMATION
    const observerOptions = {
        threshold: 0.1
    };

    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('visible');
            }
        });
    }, observerOptions);

    const animatedElements = document.querySelectorAll('.animate-on-scroll');
    animatedElements.forEach(el => observer.observe(el));

    // 5. LOGIN FORM HANDLING (Only runs on login.html)
    const officialForm = document.getElementById('official-form');
    const userForm = document.getElementById('user-form');
    // 6. REGISTRATION FORM HANDLING (Only runs on register.html)
    const registerForm = document.getElementById('register-form');

    if (officialForm) {
        officialForm.addEventListener('submit', (e) => {
            e.preventDefault();
            // Official login bypass for now (or implement similar check if needed)
            handleLogin('official');
        });
    }

    if (userForm) {
        userForm.addEventListener('submit', (e) => {
            e.preventDefault();
            const email = document.getElementById('login-email').value;
            const password = document.getElementById('login-password').value;
            handleUserLogin(email, password);
        });
    }

    if (registerForm) {
        registerForm.addEventListener('submit', (e) => {
            e.preventDefault();
            handleRegister();
        });
    }

    // 7. ADMIN CONTROLS (Only runs on board.html)
    if (currentPage === 'board.html') {
        const userType = localStorage.getItem('user_type');
        if (userType === 'official') {
            const adminControls = document.getElementById('admin-controls');
            if (adminControls) {
                adminControls.style.display = 'block';
            }
            enableDeleteButtons(); // Add delete buttons to existing cards
        }
    }

    // 8. DASHBOARD LOGIC (Only runs on dashboard.html)
    if (currentPage === 'dashboard.html') {
        document.getElementById('official-welcome').textContent = `Welcome, Hon. ${currentUser}`;
        loadDashboardProjects();

        // Handle Form Submit
        const form = document.getElementById('add-project-form');
        form.addEventListener('submit', function (e) {
            e.preventDefault();
            const title = document.getElementById('proj-title').value;
            const details = document.getElementById('proj-details').value;
            const desc = document.getElementById('proj-desc').value;
            const fileInput = document.getElementById('proj-img');

            if (fileInput.files && fileInput.files[0]) {
                const reader = new FileReader();
                reader.onload = function (e) {
                    const base64Image = e.target.result;
                    // Save to LocalStorage
                    saveProject(title, details, desc, base64Image);
                    alert('Project Posted Successfully to Home Page!');
                    // Reload list
                    loadDashboardProjects();
                    // Clear form
                    form.reset();
                };
                reader.readAsDataURL(fileInput.files[0]);
            }
        });
    }

    // 9. CAROUSEL LOGIC (Only runs on home.html)
    if (currentPage === 'home.html' || currentPage === '') {
        initDynamicCarousel();
    }
});

// Admin Functions for Board
function uploadDocument() {
    const name = document.getElementById('new-doc-name').value;
    const date = document.getElementById('new-doc-date').value;

    if (!name || !date) {
        alert('Please fill in both fields.');
        return;
    }

    const grid = document.getElementById('doc-grid');
    const newCard = document.createElement('div');
    newCard.className = 'doc-card';
    newCard.innerHTML = `
        <div class="doc-info">
            <h4>${name}</h4>
            <span>Uploaded: ${date}</span>
        </div>
        <div class="doc-actions" style="display: flex; gap: 10px; align-items: center;">
            <a href="#" class="doc-action">Download PDF</a>
            <button onclick="deleteDocument(this)" style="background: #ef4444; color: white; border: none; padding: 5px 10px; border-radius: 4px; cursor: pointer;">Delete</button>
        </div>
    `;
    grid.prepend(newCard); // Add to top

    // Clear inputs
    document.getElementById('new-doc-name').value = '';
    document.getElementById('new-doc-date').value = '';
}

function deleteDocument(btn) {
    if (confirm('Are you sure you want to delete this document?')) {
        const card = btn.closest('.doc-card');
        card.remove();
    }
}

function enableDeleteButtons() {
    const cards = document.querySelectorAll('.doc-card');
    cards.forEach(card => {
        // Check if delete button already exists to avoid dupes
        if (card.querySelector('button')) return;

        const actionLink = card.querySelector('.doc-action');
        // Wrap action in a div if not already
        const wrapper = document.createElement('div');
        wrapper.className = 'doc-actions';
        wrapper.style.display = 'flex';
        wrapper.style.gap = '10px';
        wrapper.style.alignItems = 'center';

        // Move link into wrapper
        actionLink.parentNode.insertBefore(wrapper, actionLink);
        wrapper.appendChild(actionLink);

        // Add Delete Button
        const deleteBtn = document.createElement('button');
        deleteBtn.textContent = 'Delete';
        deleteBtn.style.background = '#ef4444';
        deleteBtn.style.color = 'white';
        deleteBtn.style.border = 'none';
        deleteBtn.style.padding = '5px 10px';
        deleteBtn.style.borderRadius = '4px';
        deleteBtn.style.cursor = 'pointer';
        deleteBtn.onclick = function () { deleteDocument(this); };

        wrapper.appendChild(deleteBtn);
    });
}

function handleLogin(type) {
    if (type === 'official') {
        const email = document.getElementById('official-email').value; // Changed ID
        const password = document.getElementById('official-password').value;

        // 1. Check Hardcoded Admin (Backup)
        if (email === 'admin' && password === 'admin123') {
            localStorage.setItem('sk_user_session', 'active');
            localStorage.setItem('user_type', 'official');
            localStorage.setItem('current_user', 'Admin Official');
            alert('Official Login Successful! Redirecting...');
            window.location.href = 'home.html';
            return;
        }

        // 2. Check Registered Officials
        const storedUser = localStorage.getItem('sk_user_' + email);
        if (storedUser) {
            const userData = JSON.parse(storedUser);
            if (userData.password === password && userData.role === 'official') {
                localStorage.setItem('sk_user_session', 'active');
                localStorage.setItem('user_type', 'official');
                localStorage.setItem('current_user', userData.name);
                alert('Official Login Successful! Welcome Hon. ' + userData.name);
                window.location.href = 'home.html';
                return;
            } else if (userData.role !== 'official') {
                alert('Error: This account is registered as a Public User. Please use the User login tab.');
                return;
            } else {
                alert('Error: Incorrect password.');
                return;
            }
        }

        alert('Error: Official account not found.');
    }
}

function handleUserLogin(email, password) {
    const storedUser = localStorage.getItem('sk_user_' + email);

    if (!storedUser) {
        alert('Error: User not found. Please register first.');
        return;
    }

    const userData = JSON.parse(storedUser);

    // Prevent officials from logging in as users? Optional. 
    // keeping it simple for now, allowing them to login if creds match.

    if (userData.password === password) {
        localStorage.setItem('sk_user_session', 'active');
        localStorage.setItem('user_type', 'user');
        localStorage.setItem('current_user', userData.name);

        alert('Login Successful! Welcome ' + userData.name);
        window.location.href = 'home.html';
    } else {
        alert('Error: Incorrect password.');
    }
}

function handleRegister() {
    const type = document.getElementById('reg-type').value;
    const name = document.getElementById('reg-name').value;
    const email = document.getElementById('reg-email').value;
    const password = document.getElementById('reg-password').value;
    const confirmPassword = document.getElementById('reg-confirm-password').value;

    if (password !== confirmPassword) {
        alert('Error: Passwords do not match.');
        return;
    }

    if (localStorage.getItem('sk_user_' + email)) {
        alert('Error: Email already registered. Please log in.');
        return;
    }

    const newUser = {
        name: name,
        email: email,
        password: password,
        role: type
    };

    localStorage.setItem('sk_user_' + email, JSON.stringify(newUser));
    alert('Registration Successful! Please log in.');
    window.location.href = 'login.html';
}

// --- MISSING FUNCTIONS RESTORED ---

function logout() {
    if (confirm('Are you sure you want to logout?')) {
        localStorage.removeItem('sk_user_session');
        localStorage.removeItem('user_type');
        window.location.href = 'login.html';
    }
}

function loadDashboardProjects() {
    const listContainer = document.getElementById('dashboard-project-list');
    const projects = getProjects();

    if (projects.length === 0) {
        listContainer.innerHTML = '<p style="text-align: center; color: #64748b;">No projects posted yet.</p>';
        return;
    }

    listContainer.innerHTML = ''; // Clear
    projects.forEach(p => {
        const item = document.createElement('div');
        item.className = 'project-list-item';
        item.innerHTML = `
            <img src="${p.image}" alt="${p.title}">
            <div class="item-info">
                <h4>${p.title}</h4>
                <p>${p.details}</p>
            </div>
            <button onclick="deleteAndRefresh('${p.id}')" style="background: #ef4444; color: white; border: none; padding: 0.5rem; border-radius: 4px; cursor: pointer;">
                <ion-icon name="trash-outline"></ion-icon>
            </button>
        `;
        listContainer.appendChild(item);
    });
}

function deleteAndRefresh(id) {
    if (confirm('Are you sure you want to delete this project? It will be removed from the Home Page.')) {
        deleteSavedProject(id);
        loadDashboardProjects();
    }
}

function initDynamicCarousel() {
    const track = document.querySelector('.carousel-track');
    if (!track) return;

    // Load data
    const projects = getProjects();
    track.innerHTML = ''; // Clear static content

    projects.forEach((p, index) => {
        const li = document.createElement('li');
        li.className = index === 0 ? 'carousel-slide current-slide' : 'carousel-slide';
        li.innerHTML = `
            <img class="carousel-image" src="${p.image}" alt="${p.title}" onclick="openProjectModal('${p.id}')" style="cursor: pointer;">
            <div class="carousel-content" onclick="openProjectModal('${p.id}')" style="cursor: pointer;">
                <h3>${p.title}</h3>
                <p>${p.details}</p>
                <button class="btn-text" style="margin-top: 0.5rem; font-size: 0.8rem; color: var(--gold); background: none; border: none; padding: 0; cursor: pointer;">View Details &rarr;</button>
            </div>
        `;
        track.appendChild(li);
    });

    // Re-initialize controls
    setupCarousel(track);
}

// --- MODAL LOGIC ---
function openProjectModal(id) {
    const projects = getProjects();
    const project = projects.find(p => p.id === id);

    if (!project) return;

    const modal = document.getElementById('project-modal');
    document.getElementById('modal-img').src = project.image;
    document.getElementById('modal-title').textContent = project.title;
    document.getElementById('modal-details').textContent = project.details;
    document.getElementById('modal-desc').textContent = project.description;

    modal.style.display = 'flex'; // Uses flex for centering
}

function closeProjectModal() {
    const modal = document.getElementById('project-modal');
    modal.style.display = 'none';
}

// Close on outside click
window.onclick = function (event) {
    const modal = document.getElementById('project-modal');
    if (event.target === modal) {
        closeProjectModal();
    }
}

function setupCarousel(track) {
    const slides = Array.from(track.children);
    const nextButton = document.querySelector('.carousel-button--right');
    const prevButton = document.querySelector('.carousel-button--left');
    const dotsNav = document.querySelector('.carousel-nav');

    // Clear existing dots
    dotsNav.innerHTML = '';
    slides.forEach((_, index) => {
        const dot = document.createElement('button');
        dot.className = index === 0 ? 'carousel-indicator current-slide' : 'carousel-indicator';
        dotsNav.appendChild(dot);
    });

    const dots = Array.from(dotsNav.children);
    let currentSlideIndex = 0;
    let carouselInterval;

    // Reset current slide classes just in case
    slides.forEach(s => s.classList.remove('current-slide'));
    if (slides.length > 0) slides[0].classList.add('current-slide');

    const updateSlide = (index) => {
        if (slides.length === 0) return;

        slides.forEach(slide => slide.classList.remove('current-slide'));
        dots.forEach(dot => dot.classList.remove('current-slide'));

        slides[index].classList.add('current-slide');
        if (dots[index]) dots[index].classList.add('current-slide');
    };

    // Correctly replace buttons to strip old event listeners
    const newNext = nextButton.cloneNode(true);
    const newPrev = prevButton.cloneNode(true);

    nextButton.parentNode.replaceChild(newNext, nextButton);
    prevButton.parentNode.replaceChild(newPrev, prevButton);

    newNext.onclick = () => {
        currentSlideIndex = (currentSlideIndex + 1) % slides.length;
        updateSlide(currentSlideIndex);
        resetInterval();
    };

    newPrev.onclick = () => {
        currentSlideIndex = (currentSlideIndex - 1 + slides.length) % slides.length;
        updateSlide(currentSlideIndex);
        resetInterval();
    };

    // For dots, we just recreated them so they are fresh
    dots.forEach((dot, index) => {
        dot.onclick = () => {
            currentSlideIndex = index;
            updateSlide(currentSlideIndex);
            resetInterval();
        };
    });

    const resetInterval = () => {
        clearInterval(carouselInterval);
        carouselInterval = setInterval(() => {
            currentSlideIndex = (currentSlideIndex + 1) % slides.length;
            updateSlide(currentSlideIndex);
        }, 6000);
    };

    resetInterval();
}
