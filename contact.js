/*
  ========================================
  Evalvate - Contact Page Scripts
  ========================================
*/

document.addEventListener('DOMContentLoaded', () => {

    // --- Header scroll effect ---
    window.addEventListener('scroll', () => {
        const header = document.querySelector('.header');
        if (window.scrollY > 50) {
            header.classList.add('scrolled');
        } else {
            header.classList.remove('scrolled');
        }
    });

    // --- Mobile Menu Toggle ---
    const mobileMenuButton = document.getElementById('mobile-menu-button');
    const mobileMenu = document.getElementById('mobile-menu');

    if (mobileMenuButton && mobileMenu) {
        mobileMenuButton.addEventListener('click', () => {
            mobileMenu.classList.toggle('active');
        });

        // Close menu when clicking outside
        document.addEventListener('click', (e) => {
            if (!mobileMenuButton.contains(e.target) && !mobileMenu.contains(e.target)) {
                mobileMenu.classList.remove('active');
            }
        });
    }

    // --- Contact Form Submission Logic ---
    const contactForm = document.getElementById('contact-form');
    const formStatus = document.getElementById('form-status');

    if (contactForm) {
        contactForm.addEventListener('submit', (e) => {
            e.preventDefault(); // Prevent the default form submission

            // In a real application, you would send the form data to a server here.
            // For this static example, we'll just show a success message.

            formStatus.style.color = '#6ee7b7'; // Success color
            formStatus.textContent = 'Thank you! Your message has been sent successfully.';

            // Clear the form fields after a short delay
            setTimeout(() => {
                contactForm.reset();
                formStatus.textContent = '';
            }, 4000);
        });
    }
});
