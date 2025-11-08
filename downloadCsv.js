let diary = "";

// Hilfsfunktion zum Formatieren von Zahlen
function formatNumber(num) {
    return Number(num).toLocaleString('de-DE', {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2
    });
}

// Hilfsfunktion zum Formatieren des Datums
function formatDate(dateString) {
    const date = new Date(dateString);
    return date.toLocaleDateString('de-DE');
}

// Event Listener für File Input
const fileInput = document.getElementById('csvFile');
fileInput.addEventListener('change', function(event) {
    const file = event.target.files[0];
    if (!file) return;
    
    const reader = new FileReader();
    reader.onload = function(e) {
        try {
            diary = e.target.result;
            generateTable(diary);
        } catch (error) {
            alert('Fehler beim Lesen der CSV-Datei: ' + error.message);
        }
    };
    reader.onerror = function() {
        alert('Fehler beim Lesen der Datei');
    };
    reader.readAsText(file);
});

// Event Listener für das Formular
const submitButton = document.getElementById('submit');
submitButton.addEventListener('click', function(event) {
    event.preventDefault();
    const dateInput = document.getElementById('dateInput');
    const numberInput = document.getElementById('numberInput');
    
    if (!dateInput.value || !numberInput.value) {
        alert('Bitte füllen Sie alle Felder aus');
        return;
    }

    const date = dateInput.value;
    const number = parseFloat(numberInput.value);

    if (isNaN(number)) {
        alert('Bitte geben Sie eine gültige Zahl ein');
        return;
    }

    const newLine = diary ? `\n${date};${number}` : `${date};${number}`;
    diary += newLine;
    generateTable(diary);

    // Formular zurücksetzen
    dateInput.value = '';
    numberInput.value = '';
});

// Tabelle generieren
function generateTable(csvString) {
    const container = document.querySelector('.container');
    const existingTable = document.getElementById('diaryTable');
    if (existingTable) {
        existingTable.remove();
    }

    const lines = csvString.split('\n').filter(line => line.trim() !== '');
    if (lines.length === 0) return;

    const table = document.createElement('table');
    table.id = 'diaryTable';

    // Header erstellen
    const headerRow = document.createElement('tr');
    const dateHeader = document.createElement('th');
    dateHeader.textContent = 'Datum';
    const amountHeader = document.createElement('th');
    amountHeader.textContent = 'Betrag (€)';
    headerRow.appendChild(dateHeader);
    headerRow.appendChild(amountHeader);
    table.appendChild(headerRow);

    // Daten einfügen
    lines.forEach(line => {
        const [date, amount] = line.split(';');
        if (!date || !amount) return;

        const row = document.createElement('tr');
        
        const dateCell = document.createElement('td');
        dateCell.textContent = formatDate(date);
        
        const amountCell = document.createElement('td');
        amountCell.textContent = formatNumber(amount);
        amountCell.style.textAlign = 'right';

        row.appendChild(dateCell);
        row.appendChild(amountCell);
        table.appendChild(row);
    });

    container.appendChild(table);
}

// CSV Download Funktion
function downloadCSV() {
    if (!diary.trim()) {
        alert('Keine Daten zum Herunterladen vorhanden');
        return;
    }

    const blob = new Blob([diary], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `export_${new Date().toISOString().split('T')[0]}.csv`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
}

const downloadButton = document.getElementById('download');
downloadButton.addEventListener('click', downloadCSV);