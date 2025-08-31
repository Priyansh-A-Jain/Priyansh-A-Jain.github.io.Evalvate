/**
 * Premium Auth System - Signup Script
 * Combines functionality from user's original script with premium UI enhancements.
 */
document.addEventListener('DOMContentLoaded', () => {

    // --- Element Selection (using original IDs) ---
    const form = document.getElementById("signupForm");
    const submitBtn = document.getElementById("submitBtn");
    const inputs = {
        fullName: document.getElementById("fullName"),
        email: document.getElementById("email"),
        password: document.getElementById("password"),
        confirmPassword: document.getElementById("confirmPassword"),
    };

    // --- Premium UI Initializations ---
    initializeCustomCursor();
    initializePasswordToggles();
    initializeStaggeredAnimations();

    // --- Event Listeners ---
    if (form) form.addEventListener("submit", handleFormSubmit);

    // Real-time validation listeners
    Object.values(inputs).forEach(input => {
        if (input) {
            input.addEventListener("input", () => validateField(input));
            input.addEventListener("blur", () => validateField(input, true));
        }
    });

    // --- Core Logic ---
    async function handleFormSubmit(e) {
        e.preventDefault();

        let isFormValid = true;
        Object.values(inputs).forEach(input => {
            if (!validateField(input, true)) {
                isFormValid = false;
            }
        });

        if (!isFormValid) return;

        const originalBtnHTML = submitBtn.innerHTML;
        setButtonLoading(submitBtn, "Creating Account...");

        try {
            const payload = {
                name: inputs.fullName.value.trim(),
                email: inputs.email.value.trim(),
                password: inputs.password.value,
            };

            // This fetch logic is preserved from your original script
            const response = await fetch("http://127.0.0.1:8001/signup", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(payload),
            });
            const data = await response.json();

            if (response.ok) {
                alert("Account created successfully! Redirecting to login...");
                window.location.href = "login.html";
            } else {
                if (data.detail === "Email already exists") {
                    showError(inputs.email, "An account with this email already exists.");
                } else {
                    alert(`An unexpected error occurred: ${data.detail || 'Unknown error'}`);
                }
                resetButton(submitBtn, originalBtnHTML);
            }
        } catch (error) {
            console.error("Signup error:", error);
            alert("Could not connect to the server. Please try again later.");
            resetButton(submitBtn, originalBtnHTML);
        }
    }

    // --- Validation Logic ---
    function validateField(input, forceShow = false) {
        if (!input) return true;
        const value = input.value;
        let isValid = true;
        let errorMessage = "";

        switch (input.id) {
            case 'fullName':
                if (!value.trim()) errorMessage = "Full name is required";
                else if (value.trim().length < 2) errorMessage = "Name must be at least 2 characters";
                else if (!/^[a-zA-Z\s]+$/.test(value.trim())) errorMessage = "Please enter a valid name";
                break;
            case 'email':
                const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
                if (!value.trim()) errorMessage = "Email is required";
                else if (!emailRegex.test(value.trim())) errorMessage = "Please enter a valid email address";
                break;
            case 'password':
                updatePasswordStrength(value);
                if (!value) errorMessage = "Password is required";
                else if (!/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).{8,}$/.test(value)) {
                    errorMessage = "Must be 8+ chars with uppercase, lowercase, and a number.";
                }
                break;
            case 'confirmPassword':
                if (!value) errorMessage = "Please confirm your password";
                else if (value !== inputs.password.value) errorMessage = "Passwords do not match";
                break;
        }

        if (errorMessage) {
            isValid = false;
            // Show error only on blur or if user is typing and it's invalid
            if (forceShow || (value.length > 0 && input.type !== 'password')) {
                showError(input, errorMessage);
            }
        } else {
            clearError(input);
            if (value.trim()) {
                input.classList.add('success');
            }
        }
        return isValid;
    }

    function updatePasswordStrength(password) {
        const strengthIndicator = document.getElementById("passwordStrength");
        if (!strengthIndicator) return;

        const strengthText = strengthIndicator.querySelector(".strength-text");
        let score = 0;
        let feedback = "";

        if (password.length >= 8) score++;
        if (/[A-Z]/.test(password)) score++;
        if (/[a-z]/.test(password)) score++;
        if (/[0-9]/.test(password)) score++;

        strengthIndicator.className = 'password-strength'; // Reset
        if (password.length === 0) {
            feedback = "";
        } else if (score < 3) {
            feedback = "Weak";
            strengthIndicator.classList.add("strength-weak");
        } else if (score < 4) {
            feedback = "Medium";
            strengthIndicator.classList.add("strength-medium");
        } else {
            feedback = "Strong";
            strengthIndicator.classList.add("strength-strong");
        }
        strengthText.textContent = feedback;
    }

    function showError(input, message) {
        input.classList.remove('success');
        input.classList.add("error");
        const errorDiv = document.getElementById(input.id + "Error");
        if (errorDiv) {
            errorDiv.textContent = message;
            errorDiv.classList.add("show");
        }
    }

    function clearError(input) {
        input.classList.remove("error");
        const errorDiv = document.getElementById(input.id + "Error");
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
        const elements = document.querySelectorAll('.form-group, .btn, .auth-footer');
        elements.forEach((el, index) => {
            el.style.animationDelay = `${index * 100}ms`;
        });
    }
});
