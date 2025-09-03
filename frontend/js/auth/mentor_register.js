
  function showStep(step) {
    if (step > 1) {
      const step1 = document.getElementById('step-1');
      if (step === 2 && step1.querySelectorAll('input:invalid, select:invalid').length > 0) {
        step1.querySelector('input:invalid, select:invalid')?.focus();
        return;
      }
      if (step === 3) {
        const step2 = document.getElementById('step-2');
        if (step2.querySelectorAll('input:invalid, select:invalid, textarea:invalid').length > 0) {
          step2.querySelector('input:invalid, select:invalid, textarea:invalid')?.focus();
          return;
        }
      }
    }

    for (let i = 1; i <= 3; i++) {
      document.getElementById('step-' + i).style.display = (i === step) ? '' : 'none';
      document.getElementsByClassName('register-step')[i - 1].classList.toggle('active', i === step);
      document.getElementsByClassName('register-step')[i - 1].classList.toggle('completed', i < step);
    }
  }

  /// Photo preview
document.getElementById('photo-input').addEventListener('change', function(e) {
  const file = e.target.files[0];
  if (file) {
    const reader = new FileReader();
    reader.onload = function(evt) {
      document.getElementById('photo-preview').innerHTML =
        `<img src="${evt.target.result}" style="width:100%;height:100%;object-fit:cover;border-radius:50%;">`;
    };
    reader.readAsDataURL(file);
  }
});

// Handle form submission via fetch
document.getElementById('mentor-register-form').addEventListener('submit', async function (e) {
  e.preventDefault();

  const errorDiv = document.getElementById('register-error') || createErrorDiv();

  const firstName = document.getElementById('first-name').value.trim();
  const lastName = document.getElementById('last-name').value.trim();
  const email = document.getElementById('email').value.trim();
  const password = document.getElementById('password').value;
  const confirmPassword = document.getElementById('confirm-password').value;
  const jobTitle = document.getElementById('job-title').value.trim();
  const location = document.getElementById('location').value;
  const category = document.getElementById('category').value;
  const skills = document.getElementById('skills').value.trim();
  const bio = document.getElementById('bio').value.trim();
  const experience = parseInt(document.getElementById('experience').value);
  const availability = parseInt(document.getElementById('availability').value);
  const photoFile = document.getElementById('photo-input').files[0];

  if (password !== confirmPassword) {
    errorDiv.textContent = 'Passwords do not match.';
    errorDiv.style.display = 'block';
    return;
  }

  let photoURL = 'https://example.com/photo.jpg'; // fallback

  // Upload image to Cloudinary (if selected)
  if (photoFile) {
    const cloudFormData = new FormData();
    cloudFormData.append('file', photoFile);
    cloudFormData.append('upload_preset', 'mentrify_unsigned');

    try {
      const cloudRes = await fetch('https://api.cloudinary.com/v1_1/mentrify/image/upload', {
        method: 'POST',
        body: cloudFormData
      });
      const cloudData = await cloudRes.json();

      if (cloudData.secure_url) {
        photoURL = cloudData.secure_url;
      } else {
        errorDiv.textContent = 'Photo upload failed.';
        errorDiv.style.display = 'block';
        return;
      }
    } catch (uploadErr) {
      console.error('Cloudinary Upload Error:', uploadErr);
      errorDiv.textContent = 'Image upload error. Please try again.';
      errorDiv.style.display = 'block';
      return;
    }
  }

  const payload = {
    first_name: firstName,
    last_name: lastName,
    email: email,
    password: password,
    password_confirmation: confirmPassword,
    user_type: 'mentor',
    photo_url: photoURL,
    job_title: jobTitle,
    location: location,
    category: category,
    skills: skills,
    bio: bio,
    years_of_experience: experience,
    availability_hours_week: availability
  };

  try {
    const res = await fetch('https://mentrifyapis.biruk.tech/api/register', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });

    const data = await res.json();

    if (res.ok) {
      const successDiv = document.createElement('div');
      successDiv.textContent = 'Registration successful! Redirecting to login...';
      successDiv.style.color = 'green';
      successDiv.style.marginBottom = '1rem';
      document.getElementById('mentor-register-form').prepend(successDiv);

      setTimeout(() => {
        window.location.href = '../../pages/auth/login.html';
      }, 1000);
    } else {
      errorDiv.textContent = data.message || 'Registration failed. Please check your inputs.';
      errorDiv.style.display = 'block';
    }
  } catch (err) {
    console.error(err);
    errorDiv.textContent = 'An error occurred. Please try again.';
    errorDiv.style.display = 'block';
  }
});

function createErrorDiv() {
  const errorDiv = document.createElement('div');
  errorDiv.id = 'register-error';
  errorDiv.style.color = 'red';
  errorDiv.style.marginBottom = '1rem';
  errorDiv.style.display = 'none';
  document.getElementById('mentor-register-form').prepend(errorDiv);
  return errorDiv;
}
