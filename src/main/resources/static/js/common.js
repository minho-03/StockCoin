let chartInstance = null;

// ✅ 테이블 렌더링 (주식/코인 공용)
function renderTable(data, tableId, modalHandler) {
  const tableBody = document.querySelector(`#${tableId} tbody`);
  tableBody.innerHTML = data.map(stock => {
    const rateValue = parseFloat(stock.changeRate.replace(/[^0-9.-]/g, ""));
    const isUp = rateValue > 0;
    const isDown = rateValue < 0;
    const rateColor = isUp ? "text-danger fw-bold" : isDown ? "text-primary fw-bold" : "text-secondary";
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
  }).join("");

  document.querySelectorAll(`#${tableId} tbody tr`).forEach(row => {
    row.addEventListener("click", () => modalHandler(row.dataset.name, row.dataset.code));
  });
}

// ✅ 차트 모달
async function showChartModal(name, code, endpoint, color) {
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
    <canvas id="chartCanvas" style="height:400px;"></canvas>
  `;

  const ctx = document.getElementById("chartCanvas").getContext("2d");

  async function loadChart(period = "1m") {
    try {
      const res = await axios.get(`${endpoint}/${code}?period=${period}`);
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
              borderColor: color,
              backgroundColor: `${color}30`,
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
    } catch {
      chartContainer.innerHTML = `<p class="text-danger text-center">데이터를 불러올 수 없습니다.</p>`;
    }
  }

  chartContainer.addEventListener("click", e => {
    if (e.target.classList.contains("period-btn")) {
      document.querySelectorAll(".period-btn").forEach(btn => btn.classList.remove("active"));
      e.target.classList.add("active");
      loadChart(e.target.dataset.period);
    }
  });

  await loadChart("1m");
  modal.show();
}
