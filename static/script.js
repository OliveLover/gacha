// GET /api/v1/avatars 결과를 캐싱해서 재사용
let availableAvatars = [];
let selectedAvatarId = '';

async function fetchAvatars() {
    if (availableAvatars.length > 0) return availableAvatars;

    try {
        const res = await fetch('/api/v1/avatars');
        availableAvatars = (await res.json()) || [];
    } catch (e) {
        availableAvatars = [];
    }

    return availableAvatars;
}

async function renderAvatarPicker() {
    const picker = document.getElementById('avatar-picker');
    if (!picker) return;

    const avatars = await fetchAvatars();

    picker.innerHTML = avatars
        .map(
            (avatar) =>
                `<img src="${avatar.key}" class="avatar-option" data-id="${avatar.id}" onclick="selectAvatar('${avatar.id}')" />`
        )
        .join('');

    if (avatars.length > 0) {
        selectAvatar(avatars[0].id);
    }
}

function selectAvatar(id) {
    selectedAvatarId = id;
    document.querySelectorAll('#avatar-picker .avatar-option').forEach((el) => {
        el.classList.toggle('selected', el.dataset.id === id);
    });
}

async function renderHeaderAvatarPicker(currentAvatar) {
    const picker = document.getElementById('header-avatar-picker');
    if (!picker) return;

    const avatars = await fetchAvatars();

    picker.innerHTML = avatars
        .map(
            (avatar) =>
                `<img src="${avatar.key}" class="avatar-option${
                    avatar.key === currentAvatar ? ' selected' : ''
                }" onclick="changeAvatar('${avatar.id}')" />`
        )
        .join('');
}

async function signup(e) {
    e.preventDefault();

    const body = {
        email: document.getElementById('email').value,
        nickname: document.getElementById('nickname').value,
        password: document.getElementById('password').value,
        avatar_id: selectedAvatarId,
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
        localStorage.setItem('avatar', data.user.avatar || '');
        window.location.href = '/';
    } catch (e) {
        document.getElementById('message').innerText = e.message;
        document.getElementById('message').style.color = '#d33';
    }
}

function showProfile(nickname, avatar) {
    const loginLink = document.getElementById('login-link');
    const profileArea = document.getElementById('profile-area');
    if (!loginLink || !profileArea) return;

    loginLink.classList.add('d-none');
    profileArea.classList.remove('d-none');

    const profileCircle = document.getElementById('profile-circle');
    profileCircle.innerHTML = avatar
        ? `<img src="${avatar}" class="profile-avatar-img" />`
        : nickname.charAt(0).toUpperCase();

    document.getElementById('profile-nickname').innerText = nickname;
    document.getElementById('header-nickname').innerText = nickname;

    renderHeaderAvatarPicker(avatar);
}

function logout() {
    localStorage.removeItem('nickname');
    localStorage.removeItem('token');
    localStorage.removeItem('avatar');
    window.location.href = '/';
}

async function changeAvatar(id) {
    const token = localStorage.getItem('token');
    if (!token) return;

    try {
        const res = await fetch('/api/v1/users/avatar', {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
                Authorization: `Bearer ${token}`,
            },
            body: JSON.stringify({ avatar_id: id }),
        });

        const data = await res.json();

        if (!res.ok) {
            throw new Error(data.error || '프로필 사진 변경 실패');
        }

        localStorage.setItem('avatar', data.avatar || '');
        document.getElementById('profile-circle').innerHTML = data.avatar
            ? `<img src="${data.avatar}" class="profile-avatar-img" />`
            : '';
        renderHeaderAvatarPicker(data.avatar);
    } catch (e) {
        alert(e.message);
    }
}

const signupForm = document.getElementById('signup-form');
if (signupForm) signupForm.addEventListener('submit', signup);

const loginForm = document.getElementById('login-form');
if (loginForm) loginForm.addEventListener('submit', login);

renderAvatarPicker();

const nickname = localStorage.getItem('nickname');
if (nickname && document.getElementById('profile-area')) {
    showProfile(nickname, localStorage.getItem('avatar'));
}
