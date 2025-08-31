/*
  ========================================
  Evalvate - Clean & Simple Interactive Scripts
  ========================================
*/

document.addEventListener('DOMContentLoaded', () => {

    // --- Header scroll effect ---
    window.addEventListener('scroll', () => {
        const header = document.querySelector('.header');
        if (window.scrollY > 20) {
            header.style.background = 'rgba(255, 255, 255, 0.95)';
            header.style.boxShadow = '0 4px 15px rgba(0,0,0,0.05)';
        } else {
            header.style.background = 'rgba(255, 255, 255, 0.8)';
            header.style.boxShadow = 'none';
        }
    });

    // --- Mobile Menu Toggle ---
    const mobileMenuButton = document.getElementById('mobile-menu-button');
    const mobileMenu = document.getElementById('mobile-menu');
    if (mobileMenuButton && mobileMenu) {
        mobileMenuButton.addEventListener('click', () => {
            mobileMenu.classList.toggle('active');
        });
    }

    // --- Dynamic Company Logo Marquee ---
    const companies = [
        { name: "Accenture", filename: "Accenture.webp" },
        { name: "Adobe", filename: "adobe.svg" },
        { name: "Amazon", filename: "Amazon.jpg" },
        { name: "American Express", filename: "Amex.webp" },
        { name: "Barclays", filename: "barclays.svg" },
        { name: "Blackrock", filename: "BlackRock.webp" },
        { name: "Deloitte", filename: "deloitte.png" },
        { name: "Google", filename: "Google.jpg" },
        { name: "Goldman Sachs", filename: "goldmansachs.svg" },
        { name: "IBM", filename: "IBM.png" },
        { name: "Infosys", filename: "Infosys.png" },
        { name: "Intel", filename: "Intel.svg" },
        { name: "JP Morgan", filename: "JP Morgan.svg" },
        { name: "Meta", filename: "Meta.png" },
        { name: "Microsoft", filename: "Microsoft.png" },
        { name: "Netflix", filename: "Netflix.jpg" },
        { name: "Nvidia", filename: "NVIDIA.png" },
        { name: "Oracle", filename: "ORACLE.png" },
        { name: "TCS", filename: "TCS.png" },
        { name: "Wipro", filename: "wipro.svg" },
    ];

    const logoTrack = document.querySelector('.logo-track');
    if (logoTrack) {
        // Clear any existing content
        logoTrack.innerHTML = '';

        // Duplicate the array for a seamless loop
        const allLogos = [...companies, ...companies];

        allLogos.forEach(company => {
            const img = document.createElement('img');
            // The path is relative to the index.html file location
            img.src = `../Images of MNCs on Index/${company.filename}`;
            img.alt = `${company.name} Logo`; // Alt text for accessibility

            logoTrack.appendChild(img);
        });
    }

    // --- Analysis Nodes Interaction ---
    setupAnalysisNodes();

    // --- Analysis Report Charts ---
    if (typeof Chart !== 'undefined') {
        createAnalysisCharts();
    }

    // --- Report Action Buttons ---
    setupReportActions();

    // --- Scroll-triggered Animations ---
    const observerOptions = {
        threshold: 0.1,
        rootMargin: '0px 0px -50px 0px'
    };

    const animationObserver = new IntersectionObserver((entries, observer) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('visible');
                observer.unobserve(entry.target);
            }
        });
    }, observerOptions);

    // Add a CSS class for animation and observe elements
    const elementsToAnimate = document.querySelectorAll('.section-title-left, .large-feature-card, .insights-content, .insights-visual, .testimonial-card, .final-cta-section');
    elementsToAnimate.forEach(el => {
        // Add a class to apply initial animation state (opacity 0, transform)
        el.classList.add('animate-on-scroll');
        animationObserver.observe(el);
    });

    // Add staggered delay for feature cards
    document.querySelectorAll('.large-feature-card').forEach((card, index) => {
        card.style.transitionDelay = `${index * 0.1}s`;
    });
    document.querySelectorAll('.testimonial-card').forEach((card, index) => {
        card.style.transitionDelay = `${index * 0.1}s`;
    });

    // Add this new CSS to your stylesheet for the animations to work
    const style = document.createElement('style');
    style.innerHTML = `
        .animate-on-scroll {
            opacity: 0;
            transform: translateY(40px);
            transition: opacity 0.6s ease-out, transform 0.6s ease-out;
        }
        .animate-on-scroll.visible {
            opacity: 1;
            transform: translateY(0);
        }
    `;
    document.head.appendChild(style);

    // --- Card Interactions ---
    setupCardInteractions();

    // --- Chat Interface ---
    setupChatInterface();
});

// --- Setup Analysis Nodes ---
function setupAnalysisNodes() {
    const analysisNodes = document.querySelectorAll('.analysis-node');

    analysisNodes.forEach(node => {
        node.addEventListener('click', () => {
            const nodeType = node.getAttribute('data-type');
            const nodeScore = node.querySelector('.node-score').textContent;
            showNodeDetails(nodeType, nodeScore);
        });

    });
}

// --- Show Node Details ---
function showNodeDetails(nodeType, nodeScore) {
    // Update the overall score based on the clicked node
    const scoreNumber = document.querySelector('.score-number');
    if (scoreNumber) {
        scoreNumber.textContent = nodeScore.replace('%', '');
    }

    // Highlight the corresponding detail item
    const detailItems = document.querySelectorAll('.detail-item');
    detailItems.forEach(item => {
        const label = item.querySelector('.detail-label');
        if (label && label.textContent.toLowerCase().includes(nodeType)) {
            // Remove previous highlights
            detailItems.forEach(i => {
                i.style.background = 'transparent';
                i.style.borderRadius = '0';
                i.style.padding = '8px 0';
            });

            // Highlight current item
            item.style.background = 'rgba(37, 99, 235, 0.1)';
            item.style.borderRadius = '8px';
            item.style.padding = '12px 8px';

            // Remove highlight after 2 seconds
            setTimeout(() => {
                item.style.background = 'transparent';
                item.style.borderRadius = '0';
                item.style.padding = '8px 0';
            }, 2000);
        }
    });
}

// --- Analysis Charts Creation ---
function createAnalysisCharts() {
    // Pie Chart
    const pieCtx = document.getElementById('pieChart');
    if (pieCtx) {
        new Chart(pieCtx, {
            type: 'doughnut',
            data: {
                labels: ['Facial', 'Linguistic', 'Vocal', 'Technical', 'Recordings'],
                datasets: [{
                    data: [92, 85, 78, 89, 94],
                    backgroundColor: [
                        '#3B82F6',
                        '#1D4ED8',
                        '#60A5FA',
                        '#3B82F6',
                        '#1D4ED8'
                    ],
                    borderWidth: 0,
                    cutout: '70%'
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: {
                        display: false
                    }
                },
                animation: {
                    animateRotate: true,
                    duration: 1000
                }
            }
        });
    }

    // Bar Chart
    const barCtx = document.getElementById('barChart');
    if (barCtx) {
        new Chart(barCtx, {
            type: 'bar',
            data: {
                labels: ['Facial', 'Linguistic', 'Vocal', 'Technical', 'Recordings'],
                datasets: [{
                    data: [92, 85, 78, 89, 94],
                    backgroundColor: [
                        'rgba(59, 130, 246, 0.8)',
                        'rgba(29, 78, 216, 0.8)',
                        'rgba(96, 165, 250, 0.8)',
                        'rgba(59, 130, 246, 0.8)',
                        'rgba(29, 78, 216, 0.8)'
                    ],
                    borderColor: [
                        '#3B82F6',
                        '#1D4ED8',
                        '#60A5FA',
                        '#3B82F6',
                        '#1D4ED8'
                    ],
                    borderWidth: 1,
                    borderRadius: 4
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: {
                        display: false
                    }
                },
                scales: {
                    y: {
                        beginAtZero: true,
                        max: 100,
                        display: false
                    },
                    x: {
                        display: false
                    }
                },
                animation: {
                    duration: 1000
                }
            }
        });
    }

    // Line Chart
    const lineCtx = document.getElementById('lineChart');
    if (lineCtx) {
        new Chart(lineCtx, {
            type: 'line',
            data: {
                labels: ['Week 1', 'Week 2', 'Week 3', 'Week 4'],
                datasets: [{
                    label: 'Progress',
                    data: [65, 72, 78, 87],
                    borderColor: '#3B82F6',
                    backgroundColor: 'rgba(59, 130, 246, 0.1)',
                    borderWidth: 2,
                    fill: true,
                    tension: 0.4,
                    pointBackgroundColor: '#3B82F6',
                    pointBorderColor: '#fff',
                    pointBorderWidth: 2,
                    pointRadius: 3
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: {
                        display: false
                    }
                },
                scales: {
                    y: {
                        beginAtZero: true,
                        max: 100,
                        display: false
                    },
                    x: {
                        display: false
                    }
                },
                animation: {
                    duration: 1000
                }
            }
        });
    }
}

// --- Setup Report Actions ---
function setupReportActions() {
    const viewRecordingBtn = document.querySelector('.btn-view-recording');
    const downloadReportBtn = document.querySelector('.btn-download-report');

    if (viewRecordingBtn) {
        viewRecordingBtn.addEventListener('click', () => {
            // Simulate opening recording player
            alert('Opening interview recording player...');
        });
    }

    if (downloadReportBtn) {
        downloadReportBtn.addEventListener('click', () => {
            // Simulate downloading report
            alert('Downloading detailed analysis report...');
        });
    }
}

