let diary = "";

const fileInput = document.getElementById('csvFile');
fileInput.addEventListener('change', function(event) {
	const file = event.target.files[0];
	if (!file) return;
	const reader = new FileReader();
	reader.onload = function(e) {
		diary = e.target.result;
		// You can call your processing function here, e.g. processDiary();
		console.log('Diary loaded:', diary);
		generateTable(diary);
	};
	reader.readAsText(file);
});

const submitButton = document.getElementById('submit');
submitButton.addEventListener('click', function(event) {
	event.preventDefault(); // Prevent form submission
	const date = document.getElementById('dateInput').value;
	const number = document.getElementById('numberInput').value;
	if (date && number) {
		const newLine = `\n${date};${number}`;
		diary += newLine;
		generateTable(diary);
	}
});


function generateTable(csvString) {
	const existingTable = document.getElementById('diaryTable');
	if (existingTable) {
		existingTable.remove();
	}
	const lines = csvString.split('\n');
	const table = document.createElement('table');
	table.id = 'diaryTable';
	
	lines.forEach(line => {
		if (line.trim() === '') return; // Skip empty lines
		const cells = line.split(';');
		const row = document.createElement('tr');
		cells.forEach(cell => {
			const td = document.createElement('td');
			td.textContent = cell.trim();
			row.appendChild(td);
		});
		table.appendChild(row);
	});
	
	document.body.appendChild(table);
}

function downloadCSV() {
	const blob = new Blob([diary], { type: 'text/csv' });
	const url = URL.createObjectURL(blob);
	const a = document.createElement('a');
	a.href = url;
	a.download = 'diary.csv';
	document.body.appendChild(a);
	a.click();
	document.body.removeChild(a);
	URL.revokeObjectURL(url);
}

const downloadButton = document.getElementById('download');
downloadButton.addEventListener('click', downloadCSV);

// 
// 