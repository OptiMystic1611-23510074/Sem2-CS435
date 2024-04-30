// Initialize variables
let recognition;
let isListening = false;
let downloadedPDFs = []; // Array to store the names of downloaded PDF files

// Function to start listening
function startListening() {
  recognition = new (window.webkitSpeechRecognition || window.SpeechRecognition)();
  recognition.interimResults = true;
  recognition.addEventListener('result', e => {
    const transcript = Array.from(e.results)
      .map(result => result[0])
      .map(result => result.transcript)
      .join('');
    document.getElementById('convert_text').value = transcript;
    sendTextToServer(transcript); // Send text to server for processing
  });
  recognition.addEventListener('end', () => {
    if (isListening) {
      startListening(); // Restart recognition if still listening
    } else {
      // Ask user to name the file and save it
      const fileName = prompt('Enter file name:', 'document');
      if (fileName !== null) {
        generateAndDownloadPDF(fileName); // Generate and download PDF with custom file name
      }
    }
  });
  recognition.start();
  isListening = true;
}

// Function to stop listening
function stopListening() {
  if (recognition) {
    recognition.stop();
    isListening = false;
  }
}

// Function to generate and download PDF
function generateAndDownloadPDF(fileName) {
  if (typeof jsPDF !== 'undefined') {
    const text = document.getElementById('nlp_results').innerText;
    const pdf = new jsPDF();
    pdf.text(text, 10, 10);
    pdf.save(fileName + '.pdf'); // Save PDF with custom file name
    downloadedPDFs.push(fileName); // Add the file name to the downloadedPDFs array
    // Clear text area and processed text
    document.getElementById('convert_text').value = '';
    document.getElementById('nlp_results').innerText = '';
  } else {
    console.error('jsPDF is not defined');
  }
}

// Function to search PDF files
function searchPDF(query) {
  const localPDFs = searchLocalPDFs(query); // Search local PDF files
  console.log('Local PDFs:', localPDFs);
  // Perform other search functionalities here
}

// Function to search local PDF files
async function searchLocalPDFs(query) {
  try {
    const fs = await window.chooseFileSystemEntries();
    const entries = await fs.getEntries();
    const pdfFiles = [];

    async function searchEntries(entry) {
      if (entry.isDirectory) {
        const dirEntries = await entry.getEntries();
        for (const dirEntry of dirEntries) {
          await searchEntries(dirEntry);
        }
      } else if (entry.name.toLowerCase().endsWith('.pdf')) {
        pdfFiles.push(entry.name);
      }
    }

    await Promise.all(entries.map(searchEntries));

    const matchingPDFs = pdfFiles.filter(pdf => pdf.toLowerCase().includes(query.toLowerCase()));
    return matchingPDFs;
  } catch (error) {
    console.error('Error searching local PDFs:', error);
    return [];
  }
}

// Function to display search results
function displaySearchResults(results) {
  // Display search results to the user (e.g., in a dropdown menu)
  console.log('Search results:', results);
}

// Event listener for the search form submission
document.querySelector('.navbar form').addEventListener('submit', function(event) {
  event.preventDefault(); // Prevent default form submission
  const searchQuery = document.querySelector('.navbar input[type="search"]').value;
  searchPDF(searchQuery); // Call search function with the query
});

// Event listeners for start and stop buttons
document.getElementById('start_button').addEventListener('click', function() {
  if (!isListening) {
    startListening();
  }
});

document.getElementById('stop_button').addEventListener('click', function() {
  stopListening();
});

// Function to send text to server for processing
function sendTextToServer(text) {
  // Example URL where the server is hosted
  const url = 'http://localhost:5000/process_text';

  // Data to be sent in the request body
  const data = { text: text };

  // Configuration for the fetch request
  const options = {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(data)
  };

  // Sending the fetch request
  fetch(url, options)
    .then(response => {
      if (!response.ok) {
        throw new Error('Network response was not ok');
      }
      return response.json();
    })
    .then(data => {
      // Handle processed data from server
      document.getElementById('nlp_results').innerText = JSON.stringify(data, null, 2);
    })
    .catch(error => {
      console.error('Error:', error);
    });
}
