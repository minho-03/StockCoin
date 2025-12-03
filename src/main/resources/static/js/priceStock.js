// ===============================
// 공통 변수
// ===============================
let allStocks = [];
let originalStocks = [];
let sortState = { column: null, order: "none" };
let chartInstance = null;
let userFavorites = new Set(); // 사용자의 관심종목 목록

// ===============================
// 0. 로그인 상태 및 관심종목 로드
// ===============================
async function checkLoginAndLoadFavorites() {
  try {
    const res = await axios.get("/api/favorites/type/STOCK");
    userFavorites = new Set(res.data.map(f => f.symbol));
  } catch (err) {
    // 로그인 안 되어있으면 빈 Set으로 유지 (에러 무시)
    if (err.response && err.response.status === 401) {
      // 401은 정상 - 로그인 안 한 것뿐
      userFavorites = new Set();
    } else {
      console.error("관심종목 로드 오류:", err);
    }
  }
}

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
    // 관심종목 먼저 로드
    await checkLoginAndLoadFavorites();

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

      // 관심종목 여부에 따라 별 아이콘 변경
      const isFavorite = userFavorites.has(stock.code);
      const starIcon = isFavorite ? "⭐" : "☆";

      return `
        <tr data-code="${stock.code}" data-name="${stock.name}">
          <td class="favorite-star" data-code="${stock.code}" data-name="${stock.name}" style="cursor:pointer;">${starIcon}</td>
          <td class="text-start ps-3 stock-name" style="cursor:pointer;">${stock.name}</td>
          <td class="text-end pe-3 stock-data" style="cursor:pointer;">${stock.price}</td>
          <td class="text-end pe-3 ${rateColor} stock-data" style="cursor:pointer;">${rateIcon}${stock.changeRate}</td>
          <td class="text-end pe-3 stock-data" style="cursor:pointer;">${stock.volume}</td>
        </tr>
      `;
    })
    .join("");

  // 이벤트 리스너 등록
  attachEventListeners();
}

// ===============================
// 3. 이벤트 리스너 등록
// ===============================
function attachEventListeners() {
  // 별 아이콘 클릭 이벤트 (관심종목 추가/삭제)
  document.querySelectorAll(".favorite-star").forEach((star) => {
    star.addEventListener("click", async (e) => {
      e.stopPropagation(); // 행 클릭 이벤트 막기
      const code = star.dataset.code;
      const name = star.dataset.name;
      await toggleFavorite(code, name, star);
    });
  });

  // 행 클릭 이벤트 (차트 모달)
  document.querySelectorAll("#stockTableBody tr").forEach((row) => {
    // 별 아이콘 제외한 나머지 셀들
    row.querySelectorAll(".stock-name, .stock-data").forEach((cell) => {
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
      // 관심종목 삭제
      await axios.delete(`/api/favorites?symbol=${code}&type=STOCK`);
      userFavorites.delete(code);
      starElement.textContent = "☆";
      showToast(`${name}이(가) 관심종목에서 제거되었습니다.`, "success");
    } else {
      // 관심종목 추가
      await axios.post("/api/favorites", {
        symbol: code,
        name: name,
        type: "STOCK"
      });
      userFavorites.add(code);
      starElement.textContent = "⭐";
      showToast(`${name}이(가) 관심종목에 추가되었습니다.`, "success");
    }
  } catch (err) {
    if (err.response && err.response.status === 401) {
      showToast("로그인이 필요합니다.", "warning");
      setTimeout(() => {
        window.location.href = "/login";
      }, 1500);
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
  // 기존 토스트 제거
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

// 토스트 애니메이션 CSS 추가
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
`;
document.head.appendChild(style);

// ===============================
// 6. 정렬
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
// 7. 검색 & 새로고침
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
// 8. 차트 모달
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