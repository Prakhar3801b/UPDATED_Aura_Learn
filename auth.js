import { auth, provider } from "./firebase.js";
import {
    signInWithPopup,
    onAuthStateChanged,
    signOut
} from "https://www.gstatic.com/firebasejs/10.7.1/firebase-auth.js";

// UI elements
const loginBtn = document.getElementById("login-btn");
const dashboardBtn = document.getElementById("dashboard-btn");
const logoutBtn = document.getElementById("logout-btn"); // add in HTML

// ----------------------
// STEP 5: LOGIN
// ----------------------
loginBtn.addEventListener("click", () => {
    signInWithPopup(auth, provider)
        .then((result) => {
            console.log("Logged in:", result.user.email);
            // ❌ DO NOT change UI here
            // UI is handled by onAuthStateChanged
        })
        .catch((error) => {
            console.error("Login error:", error);
        });
});

// ----------------------
// STEP 6: DETECT LOGIN STATE (MOST IMPORTANT)
// ----------------------
onAuthStateChanged(auth, (user) => {
    if (user) {
        // ✅ User logged in
        console.log("Auth state: logged in", user.email);

        loginBtn.classList.add("hidden");
        dashboardBtn.classList.remove("hidden");
        logoutBtn.classList.remove("hidden");

        // Optional: show name
        document.querySelector(".logo-text").innerText =
            `Aura_Learn (${user.displayName})`;

    } else {
        // ❌ User logged out
        console.log("Auth state: logged out");

        loginBtn.classList.remove("hidden");
        dashboardBtn.classList.add("hidden");
        logoutBtn.classList.add("hidden");

        document.querySelector(".logo-text").innerText = "Aura_Learn";
    }
});

// ----------------------
// STEP 7: LOGOUT
// ----------------------
logoutBtn.addEventListener("click", () => {
    signOut(auth)
        .then(() => {
            console.log("User logged out");
            // UI resets automatically via onAuthStateChanged
        })
        .catch((error) => {
            console.error("Logout error:", error);
        });
});


