document.addEventListener("DOMContentLoaded", () => {

  // ===============================
  // 1) 기존 메시지 먼저 불러오기
  // ===============================
  const chatArea = document.getElementById("chatArea");

  axios.get("/api/chat/messages").then(res => {
      res.data.forEach(m => {
          const div = document.createElement("div");
          div.innerHTML = `<strong>${m.sender}:</strong> ${m.message}`;
          chatArea.appendChild(div);
      });
      chatArea.scrollTop = chatArea.scrollHeight;
  });

  // ===============================
  // 2) WebSocket 연결
  // ===============================
  const socket = new SockJS('/ws/chat');
  const stompClient = Stomp.over(socket);

  const input = document.getElementById("messageInput");
  const sendBtn = document.getElementById("sendBtn");

  stompClient.connect({}, () => {

    // 메시지 받기
    stompClient.subscribe('/topic/chat', (msg) => {
      const body = JSON.parse(msg.body);

      const box = document.createElement("div");
      box.innerHTML = `<strong>${body.sender}:</strong> ${body.message}`;
      chatArea.appendChild(box);

      chatArea.scrollTop = chatArea.scrollHeight;
    });
  });

  // ===============================
  // 3) 메시지 전송
  // ===============================
  function sendMessage() {
    const text = input.value.trim();
    if (!text) return;

    stompClient.send("/app/chat.send", {}, JSON.stringify({ message: text }));
    input.value = "";
  }

  sendBtn.addEventListener("click", sendMessage);
  input.addEventListener("keyup", (e) => {
    if (e.key === "Enter") sendMessage();
  });

});
