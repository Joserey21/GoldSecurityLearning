
    // Mobile menu toggle
    document.getElementById('mobileMenuBtn').addEventListener('click', function(e) {
        e.stopPropagation(); // Prevent immediate closing
        document.getElementById('mobileMenu').classList.toggle('active');
    });
    
    // Close mobile menu when clicking outside
    document.addEventListener('click', function(event) {
        const mobileMenu = document.getElementById('mobileMenu');
        const mobileMenuBtn = document.getElementById('mobileMenuBtn');
        
        if (mobileMenu.classList.contains('active') && 
            !mobileMenu.contains(event.target) && 
            event.target !== mobileMenuBtn) {
            mobileMenu.classList.remove('active');
        }

    });
document.addEventListener('DOMContentLoaded', function() {
    // Font scaling functionality
    const fontDecrease = document.getElementById('fontDecrease');
    const fontReset = document.getElementById('fontReset');
    const fontIncrease = document.getElementById('fontIncrease');
    
    // Load saved font scale or use default
    const savedScale = localStorage.getItem('fontScale');
    if (savedScale) {
        document.documentElement.style.setProperty('--font-scale', savedScale);
    }
    
    // Set up button events
    if (fontDecrease) {
        fontDecrease.addEventListener('click', function() {
            adjustFontSize(-0.1);
        });
    }
    
    if (fontReset) {
        fontReset.addEventListener('click', function() {
            resetFontSize();
        });
    }
    
    if (fontIncrease) {
        fontIncrease.addEventListener('click', function() {
            adjustFontSize(0.1);
        });
    }
    
    function adjustFontSize(change) {
        const root = document.documentElement;
        const currentScale = parseFloat(getComputedStyle(root).getPropertyValue('--font-scale')) || 1;
        let newScale = currentScale + change;
        
        // Limit scaling 
        newScale = Math.max(0.8, Math.min(1.5, newScale));
        
        root.style.setProperty('--font-scale', newScale);
        localStorage.setItem('fontScale', newScale);
    }
    
    function resetFontSize() {
        document.documentElement.style.setProperty('--font-scale', 1);
        localStorage.setItem('fontScale', 1);
    }
});

    document.addEventListener('DOMContentLoaded', function() {
        // Quiz variables
        const questions = document.querySelectorAll('.question-card');
        const answerOptions = document.querySelectorAll('.answer-option');
        const prevBtn = document.getElementById('prevQuestion');
        const nextBtn = document.getElementById('nextQuestion');
        const showResultsBtn = document.getElementById('showResults');
        const progressText = document.querySelector('.quiz-progress');
        const passFeedback = document.querySelector('.quiz-feedback.pass');
        const failFeedback = document.querySelector('.quiz-feedback.fail');
        const retryBtn = document.getElementById('retryQuiz');
        const quizNavigation = document.querySelector('.quiz-navigation');
        const questionSubmitBtns = document.querySelectorAll('.question-submit-btn');
        
        let currentQuestion = 0;
        let score = 0;
        let userAnswers = Array(questions.length).fill(null);
        let answeredQuestions = Array(questions.length).fill(false);
        let questionSubmitted = Array(questions.length).fill(false);
        
        // Initialize quiz
        showQuestion(currentQuestion);
        updateProgress();
        
        // Answer selection
        function handleOptionClick() {
            // If question already submitted, ignore clicks
            if (questionSubmitted[currentQuestion]) return;
            
            const questionCard = this.closest('.question-card');
            const options = questionCard.querySelectorAll('.answer-option');
            const submitBtn = questionCard.querySelector('.question-submit-btn');
            
            // Remove selected class from all options
            options.forEach(opt => opt.classList.remove('selected'));
            
            // Add selected class to clicked option
            this.classList.add('selected');
            
            // Store user's answer
            const questionIndex = Array.from(questions).indexOf(questionCard);
            userAnswers[questionIndex] = this.getAttribute('data-option');
            
            // Enable submit button if not already submitted
            if (!questionSubmitted[questionIndex]) {
                submitBtn.classList.add('active');
            }
        }
        
        // Submit answer for current question
        questionSubmitBtns.forEach(btn => {
            btn.addEventListener('click', function() {
                const questionCard = this.closest('.question-card');
                const questionIndex = Array.from(questions).indexOf(questionCard);
                const correctAnswer = questionCard.getAttribute('data-correct');
                const selectedOption = questionCard.querySelector('.answer-option.selected');
                const correctFeedback = questionCard.querySelector('.question-feedback.correct');
                const incorrectFeedback = questionCard.querySelector('.question-feedback.incorrect');
                const explanation = selectedOption ? selectedOption.querySelector('.answer-explanation') : null;
                
                // If no selection or already submitteddo nothing
                if (!selectedOption || questionSubmitted[questionIndex]) return;
                
                // Mark question as submitted and answered
                questionSubmitted[questionIndex] = true;
                answeredQuestions[questionIndex] = true;
                
                // Check if answer is correct
                if (userAnswers[questionIndex] === correctAnswer) {
                    score++;
                    selectedOption.classList.add('correct');
                    correctFeedback.style.display = 'block';
                    incorrectFeedback.style.display = 'none';
                } else {
                    selectedOption.classList.add('incorrect');
                    correctFeedback.style.display = 'none';
                    incorrectFeedback.style.display = 'block';
                    
                    //  the explanation to the incorrect feedback
                    if (explanation) {
                        incorrectFeedback.innerHTML = `<i class="fas fa-times-circle"></i> Incorrect. ${explanation.innerHTML}`;
                    }
                }
                
                //Disable all options for this question
                const options = questionCard.querySelectorAll('.answer-option');
                options.forEach(opt => {
                    opt.style.cursor = 'default';
                    opt.classList.remove('selected');
                });
                
                // Hide submit button
                this.classList.remove('active');
                
                // Update progress
                updateProgress();
                
                // Enable next button
                if (currentQuestion < questions.length - 1) {
                    nextBtn.disabled = false;
                    nextBtn.style.display = 'inline-block';
                } else {
                    // If last question show results button
                    showResultsBtn.style.display = 'inline-block';
                }
            });
        });
        
        // Navigation buttons
        nextBtn.addEventListener('click', function() {
            if (currentQuestion < questions.length - 1) {
                currentQuestion++;
                showQuestion(currentQuestion);
                updateProgress();
            }
        });
        
        prevBtn.addEventListener('click', function() {
            if (currentQuestion > 0) {
                currentQuestion--;
                showQuestion(currentQuestion);
                updateProgress();
            }
        });
        
        // Show results
        showResultsBtn.addEventListener('click', function() {
            // Show all questions with feedback
            questions.forEach(question => {
                question.style.display = 'block';
                question.classList.remove('active');
            });
            
            // Update final score 
            document.getElementById('final-score').textContent = score;
            document.getElementById('final-score-fail').textContent = score;
            
            // Show appropriate feedback
            if (score >= 4) {
                passFeedback.style.display = 'block';
                failFeedback.style.display = 'none';
                localStorage.setItem('smishingQuizPassed', 'true');
                updateProgressOnBackend();
            } else {
                passFeedback.style.display = 'none';
                failFeedback.style.display = 'block';
            }
            
            // Hide navigation
            quizNavigation.style.display = 'none';
        });
        
        // Retry quiz
        retryBtn.addEventListener('click', function() {
            // Reset quiz 
            currentQuestion = 0;
            score = 0;
            userAnswers = Array(questions.length).fill(null);
            answeredQuestions = Array(questions.length).fill(false);
            questionSubmitted = Array(questions.length).fill(false);
            
            // Clear all selections and highlighting
            answerOptions.forEach(option => {
                option.classList.remove('selected', 'correct', 'incorrect');
                option.style.cursor = 'pointer';
            });
            
            // Hide all feedback messages
            document.querySelectorAll('.question-feedback').forEach(feedback => {
                feedback.style.display = 'none';
                // Reset incorrect feedback to original state
                if (feedback.classList.contains('incorrect')) {
                    feedback.innerHTML = '<i class="fas fa-times-circle"></i> Incorrect. Here\'s why your answer was wrong:';
                }
            });
            
            // Hide submit buttons
            questionSubmitBtns.forEach(btn => {
                btn.classList.remove('active');
            });
            
            // Hide all questions and show first one
            questions.forEach(question => {
                question.style.display = 'none';
            });
            questions[0].style.display = 'block';
            questions[0].classList.add('active');
            
            // Reset navigation buttons
            prevBtn.disabled = true;
            nextBtn.style.display = 'inline-block';
            nextBtn.disabled = true;
            showResultsBtn.style.display = 'none';
            
            // Hide final feedback messages
            passFeedback.style.display = 'none';
            failFeedback.style.display = 'none';
            
            // Show navigation
            quizNavigation.style.display = 'block';
            
            // Update progress display
            updateProgress();
            
            // Reattach event listeners
            answerOptions.forEach(option => {
                option.addEventListener('click', handleOptionClick);
            });
        });
        
        // Helpfunctions
        function showQuestion(index) {
            questions.forEach((question, i) => {
                question.classList.toggle('active', i === index);
                question.style.display = i === index ? 'block' : 'none';
            });
            
            prevBtn.disabled = index === 0;
            nextBtn.style.display = index < questions.length - 1 ? 'inline-block' : 'none';
            showResultsBtn.style.display = 'none';
            
            // Enable next button only if current question is answered
            if (answeredQuestions[index]) {
                nextBtn.disabled = false;
            } else {
                nextBtn.disabled = true;
            }
        }
        
        function updateProgress() {
            const answeredCount = answeredQuestions.filter(answer => answer).length;
            progressText.textContent = `Question ${currentQuestion + 1} of ${questions.length} | Score: ${score}/${answeredCount}`;
        }
        // backend 
        function updateProgressOnBackend() {
            console.log("Quiz passed! Backend update would happen here");
        
        }
        
        // Attach initial event listeners to options
        answerOptions.forEach(option => {
            option.addEventListener('click', handleOptionClick);
        });
        
        // Mobile menu toggle
        document.getElementById('mobileMenuBtn').addEventListener('click', function() {
            document.getElementById('mobileMenu').classList.toggle('active');
        });
        
        document.addEventListener('click', function(event) {
            const mobileMenu = document.getElementById('mobileMenu');
            const mobileMenuBtn = document.getElementById('mobileMenuBtn');
            
            if (mobileMenu.classList.contains('active') && 
                !mobileMenu.contains(event.target) && 
                event.target !== mobileMenuBtn) {
                mobileMenu.classList.remove('active');
            }
        });
    });
        


function checkAuthStatus() {
    return {
        isLoggedIn: localStorage.getItem('isLoggedIn') === 'true',
        username: localStorage.getItem('username') || 'User'
    };
}

// show buttons based on auth status
function renderAuthButtons() {
    const { isLoggedIn, username } = checkAuthStatus();
    const userSection = document.getElementById('userSection');
    const mobileUserSection = document.getElementById('mobileUserSection');
    
    if (isLoggedIn) {
        // Desktop view
        if (userSection) {
            userSection.innerHTML = `
                <div class="user-status">
                    <div class="user-avatar">${username.charAt(0).toUpperCase()}</div>
                    <span class="user-name">${username}</span>
                    <button class="logout-btn" id="logoutBtn">Logout</button>
                </div>
            `;
        }
        
        // Mobile view
        if (mobileUserSection) {
            mobileUserSection.innerHTML = `
                <div class="user-status">
                    <div class="user-avatar">${username.charAt(0).toUpperCase()}</div>
                    <span class="user-name">${username}</span>
                    <button class="logout-btn" id="mobileLogoutBtn">Logout</button>
                </div>
            `;
        }
        
        // Add logout event listeners
        document.getElementById('logoutBtn')?.addEventListener('click', handleLogout);
        document.getElementById('mobileLogoutBtn')?.addEventListener('click', handleLogout);
    } else {
        // Desktop view
        if (userSection) {
            userSection.innerHTML = `
                <a href="signin.html" class="nav-btn"><i class="fas fa-sign-in-alt"></i> Sign In</a>
                <a href="register.html" class="nav-btn"><i class="fas fa-user-plus"></i> Register</a>
            `;
        }
        
        // Mobile view
        if (mobileUserSection) {
            mobileUserSection.innerHTML = `
                <a href="signin.html" class="mobile-menu-btn"><i class="fas fa-sign-in-alt"></i> Sign In</a>
                <a href="register.html" class="mobile-menu-btn"><i class="fas fa-user-plus"></i> Register</a>
            `;
        }
    }
}

// Handle logout
function handleLogout() {
    localStorage.removeItem('isLoggedIn');
    localStorage.removeItem('username');
    location.reload();
}

// Initialize on page load
document.addEventListener('DOMContentLoaded', function() {
    renderAuthButtons();
    
    
});