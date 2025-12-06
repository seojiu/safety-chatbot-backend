async function sendMessage() {
  const input = document.getElementById("userInput");
  const chatbox = document.getElementById("chatbox");

  const message = input.value.trim();
  if (!message) return;

  chatbox.innerHTML += `<div class="msg user">👩‍💻 ${message}</div>`;
  input.value = "";

  const response = await fetch("http://127.0.0.1:5000/chat", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ message }),
  });

  const data = await response.json();

  // ✅ 줄바꿈 문자(\n)를 HTML <br>로 변환
  const formattedResponse = data.response.replace(/\n/g, "<br>");

  const accidentProb = data.accident_prob
    ? `${data.accident_prob.toFixed(2)}%`
    : "N/A";

  const typeLabel = data.type_label && data.type_label !== "예측 없음"
    ? data.type_label
    : "해당 없음";

  chatbox.innerHTML += `
    <div class="msg bot">
      🤖 ${formattedResponse}<br><br>
      <small>📊 예측결과: ${accidentProb} | 예측 유형: ${typeLabel}</small>
    </div>
  `;

  chatbox.scrollTop = chatbox.scrollHeight;
}
