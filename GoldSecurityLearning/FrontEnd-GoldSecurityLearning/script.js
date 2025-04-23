
    // Track completed quizzes in localStorage
function getCompletedQuizzes() {
    return JSON.parse(localStorage.getItem('completedQuizzes') || '[]');
}

function addCompletedQuiz(quizName) {
    const completedQuizzes = getCompletedQuizzes();
    if (!completedQuizzes.includes(quizName)) {
        completedQuizzes.push(quizName);
        localStorage.setItem('completedQuizzes', JSON.stringify(completedQuizzes));
    }
}
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
    
//});

    //document.addEventListener('DOMContentLoaded', function() {
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
                const quizName = document.title.includes('Phishing') ? 'phishing' :
                document.title.includes('Vishing') ? 'vishing' :
                document.title.includes('Smishing') ? 'smishing' : 'fakeads';

            // Add to completed quizzes if not already there
                const completedQuizzes = JSON.parse(localStorage.getItem('completedQuizzes') || '[]');
                if (!completedQuizzes.includes(quizName)) {
                completedQuizzes.push(quizName);
                localStorage.setItem('completedQuizzes', JSON.stringify(completedQuizzes));
   
   // Update progress bar immediately
   const progressPercent = (completedQuizzes.length / 4) * 100;
   const progressBar = document.querySelector('.progress-bar');
   if (progressBar) {
       progressBar.style.width = `${progressPercent}%`;
       progressBar.textContent = `${progressPercent}% Complete`;
   }
}
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
                //Reset incorrect feedback to original state
                if (feedback.classList.contains('incorrect')) {
                    feedback.innerHTML = '<i class="fas fa-times-circle"></i> Incorrect. Here\'s why your answer was wrong:';
                }
            });
            
            // jhide submit buttons
            questionSubmitBtns.forEach(btn => {
                btn.classList.remove('active');
            });
            
            //Hide all questions and show first one
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
            
            // show navigation
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
           
                
                
                    // Get quiz name from the page title
                    const quizName = document.title.includes('Phishing') ? 'phishing' :
                                     document.title.includes('Vishing') ? 'vishing' :
                                     document.title.includes('Smishing') ? 'smishing' : 'fakeads';
                    
                    // Data to send to backend
                    const quizData = {
                        quiz_name: quizName,
                        score: score,
                        passed: score >= 4, // 4/5 or better to pass
                        user_id: localStorage.getItem('user_id') ,
                        completed_quizzes: getCompletedQuizzes(), // Send all completed quizzes
                        overall_progress: (getCompletedQuizzes().length / 4) * 100
                    };
            
                    // REPLACE 
                    //API URL

                    fetch('https://your-backend-api.com/save-quiz', {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify(quizData)
                    })
                    .then(response => {
                        if (!response.ok) {
                            console.error('Failed to save results');
                        }
                    })
                    .catch(error => {
                        console.error('Error:', error);
                        // If offline, save to try again later
                        localStorage.setItem('pending_quiz', JSON.stringify(quizData));
                    });
                }
                function updateCourseProgress() {
                    const completedQuizzes = getCompletedQuizzes();
                    const progressPercent = (completedQuizzes.length / 4) * 100; // 4 quizzes total
                    
                    // Update the progress bar UI
                    const progressBar = document.querySelector('.progress-bar');
                    if (progressBar) {
                        progressBar.style.width = `${progressPercent}%`;
                        progressBar.textContent = `${progressPercent}% Complete`;
                    }
                }      
               
            //});
        
        
        
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
//document.addEventListener('DOMContentLoaded', function() {
    renderAuthButtons();
    
   // document.addEventListener('DOMContentLoaded', function() {
        const forgotPasswordForm = document.querySelector('.forgot-password-container form');
        
        if (forgotPasswordForm) {
            forgotPasswordForm.addEventListener('submit', async function(e) {
                e.preventDefault();
                
                const email = this.email.value;
                const submitBtn = this.querySelector('.reset-btn');
                
                try {
                    // Show loading state
                    submitBtn.disabled = true;
                    submitBtn.textContent = 'Sending...';
                    
                  
                    // REPLACE
                    // Correct API endpoint URL
                    // response format
                  
                    const response = await fetch('REPLACE URL here', {
                        method: 'POST',
                        headers: {
                            'Content-Type': 'application/json'
                        },
                        body: JSON.stringify({ 
                            email: email  //  may require additional fields
                        })
                    });
                    
                    if (!response.ok) {
                        const errorData = await response.json();
                        throw new Error(errorData.message || 'Failed to send reset link');
                    }
                    
                    
                    // REPLACE
                    // Success behavior (redirect or show message)
                    // Any data to store locally
                   
                    alert('If this email exists in our system, you will receive a reset link.');
                    window.location.href = 'signin.html';
                    
                } catch (error) {
                    alert(error.message || 'Failed to send reset link');
                    console.error('Password reset error:', error);
                } finally {
                    submitBtn.disabled = false;
                    submitBtn.textContent = 'Send Reset Link';
                }
            });
        }
    //});
    
    //  RESET PASSWORD FUNCTIONALITY
      
     //  document.addEventListener('DOMContentLoaded', function() {
        const resetForm = document.getElementById('resetPasswordForm');
        
        if (resetForm) {
            resetForm.addEventListener('submit', async function(e) {
                e.preventDefault();
                
                const newPassword = this.new_password.value;
                const confirmPassword = this.confirm_password.value;
                const passwordError = document.getElementById('passwordError');
                const submitBtn = this.querySelector('.update-btn');
                
                // Reset error display
                passwordError.style.display = 'none';
                
                // Validate password
                if (!validatePassword(newPassword)) {
                    passwordError.textContent = 'Password must contain at least 1 capital letter and 1 number';
                    passwordError.style.display = 'block';
                    return;
                }
                
                // Check if passwords match
                if (newPassword !== confirmPassword) {
                    passwordError.textContent = 'Passwords do not match';
                    passwordError.style.display = 'block';
                    return;
                }
                
                try {
                    // Show loading state
                    submitBtn.disabled = true;
                    submitBtn.textContent = 'Updating...';
                    
                    // Get token from URL
                    const urlParams = new URLSearchParams(window.location.search);
                    const token = urlParams.get('token');
                    
                    if (!token) {
                        throw new Error('Invalid reset link');
                    }
                    
                  
                    // REPLACE
                    // Correct API endpoint URL
                    // Expected request format
                    
                    const response = await fetch('//replace url here', {
                        method: 'POST',
                        headers: {
                            'Content-Type': 'application/json'
                        },
                        body: JSON.stringify({ 
                            token: token,
                            newPassword: newPassword
                            // any additional fields would go here
                        })
                    });
                    
                    if (!response.ok) {
                        const errorData = await response.json();
                        throw new Error(errorData.message || 'Failed to update password');
                    }
                    
                    // REPLACE
                    // Success behavior (redirect or show message)
                    // Any data to store locally
                   
                    alert('Password updated successfully!');
                    window.location.href = 'signin.html';
                    
                } catch (error) {
                    passwordError.textContent = error.message;
                    passwordError.style.display = 'block';
                    console.error('Password reset error:', error);
                } finally {
                    submitBtn.disabled = false;
                    submitBtn.textContent = 'Update Password';
                }
            });
        }
      // document.addEventListener('DOMContentLoaded', function() {
            // Answer selection
            document.querySelectorAll('.answer-option').forEach(option => {
                option.addEventListener('click', function() {
                    // Only if question isn't submitted yet
                    if (!this.closest('.question-card').classList.contains('submitted')) {
                        // Remove previous selection
                        this.closest('.question-card').querySelectorAll('.answer-option')
                            .forEach(opt => opt.classList.remove('selected'));
                        
                        // Select this option
                        this.classList.add('selected');
                        
                        // Enable submit button
                        this.closest('.question-card').querySelector('.question-submit-btn')
                            .classList.add('active');
                    }
                });
            });
            updateCourseProgress();
    });


// SIGN IN FORM 


document.getElementById('signinForm').addEventListener('submit', async (e) => {
    e.preventDefault(); //Stop form from reloading 
    
    // form values
    const username = e.target.username.value;
    const password = e.target.password.value;
    
    // client-side validation
    if (!username || !password) {
        alert('Please fill in all fields');
        return;
    }

    // data for API
    const loginData = {
        username: username,
        password: password
    };

    try {
        // Show loading state 
        const submitBtn = e.target.querySelector('.signin-btn');
        submitBtn.disabled = true;
        submitBtn.textContent = 'Signing In...';

       //REPLACE WITH 
        // correct API endpoint URL
        //  expected response format
        
        const response = await fetch('https://your-backend-api.com/api/login', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',  //CHECK OVER ONCE BACKEND IS DONE
                //If using CSRF tokens
                //'X-CSRF-Token': 'token-here'
            },
            body: JSON.stringify(loginData)
        });

        // Handle response
        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.message || 'Login failed');
        }

        //Successful login
        const data = await response.json();
        
       //REPLACE
        // Wait for backedn to see what to store 
        // either a JWT token or session cookie
       
      
        localStorage.setItem('authToken', data.token); //EX for JWT
        
        // Redirect after login
        window.location.href = 'index.html'; 

    } catch (error) {
        // Handle errors
        alert(error.message || 'An error occurred during login');
        console.error('Login error:', error);
    } finally {
        // Reset button state
        const submitBtn = e.target.querySelector('.signin-btn');
        if (submitBtn) {
            submitBtn.disabled = false;
            submitBtn.textContent = 'Sign In';
        }
    }
});


// REGISTER FORM HANDLER


document.getElementById('registerForm').addEventListener('submit', async (e) => {
    e.preventDefault();
    
    //Get form values
    const formData = {
        fullname: e.target.fullname.value,
        email: e.target.email.value,
        username: e.target.username.value,
        password: e.target.password.value,
        confirm_password: e.target.confirm_password.value
    };

    // Validate password
    const passwordError = document.getElementById('passwordError');
    passwordError.style.display = 'none';
    
    if (!validatePassword(formData.password)) {
        passwordError.textContent = 'Password must contain at least 1 capital letter and 1 number';
        passwordError.style.display = 'block';
        return;
    }
    
    // Check if passwords match
    if (formData.password !== formData.confirm_password) {
        passwordError.textContent = 'Passwords do not match';
        passwordError.style.display = 'block';
        return;
    }

    try {
        // Show loading state
        const submitBtn = e.target.querySelector('.register-btn');
        submitBtn.disabled = true;
        submitBtn.textContent = 'Registering...';

        //REPLACE with
        // correct API endpoint URL
        // expected request format
        // response format
       
        const response = await fetch('https://your-backend-api.com/api/register', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',   //CHECK ONCE BACKEND DONE
                // If using CSRF tokens
                // 'X-CSRF-Token': 'token-here'
            },
            body: JSON.stringify({
                fullname: formData.fullname,
                email: formData.email,
                username: formData.username,
                password: formData.password
            })
        });

        // Handle response
        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.message || 'Registration failed');
        }

        //Successful registration
        const data = await response.json();
        
        
        // either
        // Redirect to login page
        // Automatically log user in
        alert('Registration successful! Please sign in.');
        window.location.href = 'signin.html';

    } catch (error) {
        //Handle errors
        const errorElement = document.getElementById('passwordError');
        errorElement.textContent = error.message;
        errorElement.style.display = 'block';
        console.error('Registration error:', error);
    } finally {
        // Reset button state
        const submitBtn = e.target.querySelector('.register-btn');
        if (submitBtn) {
            submitBtn.disabled = false;
            submitBtn.textContent = 'Register';
        }
    }
});

// Password validation 
function validatePassword(password) {
    const hasCapital = /[A-Z]/.test(password);
    const hasNumber = /[0-9]/.test(password);
    return hasCapital && hasNumber;
}



  



// Password validation helper 
function validatePassword(password) {
    const hasCapital = /[A-Z]/.test(password);
    const hasNumber = /[0-9]/.test(password);
    return hasCapital && hasNumber;
}




    // Submit answer
    document.querySelectorAll('.question-submit-btn').forEach(btn => {
        btn.addEventListener('click', function() {
            const questionCard = this.closest('.question-card');
            const selectedOption = questionCard.querySelector('.answer-option.selected');
            const correctAnswer = questionCard.getAttribute('data-correct');
            
            if (selectedOption) {
                questionCard.classList.add('submitted');
                this.classList.remove('active');
                
                // Check if correct
                if (selectedOption.getAttribute('data-option') === correctAnswer) {
                    selectedOption.classList.add('correct');
                    questionCard.querySelector('.question-feedback.correct').style.display = 'block';
                } else {
                    selectedOption.classList.add('incorrect');
                    questionCard.querySelector('.question-feedback.incorrect').style.display = 'block';
                }
            }
        });
    });

    
    document.getElementById('mobileMenuBtn').addEventListener('click', function() {
        document.getElementById('mobileMenu').classList.toggle('active');
    });



    