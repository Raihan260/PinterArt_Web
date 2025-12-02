document.addEventListener("DOMContentLoaded", function() {
    // Ambil elemen dari DOM
    const loginForm = document.getElementById("loginForm");
    const loginAlert = document.getElementById("loginAlert");
    const emailInput = document.getElementById("email");
    const passwordInput = document.getElementById("password");
    const submitBtn = loginForm.querySelector('button[type="submit"]');

    // Fungsi untuk menampilkan pesan error
    function showAlert(message) {
        loginAlert.textContent = message;
        loginAlert.classList.remove("d-none");
    }

    // Fungsi untuk menyembunyikan pesan error
    function hideAlert() {
        loginAlert.classList.add("d-none");
        loginAlert.textContent = "";
    }

    // Sembunyikan alert saat user mulai mengetik
    [emailInput, passwordInput].forEach(input => {
        input.addEventListener("input", hideAlert);
    });

    // Validasi format email
    function validateEmail(email) {
        return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
    }
    
    // Fungsi untuk toggle show/hide password
    function togglePasswordVisibility(inputId, toggleId) {
        const passwordField = document.getElementById(inputId);
        const toggleIcon = document.getElementById(toggleId).querySelector('i');
        if (passwordField.type === "password") {
            passwordField.type = "text";
            toggleIcon.classList.remove("fa-eye-slash");
            toggleIcon.classList.add("fa-eye");
        } else {
            passwordField.type = "password";
            toggleIcon.classList.remove("fa-eye");
            toggleIcon.classList.add("fa-eye-slash");
        }
    }
    
    // Tambahkan event listener untuk ikon mata
    document.getElementById('togglePassword').addEventListener('click', () => togglePasswordVisibility('password', 'togglePassword'));

    // Event listener utama untuk form submission
    loginForm.addEventListener("submit", async function(event) {
        // **Mencegah form mengirim data secara tradisional (mencegah reload)**
        event.preventDefault();
        
        hideAlert();

        const email = emailInput.value.trim();
        const password = passwordInput.value;

        // --- Validasi Sisi Klien (Client-Side) ---
        if (!email) {
            showAlert("Email must be filled!");
            emailInput.focus();
            return;
        }
        if (!validateEmail(email)) {
            showAlert("Please enter a valid email address!");
            emailInput.focus();
            return;
        }
        if (!password) {
            showAlert("Password must be filled!");
            passwordInput.focus();
            return;
        }

        // Nonaktifkan tombol untuk feedback
        submitBtn.disabled = true;
        submitBtn.innerHTML = '<span class="spinner-border spinner-border-sm" role="status" aria-hidden="true"></span> Loading...';

        try {
            // **Mengirim data ke server menggunakan Fetch API**
            const response = await fetch('http://localhost:3000/login', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ email, password }),
            });

            const result = await response.json();

            if (response.ok) {
                // Jika login sukses, arahkan ke halaman home page
                window.location.href = 'home_page.html'; // Redirect ke halaman utama (relatif)
            } else {
                // Jika ada error dari server (misal: email/password salah)
                showAlert(result.message || 'Invalid email or password.');
            }
        } catch (error) {
            // Jika ada error jaringan
            console.error('Fetch Error:', error);
            showAlert('Cannot connect to the server. Please try again later.');
        } finally {
            // Aktifkan kembali tombolnya
            submitBtn.disabled = false;
            submitBtn.textContent = 'Login';
        }
    });

    /* Cinematic cross-fade slideshow
       - flexible: uses all .cinematic .slide imgs present in DOM
       - interval: change every `intervalMs`
       - pause on hover/focus for UX
    */
    (function setupCinematicCrossFade() {
        const intervalMs = 6000;      // change every 6s (adjustable)
        const transitionMs = 1200;    // should match CSS transition duration
        const cinematic = document.querySelector('.cinematic');
        if (!cinematic) return;

        const slides = Array.from(cinematic.querySelectorAll('.slide'));
        if (slides.length === 0) return;

        let current = 0;
        let timer = null;
        // ensure first slide visible
        slides.forEach((s, i) => s.classList.toggle('active', i === 0));

        function showNext() {
            const next = (current + 1) % slides.length;
            slides[current].classList.remove('active');
            slides[next].classList.add('active');
            current = next;
        }

        function start() {
            stop();
            timer = setInterval(showNext, intervalMs);
        }
        function stop() {
            if (timer) { clearInterval(timer); timer = null; }
        }

        // pause on hover / focus for better UX
        cinematic.addEventListener('mouseenter', stop);
        cinematic.addEventListener('mouseleave', start);
        cinematic.addEventListener('focusin', stop);
        cinematic.addEventListener('focusout', start);

        // start slideshow after small delay so layout finishes
        setTimeout(start, 500);

        // optional: keyboard control (left/right)
        cinematic.addEventListener('keydown', function(e) {
            if (e.key === 'ArrowRight') { stop(); showNext(); start(); }
            if (e.key === 'ArrowLeft')  { stop(); current = (current - 2 + slides.length) % slides.length; showNext(); start(); }
        });
    })();
});