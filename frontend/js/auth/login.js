document.addEventListener("DOMContentLoaded", () => {
  const loginForm = document.getElementById("login-form");
  const errorMessage = document.getElementById("login-error");

  loginForm.addEventListener("submit", async (e) => {
    e.preventDefault();

    const email = document.getElementById("email").value.trim();
    const password = document.getElementById("password").value.trim();

    try {
      // Step 1: Get CSRF cookie first (required for Sanctum)
      await fetch("http://mentrifyapis.biruk.tech/sanctum/csrf-cookie", {
        method: "GET",
        credentials: "include", // Important: include cookies
      });

      // Read XSRF-TOKEN cookie value (Laravel stores it base64 encoded)
      function getCookie(name) {
        const value = `; ${document.cookie}`;
        const parts = value.split(`; ${name}=`);
        if (parts.length === 2) return parts.pop().split(';').shift();
        return null;
      }

      const xsrfToken = getCookie('XSRF-TOKEN');
      const xsrfHeader = xsrfToken ? decodeURIComponent(xsrfToken) : null;

      // Step 2: Make login request with credentials and X-XSRF-TOKEN header
      const response = await fetch("http://mentrifyapis.biruk.tech/api/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
          ...(xsrfHeader ? { 'X-XSRF-TOKEN': xsrfHeader } : {}),
        },
        credentials: "include", // Important: include cookies for CSRF
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
