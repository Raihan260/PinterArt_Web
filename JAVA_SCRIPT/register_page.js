document.addEventListener("DOMContentLoaded", function() {
    // Ambil elemen dari DOM
    const registerForm = document.getElementById("registerForm");
    const registerAlert = document.getElementById("registerAlert");
    const nameInput = document.getElementById("name");
    const emailInput = document.getElementById("email");
    const passwordInput = document.getElementById("password");
    const confirmPasswordInput = document.getElementById("confirm_password");
    const submitBtn = registerForm.querySelector('button[type="submit"]');

    // Fungsi untuk menampilkan pesan error
    function showAlert(message) {
        registerAlert.textContent = message;
        registerAlert.classList.remove("d-none");
    }

    // Fungsi untuk menyembunyikan pesan error
    function hideAlert() {
        registerAlert.classList.add("d-none");
        registerAlert.textContent = "";
    }
    
    // Sembunyikan alert saat user mulai mengetik
    [nameInput, emailInput, passwordInput, confirmPasswordInput].forEach(input => {
        input.addEventListener("input", hideAlert);
    });

    // Validasi format email
    function validateEmail(email) {
        const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return emailPattern.test(email);
    }

    // Validasi password: minimal 6 karakter, ada huruf dan angka
    function validatePassword(password) {
        return password.length >= 6 && /[A-Za-z]/.test(password) && /\d/.test(password);
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
    document.getElementById('toggleConfirmPassword').addEventListener('click', () => togglePasswordVisibility('confirm_password', 'toggleConfirmPassword'));


    // Event listener utama untuk form submission
    registerForm.addEventListener("submit", async function(event) {
        // **PENTING: Mencegah form mengirim data secara tradisional (mencegah reload)**
        event.preventDefault();
        
        // Sembunyikan alert yang mungkin masih muncul
        hideAlert();

        // Ambil nilai dari input
        const name = nameInput.value.trim();
        const email = emailInput.value.trim();
        const password = passwordInput.value;
        const confirmPassword = confirmPasswordInput.value;
        
        // --- Validasi Sisi Klien (Client-Side) ---
        if (!name) {
            showAlert("Full Name must be filled!");
            nameInput.focus();
            return;
        }
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
        if (!validatePassword(password)) {
            showAlert("Password must be at least 6 characters and contain letters and numbers!");
            passwordInput.focus();
            return;
        }
        if (password !== confirmPassword) {
            showAlert("Password and confirm password do not match!");
            confirmPasswordInput.focus();
            return;
        }
        
        // Nonaktifkan tombol dan ubah teksnya untuk memberi feedback ke user
        submitBtn.disabled = true;
        submitBtn.innerHTML = '<span class="spinner-border spinner-border-sm" role="status" aria-hidden="true"></span> Loading...';

        try {
            // **PENTING: Mengirim data ke server menggunakan Fetch API**
            const response = await fetch('http://localhost:3000/register', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ name, email, password }), // Kirim data sebagai JSON
            });

            // Ambil response dari server dalam format JSON
            const result = await response.json();

            if (response.ok) { // Jika server merespon dengan status 200-299
                // Jika registrasi sukses, arahkan ke halaman login
                window.location.href = 'login_page.html'; 
            } else {
                // Jika ada error dari server (misal: email sudah terdaftar)
                showAlert(result.message || 'An unknown error occurred.');
            }
        } catch (error) {
            // Jika ada error jaringan atau server tidak merespon
            console.error('Fetch Error:', error);
            showAlert('Cannot connect to the server. Please try again later.');
        } finally {
            // Apapun hasilnya (sukses/gagal), aktifkan kembali tombolnya
            submitBtn.disabled = false;
            submitBtn.textContent = 'Register';
        }
    });
    
    // --- Cinematic cross-fade slideshow ---
    (function setupCinematicCrossFade() {
        const intervalMs = 6000; // slide duration
        const cinematic = document.querySelector('.cinematic');
        if (!cinematic) return;

        const slides = Array.from(cinematic.querySelectorAll('.slide'));
        if (slides.length === 0) return;

        let current = 0;
        let timer = null;
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

        cinematic.addEventListener('mouseenter', stop);
        cinematic.addEventListener('mouseleave', start);
        cinematic.addEventListener('focusin', stop);
        cinematic.addEventListener('focusout', start);

        // keyboard controls
        cinematic.addEventListener('keydown', function(e) {
            if (e.key === 'ArrowRight') { stop(); showNext(); start(); }
            if (e.key === 'ArrowLeft')  { stop(); current = (current - 2 + slides.length) % slides.length; showNext(); start(); }
        });

        setTimeout(start, 500);
    })();
});