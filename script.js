let questions = [];
let currentQuestionIndex = 0;
let correctAnswers = 0;
let incorrectAnswers = 0;
let attemptedQuestions = 0;
let selectedQuestions = [];  // To hold 20 random questions for the session

async function loadQuestions() {
    const response = await fetch("questions.json");
    questions = await response.json();

    // Randomly shuffle questions and pick the first 20
    selectedQuestions = getRandomQuestions(20);

    // Display the first question
    displayQuestion();
}

function getRandomQuestions(num) {
    // Shuffle the questions array and select the first 'num' questions
    const shuffledQuestions = questions.sort(() => Math.random() - 0.5);
    return shuffledQuestions.slice(0, num);
}

function shuffleOptions(options) {
    // Shuffle the options for the current question
    return options.sort(() => Math.random() - 0.5);
}

function displayQuestion() {
    const questionData = selectedQuestions[currentQuestionIndex];
    document.getElementById("question").innerText = questionData.question;

    // Shuffle the options
    const shuffledOptions = shuffleOptions(questionData.options);

    // Assign shuffled options to A), B), C), D)
    document.getElementById("option-A").innerText = `A) ${shuffledOptions[0]}`;
    document.getElementById("option-B").innerText = `B) ${shuffledOptions[1]}`;
    document.getElementById("option-C").innerText = `C) ${shuffledOptions[2]}`;
    document.getElementById("option-D").innerText = `D) ${shuffledOptions[3]}`;

    // Set up event listeners to check the answer
    document.getElementById("option-A").onclick = () => checkAnswer(shuffledOptions[0]);
    document.getElementById("option-B").onclick = () => checkAnswer(shuffledOptions[1]);
    document.getElementById("option-C").onclick = () => checkAnswer(shuffledOptions[2]);
    document.getElementById("option-D").onclick = () => checkAnswer(shuffledOptions[3]);

    // Update question left and correct answers display
    document.getElementById("correct-count").innerText = correctAnswers;
    document.getElementById("attempted-count").innerText = incorrectAnswers;
    document.getElementById("questions-left").innerText = selectedQuestions.length - attemptedQuestions;
}

function checkAnswer(selectedOption) {
    const correctAnswer = selectedQuestions[currentQuestionIndex].answer;
    const resultText = document.getElementById("result");

    // Increment attempted questions counter
    attemptedQuestions++;

    if (selectedOption === correctAnswer) {
        correctAnswers++;  // Increment correct answers counter
        resultText.innerText = "Correct! 🎉";
    } else {
        incorrectAnswers++;
        resultText.innerText = `Wrong! The correct answer is "${correctAnswer}".`;
    }

    // Update the counters in the UI
    document.getElementById("correct-count").innerText = correctAnswers;
    document.getElementById("attempted-count").innerText = incorrectAnswers;
    document.getElementById("questions-left").innerText = selectedQuestions.length - attemptedQuestions;

    // Move to the next question after 2 seconds
    currentQuestionIndex = (currentQuestionIndex + 1) % selectedQuestions.length;

    // If all questions are answered, show a completion message
    if (attemptedQuestions === selectedQuestions.length) {
        setTimeout(() => alert("Quiz Completed!"), 1000);
    } else {
        setTimeout(displayQuestion, 1000);  // Show the next question after 2 seconds
    }
}

// Load questions on page load
window.onload = loadQuestions;
