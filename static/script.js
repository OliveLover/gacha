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

// 캡슐이 채워질 좌표(아래 줄부터 순서대로, 아래쪽에 뭉쳐서 쌓이도록). .capsule-pile 기준 %.
// 각도(rot)를 조금씩 다르게 줘서 흐트러진 무더기처럼 보이게 함.
const CAPSULE_SLOTS = [
    { x: 25, y: 78, rot: -12 },
    { x: 38, y: 78, rot: 8 },
    { x: 51, y: 78, rot: -5 },
    { x: 64, y: 78, rot: 14 },
    { x: 78, y: 78, rot: -9 },
    { x: 25, y: 66, rot: 10 },
    { x: 33, y: 66, rot: -14 },
    { x: 44, y: 66, rot: 6 },
    { x: 55, y: 66, rot: -8 },
    { x: 66, y: 66, rot: 13 },
    { x: 77, y: 66, rot: -6 },
    { x: 27, y: 54, rot: -10 },
    { x: 42, y: 54, rot: 9 },
    { x: 57, y: 54, rot: -13 },
    { x: 72, y: 54, rot: 7 },
    { x: 33, y: 42, rot: -7 },
    { x: 50, y: 42, rot: 11 },
    { x: 67, y: 42, rot: -4 },
];
const MAX_CAPSULE_PILE = CAPSULE_SLOTS.length;
let isPulling = false;

function randomCapsuleImg(slot) {
    const color = CAPSULE_COLORS[Math.floor(Math.random() * CAPSULE_COLORS.length)];
    const img = document.createElement('img');
    img.src = `/static/images/objects/capsule_${color}.png`;
    img.alt = '';
    img.dataset.color = color;
    img.style.left = `${slot.x}%`;
    img.style.top = `${slot.y}%`;
    img.style.setProperty('--rot', `${slot.rot || 0}deg`);
    img.style.setProperty('--shake', `${(Math.random() * 6 - 3).toFixed(1)}px`);
    img.style.setProperty('--shake-delay', `-${(Math.random() * 0.18).toFixed(2)}s`);
    return img;
}

async function initCapsulePile() {
    const pile = document.getElementById('capsule-pile');
    if (!pile) return;

    try {
        const res = await fetch('/api/v1/capsules/count');
        const data = await res.json();
        if (!res.ok) throw new Error(data.error || '캡슐 개수를 불러오지 못했습니다.');

        const shown = Math.min(data.count, MAX_CAPSULE_PILE);
        pile.innerHTML = '';
        for (let i = 0; i < shown; i++) {
            pile.appendChild(randomCapsuleImg(CAPSULE_SLOTS[i]));
        }
    } catch (e) {
        pile.innerHTML = '';
    }
}

function addCapsuleToPile() {
    const pile = document.getElementById('capsule-pile');
    if (!pile || pile.children.length >= MAX_CAPSULE_PILE) return;

    const img = randomCapsuleImg(CAPSULE_SLOTS[pile.children.length]);
    img.classList.add('capsule-enter');
    pile.appendChild(img);

    requestAnimationFrame(() => {
        img.classList.remove('capsule-enter');
    });
}

function removeCapsuleFromPile() {
    const pile = document.getElementById('capsule-pile');
    if (!pile || !pile.lastElementChild) return null;
    const removed = pile.lastElementChild;
    const color = removed.dataset.color;
    pile.removeChild(removed);
    return color;
}

let lastDrawnCapsule = null;

// 클릭한 시점의 통통 튀는/그림자 흔들림 애니메이션 상태를 그대로 굳혀서 멈춤.
function freezeCapsuleHop() {
    const capsule = document.getElementById('gacha-capsule');
    if (!capsule.classList.contains('drop')) return;

    const computed = getComputedStyle(capsule).transform;
    capsule.style.transformOrigin = 'bottom center';
    capsule.style.transform = computed === 'none' ? 'translate(-50%, 0)' : computed;
    capsule.style.opacity = getComputedStyle(capsule).opacity;
    capsule.style.animation = 'none';
    capsule.classList.remove('drop');

    const shadow = document.getElementById('gacha-capsule-shadow');
    const shadowComputed = getComputedStyle(shadow).transform;
    shadow.style.transform = shadowComputed === 'none' ? 'translate(-50%, 0)' : shadowComputed;
    shadow.style.opacity = getComputedStyle(shadow).opacity;
    shadow.style.animation = 'none';
    shadow.classList.remove('show');
}

// 모달을 닫으면 캡슐이 점점 사라지며 제거됨(메시지를 다 읽었다는 의미).
function dismissCapsule() {
    const capsule = document.getElementById('gacha-capsule');
    if (capsule.style.display === 'none' || !lastDrawnCapsule) return;

    lastDrawnCapsule = null;

    // 그림자는 캡슐과 별개로 fade하지 않고, 캡슐이 사라지기 시작하는 순간 바로 사라짐
    const shadow = document.getElementById('gacha-capsule-shadow');
    shadow.style.transition = '';
    shadow.style.animation = 'none';
    shadow.style.opacity = '0';

    capsule.style.transition = 'opacity 0.6s ease, transform 0.6s ease';
    void capsule.offsetHeight; // 강제 리플로우
    capsule.style.opacity = '0';
    capsule.style.transform = `${capsule.style.transform} translateY(-16px) scale(0.75)`;

    setTimeout(() => {
        capsule.style.display = 'none';
        capsule.style.transition = '';
        shadow.style.transform = '';
        shadow.style.opacity = '';
    }, 620);
}

function showCapsuleModal() {
    if (!lastDrawnCapsule) return;

    freezeCapsuleHop();

    document.getElementById('modal-capsule-nickname').innerText =
        `${lastDrawnCapsule.nickname}님의 메시지`;
    document.getElementById('modal-capsule-message').innerText = lastDrawnCapsule.message;

    const modalEl = document.getElementById('capsule-modal');
    bootstrap.Modal.getOrCreateInstance(modalEl).show();
}

const capsuleModalEl = document.getElementById('capsule-modal');
if (capsuleModalEl) capsuleModalEl.addEventListener('hidden.bs.modal', dismissCapsule);

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

    capsule.classList.remove('drop');
    capsule.style.display = 'none';
    capsule.style.transition = '';
    capsule.style.animation = '';
    capsule.style.opacity = '';
    capsule.style.transform = '';
    capsule.style.transformOrigin = '';

    const shadow = document.getElementById('gacha-capsule-shadow');
    shadow.classList.remove('show');
    shadow.style.transition = '';
    shadow.style.animation = '';
    shadow.style.opacity = '';
    shadow.style.transform = '';

    const pile = document.getElementById('capsule-pile');
    pile.classList.add('shaking');

    let frame = 0;
    const totalSpins = 8;
    const spinInterval = setInterval(async () => {
        const frameNumber = (frame % 4) + 1;
        knobImg.src = `/static/images/objects/machine-labor_${frameNumber}.png`;
        frame++;

        if (frame >= totalSpins) {
            clearInterval(spinInterval);
            knobImg.src = '/static/images/objects/machine-labor_1.png';
            pile.classList.remove('shaking');

            try {
                const res = await fetch('/api/v1/capsules/draw', {
                    method: 'POST',
                    headers: { Authorization: `Bearer ${token}` },
                });

                const data = await res.json();

                if (!res.ok) {
                    throw new Error(data.error || '캡슐을 뽑지 못했습니다.');
                }

                lastDrawnCapsule = { nickname: data.nickname, message: data.message };

                const removedColor = removeCapsuleFromPile();
                const color =
                    removedColor ||
                    CAPSULE_COLORS[Math.floor(Math.random() * CAPSULE_COLORS.length)];
                capsule.src = `/static/images/objects/capsule_${color}.png`;
                capsule.style.display = 'block';
                void capsule.offsetHeight; // 강제 리플로우: display:block 상태를 먼저 그리게 함
                capsule.classList.add('drop');
                shadow.classList.add('show');
            } catch (e) {
                alert(e.message);
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
        messageEl.innerText = '';
        addCapsuleToPile();

        const modalEl = document.getElementById('capsule-write-modal');
        bootstrap.Modal.getOrCreateInstance(modalEl).hide();
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
initCapsulePile();

const nickname = localStorage.getItem('nickname');
if (nickname && document.getElementById('profile-area')) {
    showProfile(nickname, localStorage.getItem('avatar'));
}
