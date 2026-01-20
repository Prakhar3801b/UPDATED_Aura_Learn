/**
 * Aura_Learn Main Logic
 * Handles navigation between Landing, Selection, and AR sections.
 */

// main.js (TOP of file)

// Firebase imports
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-app.js";
import {
    getAuth,
    GoogleAuthProvider,
    signInWithPopup,
    onAuthStateChanged
} from "https://www.gstatic.com/firebasejs/10.7.1/firebase-auth.js";

// Firebase config
const firebaseConfig = {
    apiKey: "AIzaSyA2cEQ6vs4qIrJh0RCNU0SihBHj4h3c5Gw",
    authDomain: "https://auralearn-fee1e.firebaseapp.com/",
    projectId: "auralearn-fee1e",
    appId: "1:349344565700:web:cef46ac07bccf77d083c91"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Auth
const auth = getAuth(app);
const provider = new GoogleAuthProvider();

// 🔥 export if used in other files
export { auth, provider };

// Wait for DOM to be fully loaded
document.addEventListener('DOMContentLoaded', () => {

    // UI Elements
    const landingSection = document.getElementById('landing-section');
    const selectionSection = document.getElementById('selection-section');
    const arSection = document.getElementById('ar-section');

    const loginBtn = document.getElementById('login-btn');
    const experimentsBtn = document.getElementById('experiments-btn');
    const backBtn = document.getElementById('back-to-landing');
    const exitArBtn = document.getElementById('exit-ar-btn');
    const dashboardBtn = document.getElementById('dashboard-btn');

    // Modal Elements
    const modal = document.getElementById('mode-modal');
    const closeModalBtn = document.getElementById('close-modal-btn');
    const arBtn = document.getElementById('mode-ar');
    const vrBtn = document.getElementById('mode-vr');

    const cardsContainer = document.querySelector('.cards-container');

    // State
    let currentUser = null;
    let selectedDomain = "";

    // --- Navigation Helpers ---
    function switchSection(from, to) {
        from.classList.remove('active-section');
        from.classList.add('hidden-section');
        setTimeout(() => {
            from.classList.add('hidden');
            to.classList.remove('hidden');
            requestAnimationFrame(() => {
                to.classList.remove('hidden-section');
                to.classList.add('active-section');
            });
        }, 500);
    }

    // --- Event Listeners ---

    // 1. Login
    if (loginBtn) {
        loginBtn.addEventListener('click', () => {
            if (!currentUser) {
                const confirmLogin = confirm("Simulating Google Login...\nClick OK to login as 'User'.");
                if (confirmLogin) {
                    currentUser = { name: "Test User", email: "user@gmail.com" };
                    loginBtn.innerHTML = `<span class="material-icons">account_circle</span> ${currentUser.name}`;
                    if (dashboardBtn) dashboardBtn.classList.remove('hidden');
                    alert("Logged in successfully!");
                }
            } else {
                alert(`Already logged in as ${currentUser.name}`);
            }
        });
    }

    // 2. Explore Experiments
    if (experimentsBtn) {
        experimentsBtn.addEventListener('click', () => {
            switchSection(landingSection, selectionSection);
            // Re-trigger animations
            const cards = document.querySelectorAll('.card');
            cards.forEach(card => {
                card.classList.remove('animate-card');
                void card.offsetWidth;
                card.classList.add('animate-card');
            });
        });
    }

    // 3. Back to Landing
    if (backBtn) {
        backBtn.addEventListener('click', () => {
            switchSection(selectionSection, landingSection);
        });
    }

    // 4. Card Selection -> POPUP BOX (Modal)
    if (cardsContainer) {
        cardsContainer.addEventListener('click', (e) => {
            const card = e.target.closest('.card');
            if (!card) return;

            selectedDomain = card.getAttribute('data-domain');
            console.log(`Selected Domain: ${selectedDomain}`);

            if (modal) {
                modal.classList.remove('hidden');
                modal.style.display = 'flex';
                requestAnimationFrame(() => {
                    modal.classList.add('active');
                    modal.style.opacity = '1';
                    modal.style.pointerEvents = 'all';
                });
            } else {
                console.error("Error: Popup Box (mode-modal) not found in DOM.");
            }
        });
    }

    // 5. Popup Actions
    if (closeModalBtn) {
        closeModalBtn.addEventListener('click', () => {
            if (modal) {
                modal.classList.remove('active');
                modal.style.opacity = '0';
                modal.style.pointerEvents = 'none';
                setTimeout(() => {
                    modal.classList.add('hidden');
                    modal.style.display = 'none';
                }, 300);
            }
        });
    }

    // --- Configuration ---
    // ✅ Streamlit Cloud AR Lab (Production only)
    const AR_BASE_URL = "https://aura-learn-experiment.streamlit.app/";

    // ✅ AR button → Streamlit Cloud
    if (arBtn) {
        arBtn.addEventListener('click', () => {

            if (!selectedDomain) {
                alert("Please select an experiment first.");
                return;
            }

            console.log(`Redirecting to Streamlit AR Lab for: ${selectedDomain}`);

            // Smooth modal close
            if (modal) {
                modal.classList.remove('active');
                modal.style.opacity = '0';
                modal.style.pointerEvents = 'none';
                setTimeout(() => {
                    modal.classList.add('hidden');
                    modal.style.display = 'none';
                }, 250);
            }

            // Redirect to Streamlit Cloud
            setTimeout(() => {
                window.location.href =
                    `${AR_BASE_URL}?experiment=${encodeURIComponent(selectedDomain)}`;
            }, 300);
        });
    }

    // VR stays on Firebase
    if (vrBtn) {
        vrBtn.addEventListener('click', () => {
            console.log(`Redirecting to VR for: ${selectedDomain}`);
            window.location.href = `vr_lab.html?experiment=${selectedDomain}`;
        });
    }

    // 6. Exit AR
    if (exitArBtn) {
        exitArBtn.addEventListener('click', () => {
            if (window.stopARSession) window.stopARSession();
            switchSection(arSection, selectionSection);
        });
    }
});
