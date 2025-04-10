@echo off
cd C:/Teaching/VocabQuiz/vocabulary-quiz/
start "" node server.js
timeout /t 5 >nul
start "" ngrok http --domain=serval-keen-visually.ngrok-free.app 3000