// ===============================
// 전역 변수
// ===============================
let stockFavorites = [];
let coinFavorites = [];
let stockSort = { key: null, order: 'none' };
let coinSort = { key: null, order: 'none' };

// ===============================
// 1. 페이지 로드 시 관심종목 불러오기
// ===============================
async function loadFavorites() {
  try {
    // 주식 관심종목 (국내만)
    const stockRes = await axios.get('/api/favorites/type/STOCK');
    stockFavorites = stockRes.data;

    // 코인 관심종목
    const coinRes = await axios.get('/api/favorites/type/COIN');
    coinFavorites = coinRes.data;

    // 실시간 시세 가져오기
    await fetchRealTimePrices();

    // 렌더링
    renderStockTable();
    renderCoinTable();

  } catch (err) {
    if (err.response && err.response.status === 401) {
      showLoginAlert();
    } else {
      console.error('관심종목 로드 실패:', err);
      showToast('관심종목을 불러올 수 없습니다.', 'danger');
    }
  }
}

// ===============================
// 2. 실시간 시세 가져오기
// ===============================
async function fetchRealTimePrices() {
  try {
    // 주식 시세 가져오기 (국내만)
    if (stockFavorites.length > 0) {
      const stockRes = await axios.get('/api/korea/list');
      const stockPrices = stockRes.data;

      stockFavorites = stockFavorites.map(fav => {
        const priceData = stockPrices.find(s => s.code === fav.symbol);
        if (priceData) {
          return {
            ...fav,
            currentPrice: priceData.price,
            changeRate: priceData.changeRate
          };
        }
        return fav;
      });
    }

    // 코인 시세 가져오기
    if (coinFavorites.length > 0) {
      const coinRes = await axios.get('/api/coin/list');
      const coinPrices = coinRes.data;

      coinFavorites = coinFavorites.map(fav => {
        const priceData = coinPrices.find(c => c.code === fav.symbol);
        if (priceData) {
          return {
            ...fav,
            currentPrice: priceData.price,
            changeRate: priceData.changeRate
          };
        }
        return fav;
      });
    }
  } catch (err) {
    console.error('시세 가져오기 실패:', err);
  }
}

// ===============================
// 3. 주식 테이블 렌더링 (수정!)
// ===============================
function renderStockTable(filtered = null) {
  const tbody = document.querySelector('#stockTable tbody');
  const emptyHint = document.getElementById('stockEmpty');
  const data = filtered || stockFavorites;

  if (data.length === 0) {
    tbody.innerHTML = '';
    emptyHint.classList.remove('d-none');
    return;
  }

  emptyHint.classList.add('d-none');

  tbody.innerHTML = data.map(stock => {
    const rate = stock.changeRate || '-';
    const rateValue = parseFloat(rate.replace(/[^0-9.-]/g, ''));
    const rateClass = rateValue > 0 ? 'text-up' : rateValue < 0 ? 'text-down' : 'text-same';
    const rateIcon = rateValue > 0 ? '▲ ' : rateValue < 0 ? '▼ ' : '';

    return `
      <tr class="chart-row"
          data-symbol="${stock.symbol}"
          data-name="${stock.name}"
          data-type="STOCK">
        <td style="text-align: left; padding-left: 16px;">${stock.name}</td>
        <td style="text-align: right; padding-right: 16px;">${stock.currentPrice || '-'}</td>
        <td style="text-align: right; padding-right: 16px;">
          <span class="${rateClass}">${rateIcon}${rate}</span>
        </td>
        <td style="text-align: center; padding: 0;">
          <button class="remove-btn"
                  data-id="${stock.id}"
                  data-symbol="${stock.symbol}"
                  data-name="${stock.name}"
                  data-type="STOCK"
                  onclick="event.stopPropagation();">
            ⭐
          </button>
        </td>
      </tr>
    `;
  }).join('');

  // 삭제 버튼 이벤트
  document.querySelectorAll('#stockTable .remove-btn').forEach(btn => {
    btn.addEventListener('click', () => removeFavorite(
      btn.dataset.id,
      btn.dataset.symbol,
      btn.dataset.name,
      btn.dataset.type
    ));
  });

  // 차트 열기 이벤트 (행 클릭)
  document.querySelectorAll('#stockTable .chart-row').forEach(row => {
    row.addEventListener('click', () => {
      openChartModal(row.dataset.symbol, row.dataset.name, row.dataset.type);
    });
  });
}

// ===============================
// 4. 코인 테이블 렌더링 (수정!)
// ===============================
function renderCoinTable(filtered = null) {
  const tbody = document.querySelector('#coinTable tbody');
  const emptyHint = document.getElementById('coinEmpty');
  const data = filtered || coinFavorites;

  if (data.length === 0) {
    tbody.innerHTML = '';
    emptyHint.classList.remove('d-none');
    return;
  }

  emptyHint.classList.add('d-none');

  tbody.innerHTML = data.map(coin => {
    const rate = coin.changeRate || '-';
    const rateValue = parseFloat(rate.replace(/[^0-9.-]/g, ''));
    const rateClass = rateValue > 0 ? 'text-up' : rateValue < 0 ? 'text-down' : 'text-same';
    const rateIcon = rateValue > 0 ? '▲ ' : rateValue < 0 ? '▼ ' : '';

    return `
      <tr class="chart-row"
          data-symbol="${coin.symbol}"
          data-name="${coin.name}"
          data-type="COIN">
        <td style="text-align: left; padding-left: 16px;">${coin.name}</td>
        <td style="text-align: right; padding-right: 16px;">${coin.currentPrice || '-'}</td>
        <td style="text-align: right; padding-right: 16px;">
          <span class="${rateClass}">${rateIcon}${rate}</span>
        </td>
        <td style="text-align: center; padding: 0;">
          <button class="remove-btn"
                  data-id="${coin.id}"
                  data-symbol="${coin.symbol}"
                  data-name="${coin.name}"
                  data-type="COIN"
                  onclick="event.stopPropagation();">
            ⭐
          </button>
        </td>
      </tr>
    `;
  }).join('');

  // 삭제 버튼 이벤트
  document.querySelectorAll('#coinTable .remove-btn').forEach(btn => {
    btn.addEventListener('click', () => removeFavorite(
      btn.dataset.id,
      btn.dataset.symbol,
      btn.dataset.name,
      btn.dataset.type
    ));
  });

  // 차트 열기 이벤트 (행 클릭)
  document.querySelectorAll('#coinTable .chart-row').forEach(row => {
    row.addEventListener('click', () => {
      openChartModal(row.dataset.symbol, row.dataset.name, row.dataset.type);
    });
  });
}

// ===============================
// 5. 관심종목 삭제
// ===============================
async function removeFavorite(id, symbol, name, type) {
  if (!confirm(`${name}을(를) 관심종목에서 삭제하시겠습니까?`)) return;

  try {
    await axios.delete(`/api/favorites/${id}`);

    // 로컬 배열에서도 제거
    if (type === 'STOCK') {
      stockFavorites = stockFavorites.filter(f => f.id !== parseInt(id));
      renderStockTable();
    } else {
      coinFavorites = coinFavorites.filter(f => f.id !== parseInt(id));
      renderCoinTable();
    }

    showToast(`${name}이(가) 관심종목에서 제거되었습니다.`, 'success');
  } catch (err) {
    console.error('삭제 실패:', err);
    showToast('삭제에 실패했습니다.', 'danger');
  }
}

// ===============================
// 5-1. 차트 모달 열기 (시세보기와 동일한 기능)
// ===============================
let currentChart = null;

async function openChartModal(symbol, name, type) {
  const modalEl = document.getElementById('chartModal');
  const modal = new bootstrap.Modal(modalEl);
  const modalTitle = document.getElementById('modalTitle');

  // 타입별 아이콘
  const icon = type === 'STOCK' ? '📈' : '₿';
  modalTitle.textContent = `${icon} ${name} (${symbol}) 차트`;

  const chartContainer = document.getElementById('chartContainer');

  if (type === 'STOCK') {
    // 주식 차트 (1개월/3개월/6개월)
    chartContainer.innerHTML = `
      <div class="d-flex justify-content-center mb-3 gap-2">
        <button class="btn btn-sm btn-outline-dark period-btn active" data-period="1m">1개월</button>
        <button class="btn btn-sm btn-outline-dark period-btn" data-period="3m">3개월</button>
        <button class="btn btn-sm btn-outline-dark period-btn" data-period="6m">6개월</button>
      </div>
      <div id="chartWrap" style="height:420px;">
        <canvas id="priceChart"></canvas>
      </div>
    `;

    const ctx = document.getElementById('priceChart').getContext('2d');

    async function loadStockChart(period = '1m') {
      try {
        const res = await axios.get(`/api/korea/detail/${symbol}?period=${period}`);
        const data = res.data;

        if (currentChart) currentChart.destroy();

        currentChart = new Chart(ctx, {
          data: {
            labels: data.labels,
            datasets: [
              {
                type: 'line',
                label: `${name} 주가`,
                data: data.prices,
                borderColor: '#007bff',
                backgroundColor: 'rgba(0,123,255,0.15)',
                borderWidth: 2,
                tension: 0.3,
                yAxisID: 'yPrice'
              },
              {
                type: 'bar',
                label: '거래량',
                data: data.volumes,
                backgroundColor: 'rgba(180,180,180,0.5)',
                yAxisID: 'yVolume'
              }
            ]
          },
          options: {
            maintainAspectRatio: false,
            plugins: {
              legend: { display: false },
              title: {
                display: true,
                text: `${name} (${period}) 주가 & 거래량`,
                font: { size: 16, weight: 'bold' }
              }
            },
            scales: {
              yPrice: {
                position: 'left',
                ticks: {
                  callback: function(value) {
                    return value.toLocaleString() + '원';
                  }
                }
              },
              yVolume: {
                position: 'right',
                grid: { drawOnChartArea: false }
              }
            }
          }
        });
      } catch (err) {
        console.error('차트 로드 실패:', err);
        chartContainer.innerHTML = `<p class="text-danger text-center">데이터를 불러올 수 없습니다.</p>`;
      }
    }

    chartContainer.addEventListener('click', (e) => {
      if (e.target.classList.contains('period-btn')) {
        document.querySelectorAll('.period-btn').forEach((btn) =>
          btn.classList.remove('active')
        );
        e.target.classList.add('active');
        loadStockChart(e.target.dataset.period);
      }
    });

    await loadStockChart('1m');

  } else {
    // 코인 차트 (1주/1달/3달)
    chartContainer.innerHTML = `
      <div class="d-flex justify-content-center mb-3 gap-2">
        <button class="btn btn-sm btn-outline-dark period-btn active" data-unit="days" data-count="7">1주</button>
        <button class="btn btn-sm btn-outline-dark period-btn" data-unit="days" data-count="30">1달</button>
        <button class="btn btn-sm btn-outline-dark period-btn" data-unit="weeks" data-count="12">3달</button>
      </div>
      <div id="chartWrap" style="height:420px;">
        <canvas id="priceChart"></canvas>
      </div>
    `;

    const ctx = document.getElementById('priceChart').getContext('2d');

    async function loadCoinChart(unit = 'days', count = 30) {
      try {
        const res = await axios.get(`/api/coin/detail/${symbol}?unit=${unit}&count=${count}`);
        const data = res.data;

        if (currentChart) currentChart.destroy();

        currentChart = new Chart(ctx, {
          data: {
            labels: data.labels,
            datasets: [
              {
                type: 'line',
                label: `${name} 가격`,
                data: data.prices,
                borderColor: '#007bff',
                backgroundColor: 'rgba(0,123,255,0.15)',
                borderWidth: 2,
                tension: 0.3,
                yAxisID: 'yPrice'
              },
              {
                type: 'bar',
                label: '거래량',
                data: data.volumes,
                backgroundColor: 'rgba(180,180,180,0.5)',
                yAxisID: 'yVolume'
              }
            ]
          },
          options: {
            maintainAspectRatio: false,
            plugins: {
              legend: { display: false },
              title: {
                display: true,
                text: `${name} (${unit === 'days' ? count + '일' : count + '주'}) 가격 & 거래량`,
                font: { size: 16, weight: 'bold' }
              }
            },
            scales: {
              yPrice: {
                position: 'left',
                ticks: {
                  callback: function(value) {
                    return value.toLocaleString() + '원';
                  }
                }
              },
              yVolume: {
                position: 'right',
                grid: { drawOnChartArea: false }
              }
            }
          }
        });
      } catch (err) {
        console.error('차트 로드 실패:', err);
        chartContainer.innerHTML = `<p class="text-danger text-center">데이터를 불러올 수 없습니다.</p>`;
      }
    }

    chartContainer.addEventListener('click', (e) => {
      if (e.target.classList.contains('period-btn')) {
        document.querySelectorAll('.period-btn').forEach((btn) =>
          btn.classList.remove('active')
        );
        e.target.classList.add('active');
        loadCoinChart(e.target.dataset.unit, e.target.dataset.count);
      }
    });

    await loadCoinChart('days', 30);
  }

  modal.show();
}

// 모달 닫힐 때 차트 정리
document.getElementById('chartModal').addEventListener('hidden.bs.modal', () => {
  if (currentChart) {
    currentChart.destroy();
    currentChart = null;
  }
});

// ===============================
// 6. 주식 정렬
// ===============================
document.addEventListener('DOMContentLoaded', () => {
  document.querySelector('#stockTable thead').addEventListener('click', (e) => {
    const th = e.target.closest('th[data-key]');
    if (!th) return;

    const key = th.dataset.key;

    // 정렬 순서 결정
    if (stockSort.key === key) {
      stockSort.order = stockSort.order === 'asc' ? 'desc' : stockSort.order === 'desc' ? 'none' : 'asc';
    } else {
      stockSort = { key, order: 'asc' };
    }

    // 정렬 아이콘 업데이트
    document.querySelectorAll('#stockTable .sort-icon').forEach(icon => icon.textContent = '↕');
    if (stockSort.order !== 'none') {
      const iconId = `stockSort${key.charAt(0).toUpperCase() + key.slice(1)}`;
      document.getElementById(iconId).textContent = stockSort.order === 'asc' ? '↑' : '↓';
    }

    // 정렬 실행
    let sorted = [...stockFavorites];
    if (stockSort.order !== 'none') {
      sorted.sort((a, b) => {
        let valA, valB;

        if (key === 'name') {
          valA = a.name;
          valB = b.name;
          return stockSort.order === 'asc'
            ? valA.localeCompare(valB)
            : valB.localeCompare(valA);
        } else if (key === 'price') {
          valA = parseFloat((a.currentPrice || '0').replace(/[^0-9.-]/g, ''));
          valB = parseFloat((b.currentPrice || '0').replace(/[^0-9.-]/g, ''));
        } else if (key === 'chg') {
          valA = parseFloat((a.changeRate || '0').replace(/[^0-9.-]/g, ''));
          valB = parseFloat((b.changeRate || '0').replace(/[^0-9.-]/g, ''));
        }

        return stockSort.order === 'asc' ? valA - valB : valB - valA;
      });
    }

    renderStockTable(sorted);
  });

  // ===============================
  // 7. 코인 정렬
  // ===============================
  document.querySelector('#coinTable thead').addEventListener('click', (e) => {
    const th = e.target.closest('th[data-key]');
    if (!th) return;

    const key = th.dataset.key;

    // 정렬 순서 결정
    if (coinSort.key === key) {
      coinSort.order = coinSort.order === 'asc' ? 'desc' : coinSort.order === 'desc' ? 'none' : 'asc';
    } else {
      coinSort = { key, order: 'asc' };
    }

    // 정렬 아이콘 업데이트
    document.querySelectorAll('#coinTable .sort-icon').forEach(icon => icon.textContent = '↕');
    if (coinSort.order !== 'none') {
      const iconId = `coinSort${key.charAt(0).toUpperCase() + key.slice(1)}`;
      document.getElementById(iconId).textContent = coinSort.order === 'asc' ? '↑' : '↓';
    }

    // 정렬 실행
    let sorted = [...coinFavorites];
    if (coinSort.order !== 'none') {
      sorted.sort((a, b) => {
        let valA, valB;

        if (key === 'name') {
          valA = a.name;
          valB = b.name;
          return coinSort.order === 'asc'
            ? valA.localeCompare(valB)
            : valB.localeCompare(valA);
        } else if (key === 'price') {
          valA = parseFloat((a.currentPrice || '0').replace(/[^0-9.-]/g, ''));
          valB = parseFloat((b.currentPrice || '0').replace(/[^0-9.-]/g, ''));
        } else if (key === 'chg') {
          valA = parseFloat((a.changeRate || '0').replace(/[^0-9.-]/g, ''));
          valB = parseFloat((b.changeRate || '0').replace(/[^0-9.-]/g, ''));
        }

        return coinSort.order === 'asc' ? valA - valB : valB - valA;
      });
    }

    renderCoinTable(sorted);
  });

  // ===============================
  // 8. 주식 검색
  // ===============================
  document.getElementById('stockSearch').addEventListener('input', (e) => {
    const keyword = e.target.value.trim().toLowerCase();

    if (!keyword) {
      renderStockTable();
      return;
    }

    const filtered = stockFavorites.filter(s =>
      s.name.toLowerCase().includes(keyword) ||
      s.symbol.toLowerCase().includes(keyword)
    );

    renderStockTable(filtered);
  });

  document.getElementById('stockClear').addEventListener('click', () => {
    document.getElementById('stockSearch').value = '';
    renderStockTable();
  });

  // ===============================
  // 9. 코인 검색
  // ===============================
  document.getElementById('coinSearch').addEventListener('input', (e) => {
    const keyword = e.target.value.trim().toLowerCase();

    if (!keyword) {
      renderCoinTable();
      return;
    }

    const filtered = coinFavorites.filter(c =>
      c.name.toLowerCase().includes(keyword) ||
      c.symbol.toLowerCase().includes(keyword)
    );

    renderCoinTable(filtered);
  });

  document.getElementById('coinClear').addEventListener('click', () => {
    document.getElementById('coinSearch').value = '';
    renderCoinTable();
  });

  // Axios 설정
  axios.defaults.headers.common['Content-Type'] = 'application/json';

  // 관심종목 로드
  loadFavorites();

  // 30초마다 시세 업데이트
  setInterval(async () => {
    await fetchRealTimePrices();
    renderStockTable();
    renderCoinTable();
  }, 30000);
});

// ===============================
// 10. 토스트 알림
// ===============================
function showToast(message, type = 'info') {
  const existingToast = document.querySelector('.custom-toast');
  if (existingToast) existingToast.remove();

  const toast = document.createElement('div');
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
    toast.style.animation = 'slideOut 0.3s ease-out';
    setTimeout(() => toast.remove(), 300);
  }, 2000);
}

// 토스트 애니메이션
const style = document.createElement('style');
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
// 11. 로그인 필요 알림
// ===============================
function showLoginAlert() {
  const main = document.querySelector('main');
  main.innerHTML = `
    <div class="alert alert-warning text-center" role="alert">
      <h4 class="alert-heading">🔒 로그인이 필요합니다</h4>
      <p>관심종목 기능을 사용하려면 로그인해주세요.</p>
      <hr>
      <a href="/login" class="btn btn-dark">로그인 페이지로 이동</a>
    </div>
  `;
}