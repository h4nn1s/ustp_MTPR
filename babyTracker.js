// Konstanten für die Grenzwerte
const THRESHOLDS = {
    LOW_SOLIDS: 100,        // Gramm
    POOR_NAPS: 90,         // Minuten
    MANY_WAKINGS: 2,       // Anzahl
    MIN_HYDRATION: 1.0     // Verhältnis actual/target
};

// Hauptdaten-Array
let daysData = [];

// Event Listener initialisieren
document.addEventListener('DOMContentLoaded', () => {
    // File Input
    document.getElementById('csvFile').addEventListener('change', handleFileSelect);

    // Filter
    document.querySelectorAll('.filter-checkbox input').forEach(checkbox => {
        checkbox.addEventListener('change', updateDisplay);
    });

    // Formular
    document.getElementById('entryForm').addEventListener('submit', handleFormSubmit);

    // Download Button
    document.getElementById('downloadBtn').addEventListener('click', downloadCSV);

    // Aktuelles Datum als Standard setzen
    document.getElementById('entryDate').valueAsDate = new Date();
});

// Datei einlesen
function handleFileSelect(event) {
    const file = event.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = function(e) {
        parseCSVData(e.target.result);
    };
    reader.readAsText(file);
}

// CSV-Daten parsen
function parseCSVData(csvText) {
    const lines = csvText.split('\n');
    daysData = lines
        .filter(line => line.trim())
        .map(line => {
            const [date, breastfeeds, solids, water, targetWater, napsTotal, nightWakings] = line.split(',');
            return {
                date: date,
                breastfeeds: parseInt(breastfeeds),
                solids: parseInt(solids),
                water: parseInt(water),
                targetWater: parseInt(targetWater),
                napsTotal: parseInt(napsTotal),
                nightWakings: parseInt(nightWakings),
            };
        })
        .sort((a, b) => new Date(b.date) - new Date(a.date)); // Neueste zuerst

    updateDisplay();
    updateStats();
}

// Anzeige aktualisieren
function updateDisplay() {
    const cardsGrid = document.getElementById('cardsGrid');
    cardsGrid.innerHTML = '';

    const filteredData = filterData(daysData);
    
    filteredData.forEach(day => {
        cardsGrid.appendChild(createDayCard(day));
    });
}

// Daten filtern
function filterData(data) {
    return data.filter(day => {
        const showLowSolids = document.getElementById('filterLowSolids').checked;
        const showUnderHydration = document.getElementById('filterUnderHydration').checked;
        const showPoorNaps = document.getElementById('filterPoorNaps').checked;
        const showManyWakings = document.getElementById('filterManyWakings').checked;

        if (!showLowSolids && !showUnderHydration && !showPoorNaps && !showManyWakings) {
            return true;
        }

        const isLowSolids = day.solids < THRESHOLDS.LOW_SOLIDS;
        const isUnderHydration = (day.water / day.targetWater) < THRESHOLDS.MIN_HYDRATION;
        const isPoorNaps = day.napsTotal < THRESHOLDS.POOR_NAPS;
        const isManyWakings = day.nightWakings > THRESHOLDS.MANY_WAKINGS;

        return (showLowSolids && isLowSolids) ||
               (showUnderHydration && isUnderHydration) ||
               (showPoorNaps && isPoorNaps) ||
               (showManyWakings && isManyWakings);
    });
}

// Tages-Karte erstellen
function createDayCard(day) {
    const card = document.createElement('div');
    card.className = 'day-card';

    const hydrationPercent = (day.water / day.targetWater) * 100;
    const badges = generateBadges(day);

    card.innerHTML = `
        <h3>${formatDate(day.date)}</h3>
        
        <div class="metric">
            <span>Stillmahlzeiten:</span>
            <span>${day.breastfeeds}×</span>
        </div>
        
        <div class="metric">
            <span>Festnahrung:</span>
            <span>${day.solids}g</span>
        </div>
        
        <div class="metric">
            <span>Wasser:</span>
            <span>${day.water}ml / ${day.targetWater}ml</span>
        </div>
        
        <div class="hydration-bar">
            <div class="hydration-bar-fill" style="width: ${Math.min(100, hydrationPercent)}%"></div>
        </div>
        
        <div class="metric">
            <span>Schlafzeit:</span>
            <span>${formatMinutes(day.napsTotal)}</span>
        </div>
        
        <div class="metric">
            <span>Nachtaufwachen:</span>
            <span>${day.nightWakings}×</span>
        </div>
        
        <div class="badges">
            ${badges}
        </div>
    `;

    return card;
}

// Badges generieren
function generateBadges(day) {
    const badges = [];

    if (day.solids < THRESHOLDS.LOW_SOLIDS) {
        badges.push(createBadge('Wenig Festnahrung', 'warning'));
    }
    
    if ((day.water / day.targetWater) < THRESHOLDS.MIN_HYDRATION) {
        badges.push(createBadge('Unter Flüssigkeitsziel', 'warning'));
    }
    
    if (day.napsTotal < THRESHOLDS.POOR_NAPS) {
        badges.push(createBadge('Wenig Schlaf', 'warning'));
    }
    
    if (day.nightWakings > THRESHOLDS.MANY_WAKINGS) {
        badges.push(createBadge('Häufiges Aufwachen', 'warning'));
    }

    if (badges.length === 0) {
        badges.push(createBadge('Alles gut!', 'success'));
    }

    return badges.join('');
}

// Badge HTML erstellen
function createBadge(text, type) {
    return `<span class="badge badge-${type}">${text}</span>`;
}

// Statistiken aktualisieren
function updateStats() {
    if (daysData.length === 0) return;

    const avgHydration = average(daysData, day => (day.water / day.targetWater) * 100);
    const avgSolids = average(daysData, day => day.solids);
    const avgNaps = average(daysData, day => day.napsTotal);
    const avgWakings = average(daysData, day => day.nightWakings);

    document.getElementById('avgHydration').textContent = `${avgHydration.toFixed(1)}%`;
    document.getElementById('avgSolids').textContent = `${avgSolids.toFixed(0)}g`;
    document.getElementById('avgNaps').textContent = formatMinutes(avgNaps);
    document.getElementById('avgWakings').textContent = avgWakings.toFixed(1);
}

// Hilfsfunktionen
function average(array, selector) {
    return array.reduce((sum, item) => sum + selector(item), 0) / array.length;
}

function formatDate(dateString) {
    return new Date(dateString).toLocaleDateString('de-DE');
}

function formatMinutes(minutes) {
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return `${hours}h ${mins}min`;
}

// Formulareingabe verarbeiten
function handleFormSubmit(event) {
    event.preventDefault();

    const newEntry = {
        date: document.getElementById('entryDate').value,
        breastfeeds: parseInt(document.getElementById('entryBreastfeeds').value),
        solids: parseInt(document.getElementById('entrySolids').value),
        water: parseInt(document.getElementById('entryWater').value),
        targetWater: parseInt(document.getElementById('entryTargetWater').value),
        napsTotal: parseInt(document.getElementById('entryNaps').value),
        nightWakings: parseInt(document.getElementById('entryWakings').value)
    };

    // Daten zum Array hinzufügen
    daysData.push(newEntry);
    
    // Nach Datum sortieren
    daysData.sort((a, b) => new Date(b.date) - new Date(a.date));

    // Anzeige aktualisieren
    updateDisplay();
    updateStats();

    // Formular zurücksetzen
    event.target.reset();
    document.getElementById('entryDate').valueAsDate = new Date();
}

// CSV-Datei herunterladen
function downloadCSV() {
    if (daysData.length === 0) {
        alert('Keine Daten zum Herunterladen vorhanden');
        return;
    }

    // CSV-Header und Daten erstellen
    const header = 'date,breastfeeds,solids,water,targetWater,napsTotal,nightWakings\\n';
    const csvContent = daysData
        .sort((a, b) => new Date(a.date) - new Date(b.date)) // Chronologisch sortieren
        .map(day => 
            `${day.date},${day.breastfeeds},${day.solids},${day.water},${day.targetWater},${day.napsTotal},${day.nightWakings}`
        )
        .join('\\n');

    // Download initiieren
    const blob = new Blob([header + csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `baby_tracking_${new Date().toISOString().split('T')[0]}.csv`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
}