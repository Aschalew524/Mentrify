function openRegisterModal() {
    document.getElementById('register-modal').style.display = 'flex';
    document.body.style.overflow = 'hidden';
  }
  
  function closeRegisterModal() {
    document.getElementById('register-modal').style.display = 'none';
    document.body.style.overflow = '';
  }
  
  document.addEventListener('DOMContentLoaded', function() {
    var ctaBtns = document.querySelectorAll('.cta-btn');
    ctaBtns.forEach(function(btn) {
      btn.addEventListener('click', function(e) {
        e.preventDefault();
        openRegisterModal();
      });
    });
  });
  