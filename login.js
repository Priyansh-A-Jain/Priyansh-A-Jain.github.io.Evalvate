/**
 * Premium Auth System - Login Script
 * Combines functionality from user's original script with premium UI enhancements.
 */
document.addEventListener('DOMContentLoaded', () => {

    // --- Element Selection (using original IDs) ---
    const form = document.getElementById("loginForm");
    const submitBtn = document.getElementById("submitBtn");
    const emailInput = document.getElementById("email");
    const passwordInput = document.getElementById("password");
    const forgotPasswordLink = document.getElementById("forgotPassword");
    const googleLoginBtn = document.getElementById("googleLogin");

    // --- Premium UI Initializations ---
    initializeCustomCursor();
    initializePasswordToggles();
    initializeStaggeredAnimations();

    // --- Event Listeners ---
    if (form) form.addEventListener("submit", handleFormSubmit);
    if (googleLoginBtn) googleLoginBtn.addEventListener("click", handleGoogleLogin);
    if (forgotPasswordLink) forgotPasswordLink.addEventListener("click", handleForgotPassword);

    // Real-time validation listeners
    if (emailInput) emailInput.addEventListener("input", () => validateField(emailInput));
    if (passwordInput) passwordInput.addEventListener("input", () => validateField(passwordInput));
    if (emailInput) emailInput.addEventListener("blur", () => validateField(emailInput, true));
    if (passwordInput) passwordInput.addEventListener("blur", () => validateField(passwordInput, true));

    // --- Core Logic ---
    async function handleFormSubmit(e) {
        e.preventDefault();

        const isEmailValid = validateField(emailInput, true);
        const isPasswordValid = validateField(passwordInput, true);

        if (!isEmailValid || !isPasswordValid) return;

        const originalBtnHTML = submitBtn.innerHTML;
        setButtonLoading(submitBtn, "Signing In...");

        try {
            // This fetch logic is preserved from your original script
            const response = await fetch("http://127.0.0.1:8001/login", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ email: emailInput.value.trim(), password: passwordInput.value }),
            });
            const data = await response.json();

            if (response.ok) {
                // On success, you can redirect
                window.location.href = "interview.html"; // Assuming this is the destination
            } else {
                showError(emailInput, data.detail || "Login failed. Please check your credentials.");
                resetButton(submitBtn, originalBtnHTML);
            }
        } catch (error) {
            console.error("Login error:", error);
            showError(emailInput, "An unexpected error occurred. Please try again.");
            resetButton(submitBtn, originalBtnHTML);
        }
    }

    function handleGoogleLogin() {
        const originalBtnHTML = googleLoginBtn.innerHTML;
        setButtonLoading(googleLoginBtn, "Connecting...");

        // Simulate OAuth flow
        setTimeout(() => {
            // On success, redirect
            window.location.href = "interview.html"; // Assuming this is the destination
        }, 2000);
    }

    function handleForgotPassword(e) {
        e.preventDefault();
        alert("Password reset functionality would be implemented here.");
    }

    // --- Validation Logic ---
    function validateField(input, forceShow = false) {
        const value = input.value.trim();
        let isValid = true;
        let errorMessage = "";

        switch (input.id) {
            case 'email':
                const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
                if (!value) errorMessage = "Email is required";
                else if (!emailRegex.test(value)) errorMessage = "Please enter a valid email address";
                break;
            case 'password':
                if (!value) errorMessage = "Password is required";
                else if (value.length < 6) errorMessage = "Password must be at least 6 characters";
                break;
        }

        if (errorMessage) {
            isValid = false;
            if (forceShow || value.length > 0) {
                showError(input, errorMessage);
            }
        } else {
            clearError(input);
        }
        return isValid;
    }

    function showError(input, message) {
        const errorDiv = document.getElementById(input.id + "Error");
        if (input) input.classList.add("error");
        if (errorDiv) {
            errorDiv.textContent = message;
            errorDiv.classList.add("show");
        }
    }

    function clearError(input) {
        const errorDiv = document.getElementById(input.id + "Error");
        if (input) input.classList.remove("error");
        if (errorDiv) {
            errorDiv.textContent = "";
            errorDiv.classList.remove("show");
        }
    }

    // --- UI Helpers ---
    function setButtonLoading(button, text) {
        button.disabled = true;
        button.innerHTML = `<span class="loading-spinner"></span> ${text}`;
    }

    function resetButton(button, originalHTML) {
        button.disabled = false;
        button.innerHTML = originalHTML;
    }

    function initializePasswordToggles() {
        document.querySelectorAll('.password-toggle').forEach(toggle => {
            toggle.addEventListener('click', () => {
                const input = toggle.parentElement.querySelector('input');
                const isVisible = input.type === 'text';
                input.type = isVisible ? 'password' : 'text';
                toggle.setAttribute('aria-pressed', !isVisible);
                const eyeIcon = toggle.querySelector('.eye-icon');
                eyeIcon.innerHTML = isVisible
                    ? `<path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" /><circle cx="12" cy="12" r="3" />`
                    : `<path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"/><line x1="1" y1="1" x2="23" y2="23"/>`;
            });
        });
    }

    function initializeCustomCursor() {
        const cursor = document.getElementById('customCursor');
        if (!cursor) return;
        if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
            cursor.style.display = 'none';
            return;
        }

        document.addEventListener('mousemove', e => {
            cursor.style.left = e.clientX + 'px';
            cursor.style.top = e.clientY + 'px';
            cursor.classList.add('visible');
        });

        document.addEventListener('mouseleave', () => cursor.classList.remove('visible'));

        const interactiveElements = 'a, button, input, .checkbox-wrapper';
        document.querySelectorAll(interactiveElements).forEach(el => {
            el.addEventListener('mouseenter', () => cursor.classList.add('hover'));
            el.addEventListener('mouseleave', () => cursor.classList.remove('hover'));
            el.addEventListener('mousedown', () => cursor.classList.add('click'));
            el.addEventListener('mouseup', () => cursor.classList.remove('click'));
        });
    }

    function initializeStaggeredAnimations() {
        const elements = document.querySelectorAll('.form-group, .form-options, .btn, .divider, .auth-footer');
        elements.forEach((el, index) => {
            el.style.animationDelay = `${index * 100}ms`;
        });
    }
});
