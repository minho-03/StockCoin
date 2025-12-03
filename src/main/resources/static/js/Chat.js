// ====================================
// StockCoin - 실시간 채팅 (Chat.js)
// 로그인한 사용자만 채팅 가능
// ====================================

let stompClient = null;
let currentUserNickname = null;

// ====================================
// 1. 페이지 로드 시 실행
// ====================================
window.addEventListener('DOMContentLoaded', function() {
    fetchCurrentUser();           // 로그인 정보 가져오기
    loadPreviousMessages();       // DB에서 이전 메시지 로딩
    document.getElementById('sendBtn').addEventListener('click', sendMessage);

    document.getElementById('messageInput').addEventListener('keypress', function(e) {
        if (e.key === 'Enter') {
            sendMessage();
        }
    });
});

// ====================================
// 2. 현재 로그인 사용자 정보 가져오기
// ====================================
async function fetchCurrentUser() {
    try {
        const response = await axios.get('/user/current');

        if (response.data && response.data.nickname && response.data.nickname !== '익명') {
            currentUserNickname = response.data.nickname;
            console.log('현재 사용자:', currentUserNickname);

            connect(); // 로그인 된 경우 WebSocket 연결
        } else {
            showLoginRequired(); // 로그인 안 된 경우
        }
    } catch (error) {
        console.error('사용자 정보 가져오기 실패:', error);
        showLoginRequired();
    }
}

// ====================================
// 로그인 필요 UI & 알림
// ====================================
function showLoginRequired() {

    alert("로그인 후 채팅 기능을 이용할 수 있습니다.");

    // 입력창 비활성화
    document.getElementById('messageInput').disabled = true;
    document.getElementById('sendBtn').disabled = true;

    // 입력창 전체 숨기고 싶으면:
    // document.querySelector('.input-group').style.display = 'none';

    const chatArea = document.getElementById('chatArea');

    // 안내 문구 UI
    chatArea.innerHTML = `
        <div style="text-align:center; padding:80px 20px;">
            <h3 style="color:#6c757d; margin-bottom:20px;">🔒 로그인 필요</h3>
            <p style="color:#adb5bd; margin-bottom:30px;">
                실시간 채팅 기능을 사용하려면 로그인하세요.
            </p>
            <a href="/login" class="btn btn-primary" style="padding:12px 30px; border-radius:25px;">
                로그인하기
            </a>
        </div>
    `;

    stompClient = null; // WebSocket 연결 금지
}

// ====================================
// 3. 기존 메시지 로딩
// ====================================
async function loadPreviousMessages() {
    try {
        const response = await axios.get('/api/chat/messages');
        const messages = response.data;
        messages.forEach(msg => {
            displayMessage(msg.sender, msg.message, msg.timestamp);
        });
        scrollToBottom();
    } catch (error) {
        console.error('메시지 로드 실패:', error);
    }
}

// ====================================
// 4. WebSocket 연결
// ====================================
function connect() {
    console.log('WebSocket 연결 시도...');

    const socket = new SockJS('/ws/chat');
    stompClient = Stomp.over(socket);
    stompClient.debug = null;

    stompClient.connect({}, function(frame) {

        console.log("WebSocket 연결 성공:", frame);

        stompClient.subscribe('/topic/chat', function(message) {
            const chatMessage = JSON.parse(message.body);
            displayMessage(chatMessage.sender, chatMessage.message, chatMessage.timestamp);
        });

    }, function(error) {
        console.error("WebSocket 연결 실패:", error);
    });
}

// ====================================
// 5. 메시지 전송
// ====================================
function sendMessage() {
    const messageInput = document.getElementById('messageInput');
    const content = messageInput.value.trim();

    if (!content) return;

    if (!currentUserNickname) {
        alert("로그인이 필요합니다.");
        window.location.href = "/login";
        return;
    }

    if (!stompClient || !stompClient.connected) {
        alert("채팅 서버 연결 실패. 새로고침 후 다시 시도해주세요.");
        return;
    }

    const chatMessage = {
        sender: currentUserNickname,
        message: content,
        timestamp: getCurrentTime()
    };

    stompClient.send('/app/chat.send', {}, JSON.stringify(chatMessage));

    messageInput.value = '';
    messageInput.focus();
}

// ====================================
// 6. 메시지 표시
// ====================================
function displayMessage(sender, message, timestamp) {
    const chatArea = document.getElementById('chatArea');
    const isMyMessage = (sender === currentUserNickname);

    const box = document.createElement('div');
    box.className = isMyMessage ? 'msg-box msg-right' : 'msg-box msg-left';

    const timeStr = formatTime(timestamp);

    if (isMyMessage) {
        box.innerHTML = `
            <div>
                <div class="bubble">${escapeHtml(message)}</div>
                <div class="timestamp">${timeStr}</div>
            </div>
        `;
    } else {
        box.innerHTML = `
            <div>
                <div class="sender">${escapeHtml(sender)}</div>
                <div class="bubble">${escapeHtml(message)}</div>
                <div class="timestamp">${timeStr}</div>
            </div>
        `;
    }

    chatArea.appendChild(box);
    scrollToBottom();
}

// ====================================
// 7. 유틸 함수들
// ====================================
function getCurrentTime() {
    const now = new Date();
    return now.toISOString().replace("T", " ").substring(0, 19);
}

function formatTime(timestamp) {
    try {
        const date = new Date(timestamp);
        const h = date.getHours();
        const m = String(date.getMinutes()).padStart(2, '0');
        const period = h >= 12 ? "오후" : "오전";
        const hh = h > 12 ? h - 12 : (h === 0 ? 12 : h);
        return `${period} ${hh}:${m}`;
    } catch {
        return timestamp.substring(11, 16);
    }
}

function escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}

function scrollToBottom() {
    const chatArea = document.getElementById('chatArea');
    chatArea.scrollTop = chatArea.scrollHeight;
}
