// Main entry point for the application
window.onload = function() {
    // Getting references to DOM elements
    const generateButton = document.getElementById('generateButton');
    const statusLabel = document.getElementById('statusLabel');

    // Disable the button until a file is selected
    generateButton.disabled = true;

    // Event listeners
    generateButton.addEventListener('click', () => { runProcessor(); });

    // Run the processor when the button is clicked
    function runProcessor() {
        console.log('runProcessor called, selectedFile:', selectedFile);

        // Disable the button to prevent multiple clicks
        generateButton.disabled = true;

        // Remove hidden from status
        statusLabel.removeAttribute('hidden');

        // Set status to processing
        statusLabel.textContent = 'Processing...'

        // Hide status label error styles if any
        statusLabel.classList.remove('error', 'success');

        // Create file reader
        const reader = new FileReader();

        reader.onload = function(e) {
            try {
                const wb = parseRawFile(e.target.result);
                const rawData = extractData(wb);
                const monthYear = deriveMonthYear(rawData.bindleyList[0].timestamp);

                buildBindleyFile(rawData, monthYear);
                buildRich(rawData, monthYear);

                // Set status to success
                statusLabel.textContent = 'Done! Both files have been downloaded.';
                statusLabel.classList.add('success');
            } catch (err) {
                statusLabel.textContent = `Error: ${err.message}`;
                statusLabel.classList.add('error');
            } finally {
                generateButton.disabled = false;
            }

        };

        reader.readAsArrayBuffer(selectedFile);
    }

};