document.addEventListener("DOMContentLoaded", () => {
  const loginForm = document.getElementById("login-form");
  const errorMessage = document.getElementById("login-error");

  loginForm.addEventListener("submit", async (e) => {
    e.preventDefault();

    const email = document.getElementById("email").value.trim();
    const password = document.getElementById("password").value.trim();

    try {
      const response = await fetch("https://mentrifyapis.biruk.tech/api/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
        },
        body: JSON.stringify({ email, password }),
      });

      const data = await response.json();

      if (response.ok && data.status === true) {
        console.log("Login successful:", data);

        // Save token and user data
        localStorage.setItem("access_token", data.access_token);
        localStorage.setItem("user", JSON.stringify(data.user));

        // Redirect based on user_type
        if (data.user.user_type === "mentee") {
          window.location.href = "../../pages/dashboard/mentee_dashboard.html";
        } 
        
        else if (data.user.user_type === "mentor") {

          window.location.href = "../../pages/dashboard/mentor_dashboard.html";
        } 

        else 
        {

          showError("Unknown user type.");
        }
      } else 
      {
        showError("Invalid email or password.");
      }
    } 
    
    catch (err) {
      console.error("Login error:", err);
      showError("Something went wrong. Please try again later.");
    }
  });

  function showError(message) {
    errorMessage.textContent = message;
    errorMessage.style.display = "block";
  }
});
