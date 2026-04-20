let discountChart = null;

function formatNumberWithCommas(value) {
  if (!value) return "";
  const cleanValue = value.toString().replace(/[^\d]/g, "");
  return cleanValue.replace(/\B(?=(\d{3})+(?!\d))/g, ",");
}

function parseFormattedNumber(value) {
  return parseFloat((value || "").replace(/,/g, "")) || 0;
}

function formatCurrency(value) {
  return new Intl.NumberFormat("he-IL", {
    style: "currency",
    currency: "ILS",
    maximumFractionDigits: 0
  }).format(value);
}

function attachCommaFormatting(inputId) {
  const input = document.getElementById(inputId);

  input.addEventListener("input", () => {
    const cursorStart = input.selectionStart;
    const oldLength = input.value.length;

    input.value = formatNumberWithCommas(input.value);

    const newLength = input.value.length;
    const diff = newLength - oldLength;
    const newCursor = Math.max(0, (cursorStart || 0) + diff);

    input.setSelectionRange(newCursor, newCursor);
  });
}

function calculateDiscountTable(futureValue, years, discountRate) {
  const data = [];

  for (let year = 1; year <= years; year++) {
    const presentValue = futureValue / Math.pow(1 + (discountRate / 100), year);
    data.push({ year, presentValue });
  }

  return data;
}

function renderDiscountChart(discountData) {
  const ctx = document.getElementById("discountChart").getContext("2d");

  if (discountChart) {
    discountChart.destroy();
  }

  discountChart = new Chart(ctx, {
    type: "line",
    data: {
      labels: discountData.map(item => `שנה ${item.year}`),
      datasets: [
        {
          label: "ערך נוכחי",
          data: discountData.map(item => item.presentValue),
          borderColor: "#4f876d",
          backgroundColor: "rgba(79, 135, 109, 0.15)",
          borderWidth: 3,
          fill: true,
          tension: 0.25,
          pointRadius: 4,
          pointHoverRadius: 6
        }
      ]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: {
          labels: {
            font: {
              family: "Arial",
              size: 14
            }
          }
        },
        tooltip: {
          callbacks: {
            label: function(context) {
              return ` ${formatCurrency(context.raw)}`;
            }
          }
        }
      },
      scales: {
        x: {
          ticks: {
            font: {
              family: "Arial",
              size: 12
            }
          }
        },
        y: {
          beginAtZero: false,
          ticks: {
            callback: function(value) {
              return new Intl.NumberFormat("he-IL").format(value);
            },
            font: {
              family: "Arial",
              size: 12
            }
          }
        }
      }
    }
  });
}

function renderDiscountTable(discountData) {
  const tableBody = document.getElementById("discountTableBody");
  tableBody.innerHTML = "";

  discountData.forEach(item => {
    const row = document.createElement("tr");
    row.innerHTML = `
      <td>${item.year}</td>
      <td>${formatCurrency(item.presentValue)}</td>
    `;
    tableBody.appendChild(row);
  });
}

attachCommaFormatting("futureValue");

document.getElementById("discountBtn").addEventListener("click", function () {
  const futureValue = parseFormattedNumber(document.getElementById("futureValue").value);
  const years = parseInt(document.getElementById("discountYears").value) || 0;
  const discountRate = parseFloat(document.getElementById("discountRate").value) || 0;

  if (futureValue <= 0 || years <= 0) {
    alert("יש להזין סכום עתידי ומספר שנים תקינים");
    return;
  }

  const presentValue = futureValue / Math.pow(1 + (discountRate / 100), years);
  const discountData = calculateDiscountTable(futureValue, years, discountRate);

  document.getElementById("presentValue").textContent = formatCurrency(presentValue);

  document.getElementById("discountResultSection").style.display = "block";
  document.getElementById("discountChartSection").style.display = "block";
  document.getElementById("discountTableSection").style.display = "block";

  renderDiscountChart(discountData);
  renderDiscountTable(discountData);
});