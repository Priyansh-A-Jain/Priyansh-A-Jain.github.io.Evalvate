class DashboardManager {
            constructor() {
                this.reportData = null;
                this.loadReport();
            }

            loadReport() {
                let reportData = localStorage.getItem('latestReport') || 
                                sessionStorage.getItem('interviewReport') || 
                                localStorage.getItem('interviewReport');

                if (reportData) {
                    try {
                        this.reportData = JSON.parse(reportData);
                        this.renderDashboard();
                    } catch (error) {
                        console.error('Error parsing report data:', error);
                        this.showError();
                    }
                } else {
                    this.showError();
                }
            }

            renderDashboard() {
                setTimeout(() => {
                    document.getElementById('loadingContainer').style.display = 'none';
                    document.getElementById('dashboardContent').style.display = 'block';
                    
                    this.populateCandidateInfo();
                    this.populateScores();
                    this.populateSkills();
                    this.populateGrammar();
                    this.populateEmotions();
                    this.populateRecommendations();
                    this.populateFlagged();
                }, 1500);
            }

            populateCandidateInfo() {
                const { candidate, interview } = this.reportData;
                
                document.getElementById('candidatePhoto').src = candidate.photo;
                document.getElementById('candidateName').textContent = candidate.name;
                document.getElementById('candidateEmail').textContent = candidate.email;
                document.getElementById('candidateRole').textContent = candidate.role;
                document.getElementById('interviewCompany').textContent = interview.company;
                document.getElementById('interviewDate').textContent = new Date(interview.date).toLocaleDateString();
                document.getElementById('interviewDuration').textContent = interview.duration;
            }

            populateScores() {
                const { ratings, grammar } = this.reportData;
                
                this.animateScore('overallScore', ratings.overall);
                this.animateScore('contentScore', ratings.content);
                this.animateScore('confidenceScore', ratings.confidence);
                this.animateScore('grammarScore', grammar.score);
            }

            animateScore(elementId, targetScore) {
                const element = document.getElementById(elementId);
                let currentScore = 0;
                const increment = targetScore / 50;
                
                const timer = setInterval(() => {
                    currentScore += increment;
                    if (currentScore >= targetScore) {
                        currentScore = targetScore;
                        clearInterval(timer);
                    }
                    element.textContent = Math.round(currentScore) + '%';
                }, 40);
            }

            populateSkills() {
                const skillsList = document.getElementById('skillsList');
                const { skills } = this.reportData;
                
                skillsList.innerHTML = skills.map(skill => `
                    <div class="skill-item">
                        <span class="skill-name">${skill.skill}</span>
                        <div style="display: flex; align-items: center; gap: 10px;">
                            <div class="progress-bar">
                                <div class="progress-fill" style="width: ${skill.score}%"></div>
                            </div>
                            <span class="skill-score">${skill.score}%</span>
                        </div>
                    </div>
                `).join('');
            }

            populateGrammar() {
                const { grammar } = this.reportData;
                
                document.getElementById('totalErrors').textContent = grammar.total_errors || grammar.mistakes?.length || 0;
                
                if (grammar.mistakes && grammar.mistakes.length > 0) {
                    const mistakesContainer = document.getElementById('grammarMistakes');
                    const mistakesList = document.getElementById('mistakesList');
                    
                    mistakesContainer.style.display = 'block';
                    mistakesList.innerHTML = grammar.mistakes.map(mistake => 
                        `<div class="mistake-item">• ${mistake}</div>`
                    ).join('');
                }
                
                if (grammar.corrections && grammar.corrections.length > 0) {
                    const correctionsContainer = document.getElementById('grammarCorrections');
                    const correctionsList = document.getElementById('correctionsList');
                    
                    correctionsContainer.style.display = 'block';
                    correctionsList.innerHTML = grammar.corrections.map(correction => 
                        `<div class="correction-item">• ${correction}</div>`
                    ).join('');
                }
            }

            populateEmotions() {
                const { emotions, dominant_emotion } = this.reportData;
                
                document.getElementById('dominantEmotion').textContent = dominant_emotion;
                
                const emotionChart = document.getElementById('emotionChart');
                emotionChart.innerHTML = emotions.map(emotion => `
                    <div class="emotion-tag">
                        <i class="fas fa-${this.getEmotionIcon(emotion.emotion)}"></i>
                        ${emotion.emotion} (${emotion.percentage}%)
                    </div>
                `).join('');
            }

            getEmotionIcon(emotion) {
                const icons = {
                    'confident': 'smile',
                    'nervous': 'frown',
                    'excited': 'grin-hearts',
                    'uncertain': 'meh',
                    'calm': 'smile-beam',
                    'stressed': 'tired'
                };
                return icons[emotion.toLowerCase()] || 'meh';
            }

            populateRecommendations() {
                const { recommendation } = this.reportData;
                
                const strengthsList = document.getElementById('strengthsList');
                strengthsList.innerHTML = recommendation.strengths.map(strength => `
                    <li>
                        <i class="fas fa-check rec-icon"></i>
                        <span>${strength}</span>
                    </li>
                `).join('');
                
                const improvementsList = document.getElementById('improvementsList');
                improvementsList.innerHTML = recommendation.areasToImprove.map(area => `
                    <li>
                        <i class="fas fa-arrow-up rec-improve"></i>
                        <span>${area}</span>
                    </li>
                `).join('');
                
                const actionsList = document.getElementById('actionsList');
                actionsList.innerHTML = recommendation.actionableTips.map(tip => `
                    <li>
                        <i class="fas fa-tasks" style="color: #667eea;"></i>
                        <span>${tip}</span>
                    </li>
                `).join('');
            }

            populateFlagged() {
                const { flagged } = this.reportData;
                
                if (flagged && flagged.length > 0) {
                    const flaggedSection = document.getElementById('flaggedSection');
                    const flaggedList = document.getElementById('flaggedList');
                    
                    flaggedSection.style.display = 'block';
                    flaggedList.innerHTML = flagged.map(item => `
                        <div class="flagged-item">
                            <strong>Question:</strong> ${item.question}<br>
                            <strong>Feedback:</strong> ${item.feedback}<br>
                            <strong>Score:</strong> ${item.score}%
                        </div>
                    `).join('');
                }
            }

            showError() {
                setTimeout(() => {
                    document.getElementById('loadingContainer').style.display = 'none';
                    document.getElementById('errorMessage').style.display = 'block';
                }, 1000);
            }
        }

        document.addEventListener('DOMContentLoaded', () => {
            new DashboardManager();
        });

        function startNewInterview() {
            localStorage.removeItem('latestReport');
            sessionStorage.removeItem('interviewReport');
            
            window.location.href = 'interview.html'; 
        }

        function downloadReport() {
            const reportData = JSON.parse(localStorage.getItem('latestReport') || sessionStorage.getItem('interviewReport'));
            if (reportData) {
                const dataStr = JSON.stringify(reportData, null, 2);
                const dataBlob = new Blob([dataStr], {type: 'application/json'});
                
                const link = document.createElement('a');
                link.href = URL.createObjectURL(dataBlob);
                link.download = `interview-report-${new Date().toISOString().split('T')[0]}.json`;
                link.click();
            }
        }

        function goToInterview() {
            window.location.href = 'interview.html'; 
        }