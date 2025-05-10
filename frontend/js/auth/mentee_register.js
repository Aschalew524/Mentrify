document.querySelector('.mentee-register-form').addEventListener('submit', async function (e) {
  e.preventDefault();

  const errorDiv = document.getElementById('register-error');
  errorDiv.style.display = 'none';

  const firstName = document.getElementById('first-name').value.trim();
  const lastName = document.getElementById('last-name').value.trim();
  const email = document.getElementById('email').value.trim();
  const password = document.getElementById('password').value;
  const confirmPassword = document.getElementById('confirm-password').value;
  const interests = document.getElementById('interests').value.trim();
  const goals = document.getElementById('goals').value.trim();
  const userType = document.getElementById('user-type').value;

  if (password !== confirmPassword) {
    errorDiv.textContent = 'Passwords do not match.';
    errorDiv.style.display = 'block';
    return;
  }

  const payload = {
    first_name: firstName,
    last_name: lastName,
    email: email,
    password: password,
    password_confirmation: confirmPassword,
    user_type: userType,
    interests: interests,
    goals: goals
  };

  try {
    const res = await fetch('http://mentrifyapis.biruk.tech/api/register', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });

    const data = await res.json();

    if (res.ok)
       {
      const successDiv = document.createElement('div');
      successDiv.textContent = 'Registration successful! Redirecting to login...';
      successDiv.style.color = 'green';
      successDiv.style.marginBottom = '1rem';
      document.querySelector('.mentee-register-form').prepend(successDiv);
    
      setTimeout(() => {
        window.location.href = '../../pages/auth/login.html';
      }, 900); 
    }
    
     else {
      errorDiv.textContent = data.message || 'Registration failed. Please check your inputs.';
      errorDiv.style.display  = 'block';
    }
  } catch (err) {
    console.error(err);
    errorDiv.textContent = 'An error occurred. Please try again.';
    errorDiv.style.display = 'block';
  }
});
