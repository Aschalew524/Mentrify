// Testimonials Carousel
const testimonials = document.querySelectorAll('.testimonial-card');
const prevBtn = document.querySelector('.carousel-prev');
const nextBtn = document.querySelector('.carousel-next');
let currentTestimonial = 0;
let carouselInterval;

function showTestimonial(idx) {
  testimonials.forEach((card, i) => {
    card.classList.toggle('active', i === idx);
  });
}

function nextTestimonial() {
  currentTestimonial = (currentTestimonial + 1) % testimonials.length;
  showTestimonial(currentTestimonial);
}

function prevTestimonial() {
  currentTestimonial = (currentTestimonial - 1 + testimonials.length) % testimonials.length;
  showTestimonial(currentTestimonial);
}

function startCarousel() {
  carouselInterval = setInterval(nextTestimonial, 5000);
}

function stopCarousel() {
  clearInterval(carouselInterval);
}

if (prevBtn && nextBtn) {
  prevBtn.addEventListener('click', () => {
    stopCarousel();
    prevTestimonial();
    startCarousel();
  });
  nextBtn.addEventListener('click', () => {
    stopCarousel();
    nextTestimonial();
    startCarousel();
  });
}

showTestimonial(currentTestimonial);
startCarousel();

// Smooth scroll for navbar links
const navLinks = document.querySelectorAll('.navbar nav a[href^="#"]');
navLinks.forEach(link => {
  link.addEventListener('click', function(e) {
    e.preventDefault();
    const target = document.querySelector(this.getAttribute('href'));
    if (target) {
      window.scrollTo({
        top: target.offsetTop - 70,
        behavior: 'smooth'
      });
    }
  });
});

// Animation on scroll for fade-in-up and zoom-in
function animateOnScroll() {
  const fadeUps = document.querySelectorAll('.fade-in-up, .zoom-in');
  fadeUps.forEach(el => {
    const rect = el.getBoundingClientRect();
    if (rect.top < window.innerHeight - 60) {
      el.style.animationPlayState = 'running';
      el.classList.add('animated');
    }
  });
}
window.addEventListener('scroll', animateOnScroll);
window.addEventListener('DOMContentLoaded', animateOnScroll); 