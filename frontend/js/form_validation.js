document.addEventListener("DOMContentLoaded", function () {
    // Form validation for login and registration
    const forms = document.querySelectorAll("form");

    forms.forEach(form => {
        form.addEventListener("submit", function (event) {
            event.preventDefault();
            let valid = true;
            
            // Validate inputs
            form.querySelectorAll("input").forEach(input => {
                if (!input.value.trim()) {
                    valid = false;
                    input.style.border = "2px solid red";
                } else {
                    input.style.border = "";
                }
            });

            if (valid) {
                alert("Form submitted successfully!");
                // You can replace the alert with actual form submission logic
            } else {
                alert("Please fill in all fields.");
            }
        });
    });
});
