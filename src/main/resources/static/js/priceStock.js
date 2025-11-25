// ===============================
// 공통 변수
// ===============================
let allStocks = [];
let originalStocks = [];
let sortState = { column: null, order: "none" };
let chartInstance = null;

// ===============================
// 1. 국내 주식 데이터 로드
// ===============================
async function loadStockData() {
  const spinner = document.getElementById("loadingSpinner");
  const table = document.getElementById("stockTable");
  const updateTime = document.getElementById("updateTime");

  spinner.style.display = "flex";
  table.style.display = "none";

  try {
    const res = await axios.get("/api/korea/list");
    allStocks = res.data;
    originalStocks = [...allStocks];

    renderStockTable(allStocks);

    spinner.style.display = "none";
    table.style.display = "table";
    updateTime.textContent =
      "마지막 업데이트: " + new Date().toLocaleTimeString("ko-KR");

  } catch {
    spinner.innerHTML = `<p class="text-danger">데이터 불러오기 실패</p>`;
  }
}

// ===============================
// 2. 표 렌더링
// ===============================
function renderStockTable(data) {
  const body = document.getElementById("stockTableBody");

  body.innerHTML = data
    .map((stock) => {
      const rateValue = parseFloat(stock.changeRate.replace(/[^0-9.-]/g, ""));
      const isUp = rateValue > 0;
      const isDown = rateValue < 0;

      const rateColor =
        isUp ? "text-up" :
        isDown ? "text-down" :
        "text-same";


      const rateIcon = isUp ? "▲ " : isDown ? "▼ " : "";

      return `
        <tr data-code="${stock.code}" data-name="${stock.name}">
          <td>⭐</td>
          <td class="text-start ps-3">${stock.name}</td>
          <td class="text-end pe-3">${stock.price}</td>
          <td class="text-end pe-3 ${rateColor}">${rateIcon}${stock.changeRate}</td>
          <td class="text-end pe-3">${stock.volume}</td>
        </tr>
      `;
    })
    .join("");

  document.querySelectorAll("#stockTableBody tr").forEach((row) => {
    row.addEventListener("click", () => {
      showChartModal(row.dataset.name, row.dataset.code);
    });
  });
}

// ===============================
// 3. 정렬
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
  if (order === "none") {
    sorted = [...originalStocks];
  } else {
    sorted = [...allStocks];
    const key = { price: "price", rate: "changeRate", volume: "volume" }[column];

    sorted.sort((a, b) => {
      const valA = parseFloat(a[key].replace(/[^0-9.-]/g, ""));
      const valB = parseFloat(b[key].replace(/[^0-9.-]/g, ""));
      return order === "asc" ? valA - valB : valB - valA;
    });
  }

  renderStockTable(sorted);
});

// ===============================
// 4. 검색 & 새로고침
// ===============================
document.getElementById("searchBtn").addEventListener("click", () => {
  const keyword = document.getElementById("searchInput").value.trim();

  if (!keyword) return renderStockTable(allStocks);

  const filtered = allStocks.filter(
    (s) => s.name.includes(keyword) || s.code.includes(keyword)
  );

  renderStockTable(filtered);
});

document.getElementById("refreshBtn").addEventListener("click", loadStockData);

// ===============================
// 5. 차트 모달
// ===============================
async function showChartModal(name, code) {
  const modalEl = document.getElementById("chartModal");
  const modal = new bootstrap.Modal(modalEl);
  document.getElementById("modalTitle").textContent = `${name} (${code}) 차트`;

  const chartContainer = document.getElementById("chartContainer");
  chartContainer.innerHTML = `
    <div class="d-flex justify-content-center mb-3 gap-2">
      <button class="btn btn-sm btn-outline-dark period-btn active" data-period="1m">1개월</button>
      <button class="btn btn-sm btn-outline-dark period-btn" data-period="3m">3개월</button>
      <button class="btn btn-sm btn-outline-dark period-btn" data-period="6m">6개월</button>
    </div>
    <div id="chartWrap" style="height:420px;">
          <canvas id="stockChart"></canvas>
      </div>
    `;

  const ctx = document.getElementById("stockChart").getContext("2d");

  async function loadChart(period = "1m") {
    try {
      const res = await axios.get(`/api/korea/detail/${code}?period=${period}`);
      const data = res.data;

      if (chartInstance) chartInstance.destroy();

      chartInstance = new Chart(ctx, {
        data: {
          labels: data.labels,
          datasets: [
            {
              type: "line",
              label: `${name} 주가`,
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
            title: { display: true, text: `${name} (${period}) 주가 & 거래량` }
          },
          scales: {
            yPrice: { position: "left" },
            yVolume: { position: "right", grid: { drawOnChartArea: false } }
          }
        }
      });
    } catch (err) {
      chartContainer.innerHTML = `<p class="text-danger text-center">데이터를 불러올 수 없습니다.</p>`;
    }
  }

  chartContainer.addEventListener("click", (e) => {
    if (e.target.classList.contains("period-btn")) {
      document.querySelectorAll(".period-btn").forEach((btn) =>
        btn.classList.remove("active")
      );
      e.target.classList.add("active");
      loadChart(e.target.dataset.period);
    }
  });

  await loadChart("1m");
  modal.show();
}

// ===============================
// DOM 로드 시 실행
// ===============================
document.addEventListener("DOMContentLoaded", loadStockData);

