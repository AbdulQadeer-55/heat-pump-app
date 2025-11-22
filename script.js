// --- 1. CONFIGURATION DATA ---

// Heat Pump Size Lookup Table (Based on annual kWh)
// Logic: If usage is below 'limit', use 'size'.
const sizeLookup = [
    { limit: 15000, size: "4KW" },
    { limit: 23000, size: "6KW" },
    { limit: 28000, size: "8KW" },
    { limit: 33000, size: "10KW" },
    { limit: 37000, size: "13KW" },
    { limit: 46000, size: "16KW" },
    { limit: 50000, size: "19KW" },
    { limit: 999999, size: "19KW" } // Fallback for very high usage
];

// Variable to store the chart instance so we can update it
let myChart = null;

// --- 2. MAIN EVENT LISTENER ---
// This runs when the user clicks "Berechnen"
document.getElementById('calc-form').addEventListener('submit', function(e) {
    e.preventDefault(); // Stop the form from reloading the page

    // --- A. GET INPUT VALUES ---
    const systemPrice = parseFloat(document.getElementById('systemPrice').value);
    const units = parseInt(document.getElementById('housingUnits').value);
    const subsidyFactor = parseFloat(document.getElementById('existingSystem').value);
    
    const multiplier = parseFloat(document.getElementById('heatingType').value);
    const consumption = parseFloat(document.getElementById('consumption').value);
    
    // Get text value for water tank (e.g. "200l")
    const waterStorageElement = document.getElementById('householdSize');
    // We want the text inside the option (e.g. "4 Personen (300l)"), or just the value if simplified
    const waterStorageText = waterStorageElement.options[waterStorageElement.selectedIndex].text;
    // Extract just the liters (e.g. "300l") from the text or value
    const waterStorageValue = waterStorageElement.value; 

    // --- B. PERFORM CALCULATIONS ---

    // 1. Calculate Annual kWh
    // Formula: Consumption * Multiplier (e.g. Holz * 1800)
    const annualKwh = Math.round(consumption * multiplier);

    // 2. Determine Heat Pump Size
    let recommendedSize = "N/A";
    // Loop through the table to find the matching range
    for (let i = 0; i < sizeLookup.length; i++) {
        if (annualKwh <= sizeLookup[i].limit) {
            recommendedSize = sizeLookup[i].size;
            break;
        }
    }

    // 3. Calculate Subsidy (The Complex Formula)
    // Step 1: Calculate the Cost Cap based on Housing Units
    // Formula: 30,000 for first unit + 15,000 for each additional unit
    const baseCap = 30000;
    const extraCap = (units - 1) * 15000;
    const totalCap = baseCap + extraCap;

    // Step 2: Determine "Eligible Cost"
    // Rule: It is the LOWER of the Actual System Price OR the Total Cap
    const eligibleCost = Math.min(systemPrice, totalCap);

    // Step 3: Final Subsidy Calculation
    // Formula: Eligible Cost * Subsidy Factor (e.g. 0.55)
    const finalSubsidy = eligibleCost * subsidyFactor;

    // --- C. UPDATE THE UI ---
    
    // Formatter for Currency (e.g. "€12.500,00")
    const currencyFormatter = new Intl.NumberFormat('de-DE', { 
        style: 'currency', 
        currency: 'EUR' 
    });

    // Update Text Elements
    document.getElementById('res-subsidy').innerText = currencyFormatter.format(finalSubsidy);
    document.getElementById('res-kw').innerText = recommendedSize;
    document.getElementById('res-water').innerText = waterStorageValue;

    // Update Details Text (Footer)
    // Shows the math: "Cap: €45.000 | Eligible: €40.000 * 55%"
    document.getElementById('res-details').innerText = 
        `Limit: ${currencyFormatter.format(totalCap)} | Anrechenbar: ${currencyFormatter.format(eligibleCost)} * ${(subsidyFactor * 100).toFixed(0)}%`;

    // Show the results container (with animation)
    document.getElementById('results-container').style.display = 'block';

    // --- D. RENDER CHART ---
    updateChart(finalSubsidy, totalCap, eligibleCost);
});

// --- 3. CHART FUNCTION ---
function updateChart(subsidy, cap, eligible) {
    const ctx = document.getElementById('subsidyChart').getContext('2d');
    
    // If a chart already exists, destroy it before making a new one
    if (myChart) {
        myChart.destroy();
    }

    myChart = new Chart(ctx, {
        type: 'bar', // Horizontal Bar Chart
        data: {
            labels: ['Ihre Förderung', 'Max. Limit (Cap)'],
            datasets: [{
                label: 'Betrag in €',
                data: [subsidy, cap],
                backgroundColor: [
                    '#007f5f', // Primary Green for Subsidy
                    '#e0e0e0'  // Grey for Cap
                ],
                borderRadius: 4,
                barPercentage: 0.6
            }]
        },
        options: {
            indexAxis: 'y', // Makes it horizontal
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