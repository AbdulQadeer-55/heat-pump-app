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

    // 1. INPUTS
    const systemPrice = parseFloat(document.getElementById('systemPrice').value);
    const units = parseInt(document.getElementById('housingUnits').value);
    const userFullFactor = parseFloat(document.getElementById('existingSystem').value); // This is the 55% etc.
    const multiplier = parseFloat(document.getElementById('heatingType').value);
    const consumption = parseFloat(document.getElementById('consumption').value);
    
    const waterStorageElement = document.getElementById('householdSize');
    const waterStorageValue = waterStorageElement.value; 

    // 2. HEAT PUMP SIZE CALCULATION (Unchanged)
    const annualKwh = Math.round(consumption * multiplier);
    let recommendedSize = "N/A";
    for (let i = 0; i < sizeLookup.length; i++) {
        if (annualKwh <= sizeLookup[i].limit) {
            recommendedSize = sizeLookup[i].size;
            break;
        }
    }

    // ---------------------------------------------------------
    // 3. THE FIXED SUBSIDY LOGIC (Matches Excel Exactly)
    // ---------------------------------------------------------

    // Step A: Calculate the Total Cap (Limit) based on the lookup table
    // Rule: Units 1-6 add 15,000 each. Units 7+ add 8,000 each.
    let totalCap = 0;
    
    if (units <= 6) {
        // Base 30,000 for first unit + 15,000 for each additional
        totalCap = 30000 + ((units - 1) * 15000);
    } else {
        // Base 105,000 (for first 6 units) + 8,000 for each unit above 6
        totalCap = 105000 + ((units - 6) * 8000);
    }

    // Step B: Determine the "Base Value Per Unit"
    // Compare System Price vs Total Cap. Take the smaller one.
    const eligibleTotal = Math.min(systemPrice, totalCap);
    
    // Divide the eligible total by the number of units to get the base value
    const baseValuePerUnit = eligibleTotal / units;

    // Step C: Calculate the Main Unit Subsidy (Unit 1)
    // Unit 1 gets the user selected percentage (e.g. 55%)
    const subsidyUnit1 = baseValuePerUnit * userFullFactor;

    // Step D: Calculate Extra Units Subsidy (Units 2+)
    // Extra units ALWAYS get 35% (0.35) regardless of the main factor
    let subsidyExtraUnits = 0;
    if (units > 1) {
        const extraUnitsCount = units - 1;
        subsidyExtraUnits = baseValuePerUnit * extraUnitsCount * 0.35;
    }

    const finalSubsidy = subsidyUnit1 + subsidyExtraUnits;

    // ---------------------------------------------------------
    // 4. DISPLAY RESULTS
    // ---------------------------------------------------------

    const currencyFormatter = new Intl.NumberFormat('de-DE', { 
        style: 'currency', 
        currency: 'EUR' 
    });

    document.getElementById('res-subsidy').innerText = currencyFormatter.format(finalSubsidy);
    document.getElementById('res-kw').innerText = recommendedSize;
    document.getElementById('res-water').innerText = waterStorageValue;

    // Detail text
    let detailsText = `Basiswert pro Einheit: ${currencyFormatter.format(baseValuePerUnit)}`;
    detailsText += `\nEinheit 1: ${(userFullFactor * 100).toFixed(0)}%`;
    
    if (units > 1) {
        detailsText += ` | Weitere Einheiten: 35%`;
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