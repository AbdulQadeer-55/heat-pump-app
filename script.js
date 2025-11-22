const sizeLookup = [
    { limit: 15000, size: "4KW" },
    { limit: 23000, size: "6KW" },
    { limit: 28000, size: "8KW" },
    { limit: 33000, size: "10KW" },
    { limit: 37000, size: "13KW" },
    { limit: 46000, size: "16KW" },
    { limit: 50000, size: "19KW" },
    { limit: 999999, size: "19KW" }
];

let myChart = null;

document.getElementById('calc-form').addEventListener('submit', function(e) {
    e.preventDefault();

    const systemPrice = parseFloat(document.getElementById('systemPrice').value);
    const units = parseInt(document.getElementById('housingUnits').value);
    const subsidyFactor = parseFloat(document.getElementById('existingSystem').value);
    
    const multiplier = parseFloat(document.getElementById('heatingType').value);
    const consumption = parseFloat(document.getElementById('consumption').value);
    
    const waterStorageElement = document.getElementById('householdSize');
    const waterStorageText = waterStorageElement.options[waterStorageElement.selectedIndex].text;
    const waterStorageValue = waterStorageElement.value; 

    const annualKwh = Math.round(consumption * multiplier);

    let recommendedSize = "N/A";
    for (let i = 0; i < sizeLookup.length; i++) {
        if (annualKwh <= sizeLookup[i].limit) {
            recommendedSize = sizeLookup[i].size;
            break;
        }
    }

    const baseCap = 30000;
    const extraCap = (units - 1) * 15000;
    const totalCap = baseCap + extraCap;

    const eligibleCost = Math.min(systemPrice, totalCap);

    const finalSubsidy = eligibleCost * subsidyFactor;

    const currencyFormatter = new Intl.NumberFormat('de-DE', { 
        style: 'currency', 
        currency: 'EUR' 
    });

    document.getElementById('res-subsidy').innerText = currencyFormatter.format(finalSubsidy);
    document.getElementById('res-kw').innerText = recommendedSize;
    document.getElementById('res-water').innerText = waterStorageValue;

    document.getElementById('res-details').innerText = 
        `Limit: ${currencyFormatter.format(totalCap)} | Anrechenbar: ${currencyFormatter.format(eligibleCost)} * ${(subsidyFactor * 100).toFixed(0)}%`;

    document.getElementById('results-container').style.display = 'block';

    updateChart(finalSubsidy, totalCap, eligibleCost);
});

function updateChart(subsidy, cap, eligible) {
    const ctx = document.getElementById('subsidyChart').getContext('2d');
    
    if (myChart) {
        myChart.destroy();
    }

    myChart = new Chart(ctx, {
        type: 'bar',
        data: {
            labels: ['Ihre Förderung', 'Max. Limit (Cap)'],
            datasets: [{
                label: 'Betrag in €',
                data: [subsidy, cap],
                backgroundColor: [
                    '#007f5f',
                    '#e0e0e0'
                ],
                borderRadius: 4,
                barPercentage: 0.6
            }]
        },
        options: {
            indexAxis: 'y',
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: { display: false },
                tooltip: {
                    callbacks: {
                        label: function(context) {
                            return new Intl.NumberFormat('de-DE', { style: 'currency', currency: 'EUR' }).format(context.raw);
                        }
                    }
                }
            },
            scales: {
                x: { 
                    beginAtZero: true,
                    grid: { display: false }
                },
                y: {
                    grid: { display: false }
                }
            }
        }
    });
}