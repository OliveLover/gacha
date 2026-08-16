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

const CAPSULE_COLORS = ['gray', 'red', 'yellow', 'pink', 'blue', 'green', 'brown', 'purple'];
let isPulling = false;

function pullGacha() {
    if (isPulling) return;

    const token = localStorage.getItem('token');
    if (!token) {
        alert('로그인이 필요합니다.');
        window.location.href = '/login';
        return;
    }

    isPulling = true;

    const knobImg = document.getElementById('knob-img');
    const capsule = document.getElementById('gacha-capsule');
    const result = document.getElementById('capsule-result');

    capsule.classList.remove('drop');
    capsule.style.display = 'none';
    result.classList.add('d-none');

    let frame = 0;
    const totalSpins = 8;
    const spinInterval = setInterval(async () => {
        const frameNumber = (frame % 4) + 1;
        knobImg.src = `/static/images/objects/machine-labor_${frameNumber}.png`;
        frame++;

        if (frame >= totalSpins) {
            clearInterval(spinInterval);
            knobImg.src = '/static/images/objects/machine-labor_1.png';

            try {
                const res = await fetch('/api/v1/capsules/draw', {
                    method: 'POST',
                    headers: { Authorization: `Bearer ${token}` },
                });

                const data = await res.json();

                if (!res.ok) {
                    throw new Error(data.error || '캡슐을 뽑지 못했습니다.');
                }

                const color = CAPSULE_COLORS[Math.floor(Math.random() * CAPSULE_COLORS.length)];
                capsule.src = `/static/images/objects/capsule_${color}.png`;
                capsule.style.display = 'block';
                requestAnimationFrame(() => capsule.classList.add('drop'));

                document.getElementById('capsule-result-nickname').innerText = `${data.nickname}님의 메시지`;
                document.getElementById('capsule-result-message').innerText = data.message;
                result.classList.remove('d-none');
            } catch (e) {
                document.getElementById('capsule-result-nickname').innerText = '';
                document.getElementById('capsule-result-message').innerText = e.message;
                result.classList.remove('d-none');
            } finally {
                isPulling = false;
            }
        }
    }, 120);
}

async function submitCapsule(e) {
    e.preventDefault();

    const messageEl = document.getElementById('capsule-form-message');
    const token = localStorage.getItem('token');
    if (!token) {
        messageEl.innerText = '로그인이 필요합니다.';
        messageEl.style.color = '#d33';
        return;
    }

    const textarea = document.getElementById('capsule-message');
    const message = textarea.value.trim();
    if (!message) return;

    try {
        const res = await fetch('/api/v1/capsules', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                Authorization: `Bearer ${token}`,
            },
            body: JSON.stringify({ message }),
        });

        const data = await res.json();

        if (!res.ok) {
            throw new Error(data.error || '캡슐 작성에 실패했습니다.');
        }

        textarea.value = '';
        messageEl.innerText = '캡슐에 담았습니다!';
        messageEl.style.color = 'green';
    } catch (e) {
        messageEl.innerText = e.message;
        messageEl.style.color = '#d33';
    }
}

const signupForm = document.getElementById('signup-form');
if (signupForm) signupForm.addEventListener('submit', signup);

const loginForm = document.getElementById('login-form');
if (loginForm) loginForm.addEventListener('submit', login);

const capsuleForm = document.getElementById('capsule-form');
if (capsuleForm) capsuleForm.addEventListener('submit', submitCapsule);

renderAvatarPicker();

const nickname = localStorage.getItem('nickname');
if (nickname && document.getElementById('profile-area')) {
    showProfile(nickname, localStorage.getItem('avatar'));
}
