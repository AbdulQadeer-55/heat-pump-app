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
    
    const userFullFactor = parseFloat(document.getElementById('existingSystem').value);
    
    const multiplier = parseFloat(document.getElementById('heatingType').value);
    const consumption = parseFloat(document.getElementById('consumption').value);
    
    const waterStorageElement = document.getElementById('householdSize');
    const waterStorageValue = waterStorageElement.value; 

    const annualKwh = Math.round(consumption * multiplier);

    let recommendedSize = "N/A";
    for (let i = 0; i < sizeLookup.length; i++) {
        if (annualKwh <= sizeLookup[i].limit) {
            recommendedSize = sizeLookup[i].size;
            break;
        }
    }

    const pricePerUnit = systemPrice / units;

    const eligibleCostUnit1 = Math.min(pricePerUnit, 30000);
    const subsidyUnit1 = eligibleCostUnit1 * userFullFactor;

    let subsidyExtraUnits = 0;
    let eligibleCostExtra = 0;

    if (units > 1) {
        const extraUnitsCount = units - 1;
        
        const eligiblePerExtraUnit = Math.min(pricePerUnit, 15000);
        
        eligibleCostExtra = eligiblePerExtraUnit * extraUnitsCount;
        
        subsidyExtraUnits = eligibleCostExtra * 0.35;
    }

    const finalSubsidy = subsidyUnit1 + subsidyExtraUnits;

    const currencyFormatter = new Intl.NumberFormat('de-DE', { 
        style: 'currency', 
        currency: 'EUR' 
    });

    document.getElementById('res-subsidy').innerText = currencyFormatter.format(finalSubsidy);
    document.getElementById('res-kw').innerText = recommendedSize;
    document.getElementById('res-water').innerText = waterStorageValue;

    let detailsText = `Einheit 1: ${currencyFormatter.format(eligibleCostUnit1)} (${(userFullFactor * 100).toFixed(0)}%)`;
    
    if (units > 1) {
        detailsText += ` | Extras: ${currencyFormatter.format(eligibleCostExtra)} (35%)`;
    }
    
    document.getElementById('res-details').innerText = detailsText;

    const resultsContainer = document.getElementById('results-container');
    resultsContainer.classList.add('active');

    updateChart(subsidyUnit1, subsidyExtraUnits);
});

function updateChart(val1, val2) {
    const ctx = document.getElementById('subsidyChart').getContext('2d');
    
    if (myChart) {
        myChart.destroy();
    }

    const labels = val2 > 0 ? ['Haupt-Einheit (1)', 'Zusatz-Einheiten'] : ['Haupt-Einheit (1)'];
    const dataPoints = val2 > 0 ? [val1, val2] : [val1];

    myChart = new Chart(ctx, {
        type: 'bar', 
        data: {
            labels: labels,
            datasets: [{
                label: 'Förderbetrag',
                data: dataPoints,
                backgroundColor: [
                    '#4f46e5',
                    '#06b6d4'
                ],
                borderRadius: 6,
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
                    grid: { display: false },
                    ticks: { display: false }
                },
                y: {
                    grid: { display: false }
                }
            }
        }
    });
}