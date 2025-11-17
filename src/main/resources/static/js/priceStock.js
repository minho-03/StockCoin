let allStocks = [];
let originalStocks = [];
let sortState = { column: null, order: "none" };

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
    renderTable(allStocks, "stockTable", (name, code) => showChartModal(name, code, "/api/korea/detail", "#007bff"));
    spinner.style.display = "none";
    table.style.display = "table";
    updateTime.textContent = "마지막 업데이트: " + new Date().toLocaleTimeString("ko-KR");
  } catch {
    spinner.innerHTML = `<p class="text-danger">데이터 불러오기 실패</p>`;
  }
}

// ✅ 정렬 (3단계)
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
  if (order === "none") sorted = [...originalStocks];
  else {
    sorted = [...allStocks];
    const key = { price: "price", rate: "changeRate", volume: "volume" }[column];
    sorted.sort((a, b) => {
      const valA = parseFloat(a[key].replace(/[^0-9.-]/g, ""));
      const valB = parseFloat(b[key].replace(/[^0-9.-]/g, ""));
      return order === "asc" ? valA - valB : valB - valA;
    });
  }

  renderTable(sorted, "stockTable", (n, c) => showChartModal(n, c, "/api/korea/detail", "#007bff"));
  document.querySelectorAll("th.sortable").forEach(th => th.classList.remove("sorted", "asc", "desc"));
  if (order !== "none") e.target.classList.add("sorted", order);
});

// ✅ 검색 / 새로고침
document.getElementById("searchBtn").addEventListener("click", () => {
  const keyword = document.getElementById("searchInput").value.trim();
  if (!keyword) return renderTable(allStocks, "stockTable", (n, c) => showChartModal(n, c, "/api/korea/detail", "#007bff"));
  const filtered = allStocks.filter(s => s.name.includes(keyword) || s.code.includes(keyword));
  renderTable(filtered, "stockTable", (n, c) => showChartModal(n, c, "/api/korea/detail", "#007bff"));
});

document.getElementById("refreshBtn").addEventListener("click", loadStockData);
document.addEventListener("DOMContentLoaded", loadStockData);
