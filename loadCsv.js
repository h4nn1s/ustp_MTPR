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
	};
	reader.readAsText(file);
});