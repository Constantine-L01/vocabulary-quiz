
// Prevent unauthorized access
if (!localStorage.getItem("guest") && !localStorage.getItem("user_id")) {
    window.location.href = "login.html";
}