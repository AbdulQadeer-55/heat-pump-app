# Wärmepumpen Förderrechner (Heat Pump Subsidy Calculator)

A modern, responsive web application for calculating heat pump installation subsidies in Germany.

## Features

- **Subsidy Calculation**: Automatically calculates maximum subsidy based on system price, housing units, and existing heating system type
- **Heat Pump Sizing**: Recommends appropriate heat pump size (4KW - 19KW) based on annual energy consumption
- **Water Tank Sizing**: Suggests water storage tank volume based on household size
- **Visual Results**: Interactive bar chart comparing subsidy amount to maximum cap limit
- **Responsive Design**: Mobile-first design optimized for all devices
- **Progressive Web App**: Works offline with service worker caching

## Tech Stack

- **Frontend**: HTML5, CSS3, JavaScript (ES6+)
- **Charts**: Chart.js for data visualization
- **Icons**: Remix Icon library
- **Fonts**: Inter & Poppins (Google Fonts)
- **PWA**: Service Worker for offline capability

## File Structure

```
heat-pump-app/
├── index.html          # Main HTML structure
├── style.css           # Modern CSS with CSS variables and gradients
├── script.js           # Core calculation logic and event handlers
├── sw.js              # Service Worker for offline caching
├── manifest.json      # PWA manifest (not included in files)
└── README.md          # This file
```

## How It Works

### Input Fields

1. **Gebäudedaten (Building Data)**
   - Anlagenpreis (System Price): Installation cost in euros
   - Wohneinheiten (Housing Units): Number of residential units

2. **Bestandsanlage (Existing System)**
   - Select current heating type (Oil, Gas, etc.)
   - Subsidy factor varies from 35% to 70% depending on system type and age

3. **Verbrauchsanalyse (Consumption Analysis)**
   - Heizungsart (Heating Type): Current fuel type with conversion multiplier
   - Verbrauch (Consumption): Annual usage amount
   - Personen im Haushalt (Household Size): Number of people for tank sizing

### Calculation Logic

1. **Annual kWh Calculation**
   ```
   Annual kWh = Consumption × Multiplier
   ```

2. **Cost Cap Calculation**
   ```
   Total Cap = 30,000€ + (Units - 1) × 15,000€
   ```

3. **Eligible Cost**
   ```
   Eligible Cost = MIN(System Price, Total Cap)
   ```

4. **Final Subsidy**
   ```
   Final Subsidy = Eligible Cost × Subsidy Factor
   ```

5. **Heat Pump Size** (Based on annual kWh):
   - ≤15,000 kWh → 4KW
   - ≤23,000 kWh → 6KW
   - ≤28,000 kWh → 8KW
   - ≤33,000 kWh → 10KW
   - ≤37,000 kWh → 13KW
   - ≤46,000 kWh → 16KW
   - ≤50,000 kWh → 19KW
   - >50,000 kWh → 19KW (max)

## Styling

The application uses a modern design system with:
- **Color Gradient**: Indigo (#4f46e5) to Cyan (#06b6d4)
- **Shadows**: Soft shadows for depth and visual hierarchy
- **Typography**: Inter for body text, Poppins for headings
- **Layout**: Centered card design with animated overlay for results

## Offline Functionality

The service worker caches all essential assets including:
- HTML, CSS, JavaScript files
- Chart.js library
- Icon fonts and web fonts
- External stylesheets

The app works completely offline after initial load.

## Browser Support

- Modern browsers with ES6 support
- Service Worker support (Chrome, Firefox, Edge, Safari 11.1+)
- CSS Grid and Flexbox support

## Usage

1. Fill in the building and heating system information
2. Enter annual consumption data
3. Click "Jetzt Berechnen" to calculate subsidy
4. View results with interactive chart
5. Click "Neue Berechnung" to reset and calculate again

## PWA Installation

The app can be installed as a Progressive Web App on:
- iOS: Add to Home Screen via Safari
- Android: "Install app" prompt in Chrome
- Desktop: Install button in URL bar (Chrome, Edge)

## Future Enhancements

- Regional subsidy variations
- Multiple system comparison
- PDF report export
- Dark mode theme
- Multilingual support
