// ===============================
// 공통 변수
// ===============================
let allCoins = [];
let originalCoins = [];
let sortState = { column: null, order: "none" };
let chartInstance = null;
let userFavorites = new Set();

// ===============================
// 0. 관심종목 로드
// ===============================
async function checkLoginAndLoadFavorites() {
  try {
    const res = await axios.get("/api/favorites/type/COIN");
    userFavorites = new Set(res.data.map(f => f.symbol));
  } catch (err) {
    userFavorites = new Set();
  }
}

// ===============================
// 1. 업비트 API 데이터 로드
// ===============================
async function loadCoinData() {
  const spinner = document.getElementById("loadingSpinner");
  const table = document.getElementById("coinTable");
  const updateTime = document.getElementById("updateTime");

  spinner.style.display = "flex";
  table.style.display = "none";

  try {
    await checkLoginAndLoadFavorites();
    
    const res = await axios.get("/api/coin/list");
    allCoins = res.data;
    originalCoins = [...allCoins];
    renderTable(allCoins);
    spinner.style.display = "none";
    table.style.display = "table";
    updateTime.textContent = "마지막 업데이트: " + new Date().toLocaleTimeString("ko-KR");
    connectWebSocket();
  } catch {
    spinner.innerHTML = `<p class="text-danger">데이터 불러오기 실패</p>`;
  }
}

// ===============================
// 2. 표 렌더링
// ===============================
function renderTable(data) {
  const body = document.getElementById("coinTableBody");
  body.innerHTML = data.map(coin => {
    const rateValue = parseFloat(coin.changeRate);
    const isUp = rateValue > 0;
    const isDown = rateValue < 0;
    const rateColor = isUp ? "text-danger fw-bold" : isDown ? "text-primary fw-bold" : "text-secondary";
    const rateIcon = isUp ? "▲ " : isDown ? "▼ " : "";
    
    const isFavorite = userFavorites.has(coin.code);
    const starIcon = isFavorite ? "⭐" : "☆";
    
    return `
      <tr data-code="${coin.code}" data-name="${coin.name}">
        <td class="favorite-star" data-code="${coin.code}" data-name="${coin.name}" style="cursor:pointer;">${starIcon}</td>
        <td class="coin-name" style="cursor:pointer;">${coin.name}</td>
        <td class="price-cell coin-data" style="cursor:pointer;">${coin.price}</td>
        <td class="${rateColor} coin-data" style="cursor:pointer;">${rateIcon}${coin.changeRate}</td>
        <td class="coin-data" style="cursor:pointer;">${coin.volume}</td>
      </tr>`;
  }).join("");

  attachEventListeners();
}

// ===============================
// 3. 이벤트 리스너
// ===============================
function attachEventListeners() {
  document.querySelectorAll(".favorite-star").forEach((star) => {
    star.addEventListener("click", async (e) => {
      e.stopPropagation();
      const code = star.dataset.code;
      const name = star.dataset.name;
      await toggleFavorite(code, name, star);
    });
  });

  document.querySelectorAll("#coinTableBody tr").forEach((row) => {
    row.querySelectorAll(".coin-name, .coin-data").forEach((cell) => {
      cell.addEventListener("click", () => {
        showChartModal(row.dataset.name, row.dataset.code);
      });
    });
  });
}

// ===============================
// 4. 관심종목 추가/삭제
// ===============================
async function toggleFavorite(code, name, starElement) {
  const isFavorite = userFavorites.has(code);

  try {
    if (isFavorite) {
      await axios.delete(`/api/favorites?symbol=${code}&type=COIN`);
      userFavorites.delete(code);
      starElement.textContent = "☆";
      showToast(`${name}이(가) 관심종목에서 제거되었습니다.`, "success");
    } else {
      await axios.post("/api/favorites", {
        symbol: code,
        name: name,
        type: "COIN"
      });
      userFavorites.add(code);
      starElement.textContent = "⭐";
      showToast(`${name}이(가) 관심종목에 추가되었습니다.`, "success");
    }
  } catch (err) {
    if (err.response && err.response.status === 401) {
      showToast("로그인이 필요합니다.", "warning");
      setTimeout(() => window.location.href = "/login", 1500);
    } else if (err.response && err.response.status === 409) {
      showToast("이미 등록된 관심종목입니다.", "warning");
    } else {
      showToast("오류가 발생했습니다.", "danger");
    }
  }
}

// ===============================
// 5. 토스트 알림
// ===============================
function showToast(message, type = "info") {
  const existingToast = document.querySelector(".custom-toast");
  if (existingToast) existingToast.remove();

  const toast = document.createElement("div");
  toast.className = `custom-toast alert alert-${type}`;
  toast.style.cssText = `
    position: fixed;
    top: 80px;
    right: 20px;
    z-index: 9999;
    min-width: 250px;
    animation: slideIn 0.3s ease-out;
  `;
  toast.textContent = message;

  document.body.appendChild(toast);

  setTimeout(() => {
    toast.style.animation = "slideOut 0.3s ease-out";
    setTimeout(() => toast.remove(), 300);
  }, 2000);
}

const style = document.createElement("style");
style.textContent = `
  @keyframes slideIn {
    from { transform: translateX(400px); opacity: 0; }
    to { transform: translateX(0); opacity: 1; }
  }
  @keyframes slideOut {
    from { transform: translateX(0); opacity: 1; }
    to { transform: translateX(400px); opacity: 0; }
  }
  .favorite-star { font-size: 1.2em; transition: transform 0.2s; }
  .favorite-star:hover { transform: scale(1.3); }
`;
document.head.appendChild(style);

// ===============================
// 6. 정렬 (3단계)
// ===============================
document.addEventListener("click", (e) => {
  if (!e.target.classList.contains("sortable")) return;
  const column = e.target.dataset.sort;
  let order = "asc";
  if (sortState.column === column) {
    if (sortState.order === "asc") order = "desc";
    else if (sortState.order === "desc") order = "none";
  }
  sortState = { column, order };

  let sorted = [];
  if (order === "none") sorted = [...originalCoins];
  else {
    sorted = [...allCoins];
    const key = { price: "price", rate: "changeRate", volume: "volume" }[column];
    sorted.sort((a, b) => {
      const valA = parseFloat(a[key].replace(/[^0-9.-]/g, ""));
      const valB = parseFloat(b[key].replace(/[^0-9.-]/g, ""));
      return order === "asc" ? valA - valB : valB - valA;
    });
  }

  renderTable(sorted);
  document.querySelectorAll("th.sortable").forEach(th => th.classList.remove("sorted", "asc", "desc"));
  if (order !== "none") e.target.classList.add("sorted", order);
});

// ===============================
// 7. 실시간 WebSocket
// ===============================
function connectWebSocket() {
  const socket = new WebSocket("wss://api.upbit.com/websocket/v1");

  socket.onopen = () => {
    const subscribeMsg = [
      { ticket: "StockCoinApp" },
      { type: "ticker", codes: allCoins.map(c => c.code) }
    ];
    socket.send(JSON.stringify(subscribeMsg));
  };

  socket.onmessage = async (event) => {
    const blob = event.data;
    const text = await new Response(blob).text();
    const json = JSON.parse(text);

    const code = json.code;
    const price = json.trade_price.toLocaleString();
    const rate = (json.signed_change_rate * 100).toFixed(2);
    const rateStr = (rate > 0 ? "+" : "") + rate + "%";
    const volume = json.acc_trade_volume_24h.toLocaleString();

    const row = document.querySelector(`tr[data-code='${code}']`);
    if (row) {
      row.querySelector(".price-cell").textContent = price;
      row.children[3].textContent = `${rate > 0 ? "▲" : rate < 0 ? "▼" : ""} ${rateStr}`;
      row.children[3].className = rate > 0 ? "text-danger fw-bold coin-data" : rate < 0 ? "text-primary fw-bold coin-data" : "text-secondary coin-data";
      row.children[4].textContent = volume;
    }
  };
  socket.onerror = () => console.error("WebSocket Error");
  socket.onclose = () => setTimeout(connectWebSocket, 5000);
}

// ===============================
// 8. 차트 모달
// ===============================
async function showChartModal(name, code) {
  const modalEl = document.getElementById("chartModal");
  const modal = new bootstrap.Modal(modalEl);
  document.getElementById("modalTitle").textContent = `${name} (${code}) 차트`;

  const chartContainer = document.getElementById("chartContainer");
  chartContainer.innerHTML = `
    <div class="d-flex justify-content-center mb-3 gap-2">
      <button class="btn btn-sm btn-outline-dark period-btn active" data-unit="days" data-count="7">1주</button>
      <button class="btn btn-sm btn-outline-dark period-btn" data-unit="days" data-count="30">1달</button>
      <button class="btn btn-sm btn-outline-dark period-btn" data-unit="weeks" data-count="12">3달</button>
    </div>
    <canvas id="coinChart"></canvas>
  `;

  const ctx = document.getElementById("coinChart").getContext("2d");

  async function loadChart(unit = "days", count = 30) {
    const res = await axios.get(`/api/coin/detail/${code}?unit=${unit}&count=${count}`);
    const data = res.data;

    if (chartInstance) chartInstance.destroy();

    chartInstance = new Chart(ctx, {
      data: {
        labels: data.labels,
        datasets: [
          {
            type: "line",
            label: `${name} 가격`,
            data: data.prices,
            borderColor: "#007bff",
            backgroundColor: "rgba(0,123,255,0.15)",
            borderWidth: 2,
            tension: 0.3,
            yAxisID: "yPrice"
          },
          {
            type: "bar",
            label: "거래량",
            data: data.volumes,
            backgroundColor: "rgba(180,180,180,0.5)",
            yAxisID: "yVolume"
          }
        ]
      },
      options: {
        maintainAspectRatio: false,
        plugins: {
          legend: { display: false },
          title: { display: true, text: `${name} (${unit}) 가격 & 거래량` }
        },
        scales: {
          yPrice: { position: "left" },
          yVolume: { position: "right", grid: { drawOnChartArea: false } }
        }
      }
    });
  }

  chartContainer.addEventListener("click", e => {
    if (e.target.classList.contains("period-btn")) {
      document.querySelectorAll(".period-btn").forEach(btn => btn.classList.remove("active"));
      e.target.classList.add("active");
      loadChart(e.target.dataset.unit, e.target.dataset.count);
    }
  });

  await loadChart("days", 30);
  modal.show();
}

// ===============================
// 9. 검색 / 새로고침
// ===============================
document.getElementById("searchBtn").addEventListener("click", () => {
  const keyword = document.getElementById("searchInput").value.trim();
  if (!keyword) return renderTable(allCoins);
  const filtered = allCoins.filter(c => c.name.includes(keyword) || c.code.includes(keyword));
  renderTable(filtered);
});
document.getElementById("refreshBtn").addEventListener("click", loadCoinData);
document.addEventListener("DOMContentLoaded", loadCoinData);