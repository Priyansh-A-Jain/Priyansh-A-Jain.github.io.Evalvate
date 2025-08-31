class InterviewBot {
            constructor() {
                this.ttsQueue = [];
                this.isSpeaking = false;

                this.isInterviewActive = false;
                this.interviewStartTime = null;
                this.timerInterval = null;
                this.selectedTimeLimit = 0; 
                this.uploadedResume = null;
                this.chatHistory = [];
                this.webcamStream = null;
                this.isMicMuted = false;
                this.currentInterviewId = null;
                this.lastQuestion = null;
                
                this.initializeElements();
                this.bindEvents();
                this.initializeWebcam();
                this.loadTheme();
                this.addWelcomeMessage();
            }

            initializeElements() {
                this.timerDisplay = document.getElementById('timerDisplay');
                this.timerBtns = document.querySelectorAll('.timer-btn');
                
                this.uploadArea = document.getElementById('uploadArea');
                this.uploadBtn = document.getElementById('uploadBtn');
                this.fileInput = document.getElementById('fileInput');
                this.fileInfo = document.getElementById('fileInfo');
                this.fileName = document.getElementById('fileName');
                
                this.webcamPreview = document.getElementById('webcamPreview');
                this.webcamPlaceholder = document.getElementById('webcamPlaceholder');

                this.micToggleBtn = document.getElementById('micToggleBtn');
                this.mediaRecorder = null;
                this.audioChunks = [];
                
                this.chatMessages = document.getElementById('chatMessages');
                this.chatInputForm = document.getElementById('chatInputForm');
                this.userInput = document.getElementById('userInput');
                
                this.startBtn = document.getElementById('startBtn');
                this.askAgainBtn = document.getElementById('askAgainBtn');
                this.stopBtn = document.getElementById('stopBtn');
                this.reportBtn = document.getElementById('reportBtn');
                
                this.themeToggleBtn = document.getElementById('themeToggleBtn');
            }

            bindEvents() {
                this.timerBtns.forEach(btn => {
                    btn.addEventListener('click', (e) => this.setTimeLimit(e));
                });

                this.uploadBtn.addEventListener('click', () => this.fileInput.click());
                this.fileInput.addEventListener('change', (e) => this.handleFileUpload(e));
                this.uploadArea.addEventListener('dragover', (e) => this.handleDragOver(e));
                this.uploadArea.addEventListener('drop', (e) => this.handleDrop(e));

                //this.micToggleBtn.addEventListener('click', () => this.toggleMicrophone());
                this.micToggleBtn.addEventListener('click', () => this.toggleRecording());

                this.chatInputForm.addEventListener('submit', (e) => this.handleChatSubmit(e));
                this.userInput.addEventListener('input', () => this.autoResizeTextarea());

                this.startBtn.addEventListener('click', () => this.startInterview());
                this.askAgainBtn.addEventListener('click', () => this.askAgain());
                this.stopBtn.addEventListener('click', () => this.stopInterview());
                this.reportBtn.addEventListener('click', () => this.generateReport());

                this.themeToggleBtn.addEventListener('click', () => this.toggleTheme());

                document.addEventListener('keydown', (e) => this.handleKeyboardShortcuts(e));
            }

            setTimeLimit(e) {
                const minutes = parseInt(e.target.dataset.minutes);
                this.selectedTimeLimit = minutes;
                
                this.timerBtns.forEach(btn => btn.classList.remove('active'));
                e.target.classList.add('active');
                
                if (minutes === 0) {
                    this.timerDisplay.textContent = 'No Limit';
                } else {
                    this.timerDisplay.textContent = `${minutes}:00`;
                }
            }

            startTimer() {
                if (this.selectedTimeLimit === 0) {
                    this.timerDisplay.textContent = '00:00';
                    this.timerInterval = setInterval(() => {
                        const elapsed = Math.floor((Date.now() - this.interviewStartTime) / 1000);
                        const minutes = Math.floor(elapsed / 60);
                        const seconds = elapsed % 60;
                        this.timerDisplay.textContent = 
                            `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
                    }, 1000);
                } else {
                    let remainingTime = this.selectedTimeLimit * 60;
                    this.timerInterval = setInterval(() => {
                        remainingTime--;
                        const minutes = Math.floor(remainingTime / 60);
                        const seconds = remainingTime % 60;
                        this.timerDisplay.textContent = 
                            `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
                        
                        if (remainingTime <= 0) {
                            this.stopInterview();
                            this.addMessage('bot', 'Time\'s up! The interview has ended. You can now generate your performance report.');
                        }
                    }, 1000);
                }
            }

            stopTimer() {
                if (this.timerInterval) {
                    clearInterval(this.timerInterval);
                    this.timerInterval = null;
                }
            }

            handleFileUpload(e) {
                const file = e.target.files[0];
                if (file) {
                    this.processUploadedFile(file);
                }
            }

            handleDragOver(e) {
                e.preventDefault();
                this.uploadArea.classList.add('drag-over');
            }

            handleDrop(e) {
                e.preventDefault();
                this.uploadArea.classList.remove('drag-over');
                const file = e.dataTransfer.files[0];
                if (file) {
                    this.processUploadedFile(file);
                }
            }

            processUploadedFile(file) {
                const allowedTypes = ['.pdf', '.doc', '.docx', '.txt'];
                const fileExtension = '.' + file.name.split('.').pop().toLowerCase();
                
                if (!allowedTypes.includes(fileExtension)) {
                    alert('Please upload a valid resume file (.pdf, .doc, .docx, .txt)');
                    return;
                }

                this.uploadedResume = file;
                this.uploadArea.classList.add('file-uploaded');
                this.uploadArea.style.display = 'none';
                this.fileInfo.style.display = 'block';
                this.fileName.textContent = `${file.name} uploaded successfully!`;
                
                //this.addMessage('bot', 'Great! I\'ve received your resume. I can now ask more targeted questions based on your experience. When you\'re ready, just tell me what position you\'re interviewing for!');
                this.uploadResumeToServer(file);
            }

            enqueueTTS(text) {
                this.ttsQueue.push(text);
                if (!this.isSpeaking) {
                    this.playNextInQueue();
                }
            }

            async playNextInQueue() {
                if (this.ttsQueue.length === 0) {
                    this.isSpeaking = false;
                    return;
                }

                this.isSpeaking = true;
                const text = this.ttsQueue.shift();

                try {
                    if (text.length > 300) {
                        const sentences = text.match(/[^.!?]+[.!?]+/g) || [text];
                        for (let sentence of sentences) {
                            await this.playTTSWithPromise(sentence.trim());
                        }
                    } else {
                        await this.playTTSWithPromise(text);
                    }
                } catch (err) {
                    console.error("Error playing TTS:", err);
                }

                this.playNextInQueue();
            }


            async uploadResumeToServer(file) {
                const formData = new FormData();
                formData.append("file", file);

                const token = localStorage.getItem("access_token");

                try {
                    const response = await fetch("http://127.0.0.1:8001/upload_resume", {
                        method: "POST",
                        headers: {
                            Authorization: `Bearer ${token}`,
                        },
                        body: formData,
                    });

                    const data = await response.json();

                    if (!response.ok) {
                        throw new Error(data.detail || "Resume upload failed.");
                    }

                    console.log("Resume uploaded to server:", data);
                    this.addMessage('bot', "Your resume has been uploaded and analyzed successfully!");

                } catch (err) {
                    console.error("Upload failed:", err);
                    this.addMessage('bot', "Sorry, there was an error uploading your resume.");
                }
            }


            async initializeWebcam() {
                try {
                    this.webcamStream = await navigator.mediaDevices.getUserMedia({ 
                        video: true, 
                        audio: true 
                    });
                    this.webcamPreview.srcObject = this.webcamStream;
                    this.webcamPreview.style.display = 'block';
                    this.webcamPlaceholder.style.display = 'none';
                } catch (error) {
                    console.log('Webcam access denied or not available');
                    this.webcamPlaceholder.innerHTML = '<i class="fas fa-video-slash"></i><br><small>Camera not available</small>';
                }
            }

            toggleMicrophone() {
                if (this.webcamStream) {
                    const audioTracks = this.webcamStream.getAudioTracks();
                    audioTracks.forEach(track => {
                        track.enabled = !track.enabled;
                    });
                    this.isMicMuted = !this.isMicMuted;
                    
                    if (this.isMicMuted) {
                        this.micToggleBtn.classList.add('muted');
                        this.micToggleBtn.innerHTML = '<i class="fas fa-microphone-slash"></i>';
                    } else {
                        this.micToggleBtn.classList.remove('muted');
                        this.micToggleBtn.innerHTML = '<i class="fas fa-microphone"></i>';
                    }
                }
            }

            async toggleRecording() {
                if (this.mediaRecorder && this.mediaRecorder.state === "recording") {
                    this.mediaRecorder.stop();
                    this.micToggleBtn.title = "Recording... Click to stop";
                    this.micToggleBtn.innerHTML = '<i class="fas fa-microphone"></i>';
                } else {
                    this.audioChunks = [];

                    const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
                    this.mediaRecorder = new MediaRecorder(stream, { mimeType: "audio/webm" });

                    this.mediaRecorder.ondataavailable = e => {
                        if (e.data.size > 0) this.audioChunks.push(e.data);
                    };

                    this.mediaRecorder.onstop = () => {
                        const audioBlob = new Blob(this.audioChunks, { type: 'audio/webm' });
                        this.sendAudioToTranscribe(audioBlob);
                    };

                    this.mediaRecorder.start();
                    this.micToggleBtn.title = "Speak your answer";
                    this.micToggleBtn.innerHTML = '<i class="fas fa-stop"></i>';
                }
            }

            async sendAudioToTranscribe(blob) {
                const formData = new FormData();
                formData.append("audio", blob, "recording.webm");

                try {
                    const response = await fetch("http://127.0.0.1:8001/transcribe_audio", {
                        method: "POST",
                        body: formData
                    });

                    const data = await response.json();
                    if (!response.ok) throw new Error(data.detail || "STT failed");

                    this.userInput.value = data.transcript;
                    this.userInput.focus();
                    this.autoResizeTextarea();

                } catch (err) {
                    console.error("Transcription error:", err);
                    this.addMessage("bot", "Sorry, I couldn't understand your voice.");
                }
            }


            addWelcomeMessage() {
                const welcomeMessage = `
                    <strong>Welcome to AI Interview Bot!</strong><br><br>
                    I'm here to help you practice for your upcoming interview. Here's how we can get started:<br><br>
                    1. <strong>Upload your resume</strong> (optional) – This helps me ask more relevant questions<br>
                    2. <strong>Set your preferred time limit</strong> using the timer options above<br>
                    3. <strong>Tell me about the position</strong> you're interviewing for<br><br>
                    <em>For example:</em><br>
                    <code>"I want to practice for my interview at Google for the role Software Engineer"</code><br><br>
                    Ready when you are!
                `;

                this.addMessage('bot', welcomeMessage);
            }

            handleChatSubmit(e) {
                e.preventDefault();
                const message = this.userInput.value.trim();
                
                if (!message) return;
                
                this.addMessage('user', message);
                this.userInput.value = '';
                this.autoResizeTextarea();
                
                this.processUserMessage(message);
            }

            processUserMessage(message) {
                this.chatHistory.push({ role: 'user', content: message });
                
                if (!this.isInterviewActive && this.isInterviewStartCommand(message)) {
                    this.prepareInterview(message);
                } else if (this.isInterviewActive) {
                    this.handleInterviewResponse(message);
                } else {
                    this.handleGeneralResponse(message);
                }
            }

            isInterviewStartCommand(message) {
                const lowerMessage = message.toLowerCase();
                return lowerMessage.includes('interview') && 
                    (lowerMessage.includes('practice') || lowerMessage.includes('want to') || 
                        lowerMessage.includes('apply') || lowerMessage.includes('role'));
            }

            prepareInterview(message) {
                const company = this.extractCompany(message);
                const role = this.extractRole(message);
                
                let response = `Excellent! I understand you want to practice for `;
                if (role && company) {
                    response += `a ${role} position at ${company}.`;
                } else if (role) {
                    response += `a ${role} position.`;
                } else if (company) {
                    response += `an interview at ${company}.`;
                } else {
                    response += `your upcoming interview.`;
                }
                
                response += `\n\nI'm ready to conduct a mock interview with you. `;
                
                if (this.uploadedResume) {
                    response += `I'll reference your uploaded resume to ask relevant questions. `;
                }
                
                response += `Click "Start Interview" when you're ready to begin!`;
                
                this.addMessage('bot', response);
                this.enableInterviewStart();
            }

            extractCompany(message) {
                const companies = ['google', 'amazon', 'microsoft', 'apple', 'facebook', 'meta', 'netflix', 'tesla', 'uber', 'airbnb'];
                const lowerMessage = message.toLowerCase();
                
                for (const company of companies) {
                    if (lowerMessage.includes(company)) {
                        return company.charAt(0).toUpperCase() + company.slice(1);
                    }
                }
                return null;
            }

            extractRole(message) {
                const roles = ['software engineer', 'software developer', 'frontend developer', 'backend developer', 
                            'full stack developer', 'data scientist', 'product manager', 'designer', 'devops engineer'];
                const lowerMessage = message.toLowerCase();
                
                for (const role of roles) {
                    if (lowerMessage.includes(role)) {
                        return role;
                    }
                }
                return null;
            }

            async playTTS(text) {
                try {
                    const response = await fetch("http://127.0.0.1:8001/speak", {
                        method: "POST",
                        headers: {
                            "Content-Type": "application/json"
                        },
                        body: JSON.stringify({ text })
                    });

                    if (!response.ok) {
                        throw new Error("TTS failed");
                    }

                    const audioBlob = await response.blob();
                    const audioUrl = URL.createObjectURL(audioBlob);
                    const audio = new Audio(audioUrl);
                    audio.play();
                } catch (err) {
                    console.error("TTS error:", err);
                }
            }

            async playSentencesSequentially(sentences) {
                for (let sentence of sentences) {
                    await this.playTTSWithPromise(sentence.trim());
                }
            }

            playTTSWithPromise(text) {
                return new Promise((resolve, reject) => {
                    fetch("http://127.0.0.1:8001/speak", {
                        method: "POST",
                        headers: { "Content-Type": "application/json" },
                        body: JSON.stringify({ text })
                    })
                    .then(response => {
                        if (!response.ok) throw new Error("TTS failed");
                        return response.blob();
                    })
                    .then(blob => {
                        const audioUrl = URL.createObjectURL(blob);
                        const audio = new Audio(audioUrl);
                        audio.onended = resolve;
                        audio.onerror = reject;
                        audio.play();
                    })
                    .catch(err => {
                        console.error("TTS error:", err);
                        resolve(); 
                    });
                });
            }

            async handleInterviewResponse(userAnswer) {
                this.showTypingIndicator();

                const token = localStorage.getItem("access_token");

                try {
                    const response = await fetch("http://127.0.0.1:8001/answer_question", {
                        method: "POST",
                        headers: {
                            "Content-Type": "application/json",
                            "Authorization": `Bearer ${token}`,
                        },
                        body: JSON.stringify({
                            interview_id: this.currentInterviewId,  
                            question: this.lastQuestion,
                            answer: userAnswer
                        }),
                    });

                    const data = await response.json();
                    this.hideTypingIndicator();

                    if (!response.ok) {
                        throw new Error(data.detail || "Failed to get next question.");
                    }

                    if (data.done) {
                        this.stopInterview();
                        this.addMessage('bot', data.message);
                        return;
                    }

                    this.addMessage('bot', data.next_question);
                    this.lastQuestion = data.next_question;  
                } catch (err) {
                    console.error("Interview follow-up failed:", err);
                    this.addMessage('bot', "Hmm, I ran into an issue coming up with the next question.");
                    this.hideTypingIndicator();
                }
            }

            handleGeneralResponse(message) {
                this.showTypingIndicator();
                
                setTimeout(() => {
                    this.hideTypingIndicator();
                    let response = "I'm here to help you practice interviews! ";
                    
                    if (message.toLowerCase().includes('help')) {
                        response = "I can help you practice for job interviews. Just tell me about the position you're applying for, like: 'I want to practice for my interview at Amazon for the role Software Developer'";
                    } else {
                        response += "To get started, please tell me about the position you're interviewing for.";
                    }
                    
                    this.addMessage('bot', response);
                }, 800);
            }

            generateInterviewQuestion() {
                const questions = [
                    "Tell me about yourself and your background.",
                    "Why are you interested in this position?",
                    "What are your greatest strengths?",
                    "Describe a challenging project you've worked on.",
                    "How do you handle working under pressure?",
                    "Where do you see yourself in 5 years?",
                    "Tell me about a time you had to work with a difficult team member.",
                    "What motivates you in your work?",
                    "Describe your problem-solving approach.",
                    "How do you stay current with industry trends?"
                ];
                
                return questions[Math.floor(Math.random() * questions.length)];
            }

            addMessage(sender, content) {
                const messageDiv = document.createElement('div');
                messageDiv.className = `message ${sender}-message`;

                const bubbleDiv = document.createElement('div');
                bubbleDiv.className = 'message-bubble';
                bubbleDiv.innerHTML = content;

                messageDiv.appendChild(bubbleDiv);
                this.chatMessages.appendChild(messageDiv);
                this.chatMessages.scrollTop = this.chatMessages.scrollHeight;

                if (sender === 'bot') {
                    const cleanText = content.replace(/<[^>]*>?/gm, '');
                    this.enqueueTTS(cleanText);
                }
            }

            showTypingIndicator() {
                const typingDiv = document.createElement('div');
                typingDiv.className = 'message bot-message typing-indicator';
                typingDiv.id = 'typingIndicator';
                
                const bubbleDiv = document.createElement('div');
                bubbleDiv.className = 'message-bubble';
                
                const loadingDiv = document.createElement('div');
                loadingDiv.className = 'loading-indicator';
                loadingDiv.innerHTML = 'AI is thinking<div class="dot"></div><div class="dot"></div><div class="dot"></div>';
                
                bubbleDiv.appendChild(loadingDiv);
                typingDiv.appendChild(bubbleDiv);
                this.chatMessages.appendChild(typingDiv);
                
                this.chatMessages.scrollTop = this.chatMessages.scrollHeight;
            }

            hideTypingIndicator() {
                const typingIndicator = document.getElementById('typingIndicator');
                if (typingIndicator) {
                    typingIndicator.remove();
                }
            }

            autoResizeTextarea() {
                this.userInput.style.height = 'auto';
                this.userInput.style.height = Math.min(this.userInput.scrollHeight, 120) + 'px';
            }

            enableInterviewStart() {
                this.startBtn.disabled = false;
            }

            async startInterview() {
                this.isInterviewActive = true;
                this.interviewStartTime = Date.now();
                
                this.startBtn.disabled = true;
                this.stopBtn.disabled = false;
                this.askAgainBtn.disabled = false;
                
                this.startTimer();
                
                // this.addMessage('bot', "Great! Let's begin the interview. I'll ask you a series of questions, and you can respond naturally. Take your time with each answer.");

                setTimeout(async () => {
                    const question = await this.fetchFirstQuestion();
                    if (question) {
                        this.lastQuestion = question;  
                    }
                }, 1000);
            }


            async fetchFirstQuestion() {
                const token = localStorage.getItem("access_token");

                const lastMsg = this.chatHistory.find(msg => msg.role === 'user' && this.isInterviewStartCommand(msg.content));
                const message = lastMsg?.content || "I want to practice for a Software Engineer role";

                const role = this.extractRole(message) || "Software Engineer";
                const company = this.extractCompany(message) || "";

                try {
                    const response = await fetch("http://127.0.0.1:8001/start_interview", {
                        method: "POST",
                        headers: {
                            "Content-Type": "application/json",
                            "Authorization": `Bearer ${token}`,
                        },
                        body: JSON.stringify({ role, company }),
                    });

                    const data = await response.json();
                    if (!response.ok) throw new Error(data.detail || "Error starting interview");

                    this.currentInterviewId = data.interview_id;  
                    this.addMessage('bot', data.question);
                    return data.question;
                } catch (err) {
                    console.error("Interview start failed:", err);
                    this.addMessage('bot', "Oops! Couldn't fetch the first question. Try again.");
                    return null;
                }
            }

            async askAgain() {
                if (this.isInterviewActive && this.lastQuestion) {
                    this.addMessage('bot', "Let me ask you a follow-up:");

                    this.showTypingIndicator();

                    const token = localStorage.getItem("access_token");

                    try {
                        const response = await fetch("http://127.0.0.1:8001/answer_question", {
                            method: "POST",
                            headers: {
                                "Content-Type": "application/json",
                                "Authorization": `Bearer ${token}`,
                            },
                            body: JSON.stringify({
                                interview_id: this.currentInterviewId,
                                question: this.lastQuestion,
                                answer: "", 
                            }),
                        });

                        const data = await response.json();
                        this.hideTypingIndicator();

                        if (!response.ok) {
                            throw new Error(data.detail || "Failed to get next question.");
                        }

                        this.addMessage('bot', data.next_question);
                        this.lastQuestion = data.next_question;
                    } catch (err) {
                        console.error("Ask again failed:", err);
                        this.addMessage('bot', "Couldn't generate another question right now.");
                        this.hideTypingIndicator();
                    }
                }
            }

            stopInterview() {
                this.isInterviewActive = false;
                this.stopTimer();
            
                this.startBtn.disabled = false;
                this.stopBtn.disabled = true;
                this.askAgainBtn.disabled = true;
                this.reportBtn.style.display = 'inline-flex';
                
                const duration = Math.floor((Date.now() - this.interviewStartTime) / 1000);
                const minutes = Math.floor(duration / 60);
                const seconds = duration % 60;
                
                this.addMessage('bot', `Interview completed! Duration: ${minutes}m ${seconds}s. Click "Generate Report" to see your performance analysis.`);
            }

            async generateReport() {
                if (!this.currentInterviewId) {
                    this.addMessage('bot', "No interview data available to generate report.");
                    return;
                }

                this.addMessage('bot', "Generating your comprehensive interview performance report...");
                
                const token = localStorage.getItem("access_token");
                
                try {
                    const response = await fetch(`http://127.0.0.1:8001/generate_report/${this.currentInterviewId}`, {
                        headers: {
                            "Authorization": `Bearer ${token}`,
                        }
                    });

                    if (!response.ok) {
                        throw new Error("Failed to generate report");
                    }

                    const reportData = await response.json();
                    
                    localStorage.setItem('latestReport', JSON.stringify(reportData));
                    sessionStorage.setItem('interviewReport', JSON.stringify(reportData));
                    
                    this.addMessage('bot', `
                        **Interview Analysis Complete!**
                        
                        **Quick Summary:**
                        • Overall Score: ${reportData.ratings.overall}%
                        • Grammar Score: ${reportData.grammar.score}%
                        • Content Relevance: ${reportData.ratings.content}%
                        • Confidence Level: ${reportData.ratings.confidence}%
                        
                        ${reportData.grammar.mistakes && reportData.grammar.mistakes.length > 0 ? 
                            `**Grammar Issues Found:** ${reportData.grammar.mistakes.length} mistakes detected` : 
                            '**Grammar:** Excellent performance!'
                        }
                        
                        **Emotions Detected:** ${reportData.emotions.map(e => e.emotion).join(', ')}
                        
                        **[Click here to view your detailed dashboard →](dashboard.html)**
                    `);

                    setTimeout(() => {
                        window.location.href = 'dashboard.html';
                    }, 4000);

                } catch (err) {
                    this.addMessage('bot', "Sorry, I couldn't generate your report right now. Please try again.");
                }
            }

            loadTheme() {
                const savedTheme = localStorage.getItem('interview-bot-theme') || 'light';
                if (savedTheme === 'dark') {
                    document.body.classList.add('dark-mode');
                    this.themeToggleBtn.innerHTML = '<i class="fas fa-sun"></i>';
                }
            }

            toggleTheme() {
                document.body.classList.toggle('dark-mode');
                const isDark = document.body.classList.contains('dark-mode');
                
                this.themeToggleBtn.innerHTML = isDark ? 
                    '<i class="fas fa-sun"></i>' : 
                    '<i class="fas fa-moon"></i>';
                
                localStorage.setItem('interview-bot-theme', isDark ? 'dark' : 'light');
            }

            handleKeyboardShortcuts(e) {
                if ((e.ctrlKey || e.metaKey) && e.key === 'Enter') {
                    if (document.activeElement === this.userInput) {
                        this.chatInputForm.dispatchEvent(new Event('submit'));
                    }
                }
                
                if (e.key === 'Escape') {
                    this.userInput.focus();
                }
            }
        }

        document.addEventListener('DOMContentLoaded', () => {
            new InterviewBot();
        });

        function formatTime(seconds) {
            const mins = Math.floor(seconds / 60);
            const secs = seconds % 60;
            return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
        }

        window.addEventListener('error', (e) => {
            console.error('Application error:', e.error);
        });

        document.addEventListener('visibilitychange', () => {
        });