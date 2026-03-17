function displayFileName(file) {
    const statusLabel = document.getElementById('statusLabel');
    statusLabel.textContent = `Selected: ${file.name}`;
    statusLabel.removeAttribute('hidden');

    const generateButton = document.getElementById('generateButton');
    generateButton.removeAttribute('hidden');
    generateButton.disabled = false;
};

document.addEventListener('dragover', (e) => e.preventDefault());
document.addEventListener('drop', (e) => e.preventDefault());

const dropZone = document.getElementById('dropZone');

dropZone.addEventListener('dragover', (e) => {
    e.preventDefault();
    dropZone.classList.add('drag-active');
});

dropZone.addEventListener('dragleave', () => {
    dropZone.classList.remove('drag-active');
});

dropZone.addEventListener('drop', (e) => {
    e.preventDefault();
    dropZone.classList.remove('drag-active');
    const file = e.dataTransfer.files[0];
    handleFile(file);
    displayFileName(file);
});

document.getElementById('fileInput').addEventListener('change', function() {
    handleFile(this.files[0]);
    displayFileName(this.files[0]);
});