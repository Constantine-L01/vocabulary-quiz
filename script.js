const words = [
    { question: "What is the synonym of 'happy'?", answer: "joyful" },
    { question: "What is the antonym of 'big'?", answer: "small" },
    { question: "What is another word for 'fast'?", answer: "quick" }
];

let currentQuestion = 0;

function loadQuestion() {
    document.getElementById("question").innerText = words[currentQuestion].question;
}

function checkAnswer() {
    let userAnswer = document.getElementById("answer").value.trim().toLowerCase();
    let correctAnswer = words[currentQuestion].answer.toLowerCase();

    if (userAnswer === correctAnswer) {
        document.getElementById("result").innerText = "Correct! 🎉";
    } else {
        document.getElementById("result").innerText = `Wrong! The correct answer is "${correctAnswer}".`;
    }

    // Move to the next question
    currentQuestion = (currentQuestion + 1) % words.length;
    document.getElementById("answer").value = "";
    setTimeout(loadQuestion, 2000);
}

window.onload = loadQuestion;
