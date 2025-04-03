let questions = [];
let currentQuestionIndex = 0;
let correctAnswers = 0;
let incorrectAnswers = 0;
let attemptedQuestions = 0;
let selectedQuestions = [];

// Get the question set from the URL
const urlParams = new URLSearchParams(window.location.search);
const questionSet = urlParams.get("set") || "A.json"; // Default to A.json if none is selected

async function loadQuestions() {
    const response = await fetch(questionSet);
    questions = await response.json();

    // Randomly shuffle questions and pick 20
    selectedQuestions = getRandomQuestions(20);

    displayQuestion();
}

function getRandomQuestions(num) {
    return questions.sort(() => Math.random() - 0.5).slice(0, num);
}

function shuffleOptions(options) {
    return options.sort(() => Math.random() - 0.5);
}

function displayQuestion() {
    const questionData = selectedQuestions[currentQuestionIndex];
    document.getElementById("question").innerText = questionData.question;

    const shuffledOptions = shuffleOptions(questionData.options);

    document.getElementById("option-A").innerText = `A) ${shuffledOptions[0]}`;
    document.getElementById("option-B").innerText = `B) ${shuffledOptions[1]}`;
    document.getElementById("option-C").innerText = `C) ${shuffledOptions[2]}`;
    document.getElementById("option-D").innerText = `D) ${shuffledOptions[3]}`;

    document.getElementById("option-A").onclick = () => checkAnswer(shuffledOptions[0]);
    document.getElementById("option-B").onclick = () => checkAnswer(shuffledOptions[1]);
    document.getElementById("option-C").onclick = () => checkAnswer(shuffledOptions[2]);
    document.getElementById("option-D").onclick = () => checkAnswer(shuffledOptions[3]);

    document.getElementById("correct-count").innerText = correctAnswers;
    document.getElementById("attempted-count").innerText = incorrectAnswers;
    document.getElementById("questions-left").innerText = selectedQuestions.length - attemptedQuestions;
}

function checkAnswer(selectedOption) {
    const correctAnswer = selectedQuestions[currentQuestionIndex].answer;
    const resultText = document.getElementById("result");

    attemptedQuestions++;

    if (selectedOption === correctAnswer) {
        correctAnswers++;
        resultText.innerText = "Correct! 🎉";
    } else {
        incorrectAnswers++;
        resultText.innerText = `Wrong! The correct answer is "${correctAnswer}".`;
    }

    document.getElementById("correct-count").innerText = correctAnswers;
    document.getElementById("attempted-count").innerText = incorrectAnswers;
    document.getElementById("questions-left").innerText = selectedQuestions.length - attemptedQuestions;

    currentQuestionIndex = (currentQuestionIndex + 1) % selectedQuestions.length;

    if (attemptedQuestions === selectedQuestions.length) {
        setTimeout(() => alert("Quiz Completed!"), 1000);
    } else {
        setTimeout(displayQuestion, 1000);
    }
}

window.onload = loadQuestions;
