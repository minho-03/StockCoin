let allStocks = [];
let originalStocks = [];
let usaChartInstance = null;

// ===============================
// 리스트 로딩
// ===============================
async function loadUsaList() {
  const spinner = document.getElementById("loadingSpinner");
  const table = document.getElementById("overseasTable");
  const updateTime = document.getElementById("updateTime");

  spinner.style.display = "flex";
  table.style.display = "none";

  try {
    const res = await axios.get("/api/usa/list");
    allStocks = res.data;
    originalStocks = [...allStocks];

    renderUsaTable(allStocks);

    spinner.style.display = "none";
    table.style.display = "table";
    updateTime.textContent =
      "마지막 업데이트: " + new Date().toLocaleTimeString("ko-KR");

  } catch (e) {
    console.error("리스트 로드 실패:", e);
    spinner.innerHTML = `<p class="text-danger">데이터 로드 실패</p>`;
  }
}

// ===============================
// 테이블 렌더링
// ===============================
function renderUsaTable(data) {
  const body = document.getElementById("overseasTableBody");

  body.innerHTML = data
    .map(
      (s) => `
      <tr data-code="${s.code}" data-name="${s.name}">
        <td>⭐</td>
        <td>${s.name}</td>
        <td>${s.price}</td>
        <td>${s.changeRate}</td>
        <td>${s.volume}</td>
      </tr>`
    )
    .join("");

  document.querySelectorAll("#overseasTableBody tr").forEach((row) => {
    row.addEventListener("click", () => {
      showUsaModal(row.dataset.name, row.dataset.code);
    });
  });
}

// ===============================
// 모달 + 차트
// ===============================
async function showUsaModal(name, code) {
  console.log("모달 호출:", name, code);

  const modalObj = new bootstrap.Modal(document.getElementById("chartModal"));
  const chartBox = document.getElementById("chartContainer");

  chartBox.innerHTML = `<canvas id="usaChart" style="height:400px;"></canvas>`;
  const ctx = document.getElementById("usaChart").getContext("2d");

  let data = { labels: [], prices: [], volumes: [] };

  try {
    // 🔥 반드시 period 붙여야 detail API 정상 작동
    const res = await axios.get(`/api/usa/detail/${code}?period=1m`);
    data = res.data;

  } catch (e) {
    console.error("차트 API 에러:", e);
  }

  if (usaChartInstance) usaChartInstance.destroy();

  usaChartInstance = new Chart(ctx, {
    data: {
      labels: data.labels,
      datasets: [
        {
          type: "line",
          label: `${name} 종가`,
          data: data.prices,
          borderColor: "#007bff",
          backgroundColor: "rgba(0,123,255,0.1)",
          borderWidth: 2,
          yAxisID: "y1",
        },
        {
          type: "bar",
          label: "거래량",
          data: data.volumes,
          backgroundColor: "rgba(180,180,180,0.5)",
          yAxisID: "y2",
        },
      ],
    },
    options: {
      maintainAspectRatio: false,
      plugins: { legend: { display: false } },
      scales: {
        y1: { position: "left" },
        y2: { position: "right", grid: { drawOnChartArea: false } },
      },
    },
  });

  modalObj.show();
}

// ===============================
// 페이지 첫 로딩 시 실행
// ===============================
document.addEventListener("DOMContentLoaded", loadUsaList);

