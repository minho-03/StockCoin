let allCoins = [];
let originalCoins = [];
let sortState = { column: null, order: "none" };
let chartInstance = null;

// ✅ 1. 업비트 API 데이터 로드
async function loadCoinData() {
  const spinner = document.getElementById("loadingSpinner");
  const table = document.getElementById("coinTable");
  const updateTime = document.getElementById("updateTime");

  spinner.style.display = "flex";
  table.style.display = "none";

  try {
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

// ✅ 2. 표 렌더링
function renderTable(data) {
  const body = document.getElementById("coinTableBody");
  body.innerHTML = data.map(coin => {
    const rateValue = parseFloat(coin.changeRate);
    const isUp = rateValue > 0;
    const isDown = rateValue < 0;
    const rateColor = isUp ? "text-danger fw-bold" : isDown ? "text-primary fw-bold" : "text-secondary";
    const rateIcon = isUp ? "▲ " : isDown ? "▼ " : "";
    return `
      <tr data-code="${coin.code}" data-name="${coin.name}">
        <td>⭐</td>
        <td>${coin.name}</td>
        <td class="price-cell">${coin.price}</td>
        <td class="${rateColor}">${rateIcon}${coin.changeRate}</td>
        <td>${coin.volume}</td>
      </tr>`;
  }).join("");

  document.querySelectorAll("#coinTableBody tr").forEach(row => {
    row.addEventListener("click", () => showChartModal(row.dataset.name, row.dataset.code));
  });
}

// ✅ 3. 정렬 (3단계)
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

// ✅ 4. 실시간 WebSocket
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
      row.children[3].className = rate > 0 ? "text-danger fw-bold" : rate < 0 ? "text-primary fw-bold" : "text-secondary";
      row.children[4].textContent = volume;
    }
  };
  socket.onerror = () => console.error("WebSocket Error");
  socket.onclose = () => setTimeout(connectWebSocket, 5000);
}

// ✅ 5. 차트 모달
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

// ✅ 검색 / 새로고침
document.getElementById("searchBtn").addEventListener("click", () => {
  const keyword = document.getElementById("searchInput").value.trim();
  if (!keyword) return renderTable(allCoins);
  const filtered = allCoins.filter(c => c.name.includes(keyword) || c.code.includes(keyword));
  renderTable(filtered);
});
document.getElementById("refreshBtn").addEventListener("click", loadCoinData);
document.addEventListener("DOMContentLoaded", loadCoinData);
