async function signup(e) {
    e.preventDefault();

    const body = {
        email: document.getElementById('email').value,
        nickname: document.getElementById('nickname').value,
        password: document.getElementById('password').value,
    };

    try {
        const res = await fetch('/api/v1/signup', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(body),
        });

        const data = await res.json();

        if (!res.ok) {
            throw new Error(data.error || '회원가입 실패');
        }

        alert(`회원가입이 완료되었습니다.`);
        location.href = '/login';
    } catch (e) {
        document.getElementById('message').innerText = e.message;
        document.getElementById('message').style.color = '#d33';
    }
}

async function login(e) {
    e.preventDefault();

    const body = {
        email: document.getElementById('email').value,
        password: document.getElementById('password').value,
    };

    try {
        const res = await fetch('/api/v1/login', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(body),
        });

        const data = await res.json();

        if (!res.ok) {
            throw new Error(data.error || '로그인 실패');
        }

        localStorage.setItem('nickname', data.user.nickname || '');
        localStorage.setItem('token', data.token || '');
        window.location.href = '/';
    } catch (e) {
        document.getElementById('message').innerText = e.message;
        document.getElementById('message').style.color = '#d33';
    }
}

const signupForm = document.getElementById('signup-form');
if (signupForm) signupForm.addEventListener('submit', signup);

const loginForm = document.getElementById('login-form');
if (loginForm) loginForm.addEventListener('submit', login);
