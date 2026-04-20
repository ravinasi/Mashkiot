let growthChart = null;

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

function calculateGrowthByYear(initialAmount, monthlyAmount, annualReturn, years) {
  const yearlyData = [];
  const monthlyRate = annualReturn / 100 / 12;
  let currentAmount = initialAmount;

  for (let year = 1; year <= years; year++) {
    for (let month = 1; month <= 12; month++) {
      currentAmount = currentAmount * (1 + monthlyRate);
      currentAmount += monthlyAmount;
    }

    yearlyData.push({
      year: year,
      total: currentAmount
    });
  }

  return yearlyData;
}

function renderChart(yearlyData) {
  const ctx = document.getElementById("growthChart").getContext("2d");

  if (growthChart) {
    growthChart.destroy();
  }

  growthChart = new Chart(ctx, {
    type: "line",
    data: {
      labels: yearlyData.map(item => `שנה ${item.year}`),
      datasets: [
        {
          label: "שווי התיק",
          data: yearlyData.map(item => item.total),
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

attachCommaFormatting("initialAmount");
attachCommaFormatting("monthlyAmount");

document.getElementById("calculateBtn").addEventListener("click", function () {
  const initialAmount = parseFormattedNumber(document.getElementById("initialAmount").value);
  const monthlyAmount = parseFormattedNumber(document.getElementById("monthlyAmount").value);
  const annualReturn = parseFloat(document.getElementById("annualReturn").value) || 0;
  const years = parseInt(document.getElementById("years").value) || 0;

  if (years <= 0) {
    alert("יש להזין מספר שנות השקעה תקין");
    return;
  }

  const yearlyData = calculateGrowthByYear(initialAmount, monthlyAmount, annualReturn, years);
  const finalAmount = yearlyData[yearlyData.length - 1].total;
  const totalDeposits = initialAmount + (monthlyAmount * years * 12);
  const totalProfit = finalAmount - totalDeposits;

  document.getElementById("finalAmount").textContent = formatCurrency(finalAmount);
  document.getElementById("totalDeposits").textContent = formatCurrency(totalDeposits);
  document.getElementById("totalProfit").textContent = formatCurrency(totalProfit);

  document.getElementById("compoundResultSection").style.display = "block";
  document.getElementById("compoundChartSection").style.display = "block";

  renderChart(yearlyData);
});