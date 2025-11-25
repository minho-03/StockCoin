let chartInstance = null;

// ✅ 테이블 렌더링 (주식/코인 공용)
function renderTable(data, tableId, modalHandler) {
  // tbody를 정확하게 찾아서 업데이트되도록 수정
  const tableBody =
    document.querySelector(`#${tableId} tbody`) ||
    document.getElementById(`${tableId}Body`);

  if (!tableBody) {
    console.error("❌ tbody를 찾을 수 없습니다:", tableId);
    return;
  }

  tableBody.innerHTML = data
    .map((stock) => {
      const rateValue = parseFloat(stock.changeRate.replace(/[^0-9.-]/g, ""));
      const isUp = rateValue > 0;
      const isDown = rateValue < 0;

      const rateColor = isUp
        ? "text-danger fw-bold"
        : isDown
        ? "text-primary fw-bold"
        : "text-secondary";

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

  // 클릭 이벤트 연결
  document.querySelectorAll(`#${tableId} tbody tr, #${tableId}Body tr`).forEach((row) => {
    row.addEventListener("click", () =>
      modalHandler(row.dataset.name, row.dataset.code)
    );
  });

}
