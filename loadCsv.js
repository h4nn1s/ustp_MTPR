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

function generateTable(csvString) {
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

