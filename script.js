// script.js

// Functie care cauta detalii despre firma pe baza ID-ului
async function searchFirma() {
    const id = document.getElementById('searchId').value;
    try {
        // Asigura-te ca adresa URL este corecta și adaugă modul cors
        const response = await fetch(`https://api.peviitor.ro/v6/firme/search/?id=${id}`, {
            method: 'GET',
            mode: 'cors' // Folosește CORS policy 
        });
        if (!response.ok) {
            throw new Error(`HTTP status: ${response.status}`);
        }
        const data = await response.json();
        if (data.length === 0) {
            throw new Error('No firm found with given ID');
        }
        displayFirmDetails(data[0]);
    } catch (error) {
        console.error('Search failed:', error);
        alert('Search failed: ' + error.message);
    }
}

// Functie pentru afisarea detaliilor firmei
function displayFirmDetails(firm) {
    const details = document.getElementById('firmDetails');
    details.style.display = 'block';
    details.textContent = `Denumire: ${firm.denumire[0]}, Adresa: ${firm.adresa_completa[0]}`;
}

// Functie care adauga un website la firma identificata prin ID
async function addWebsite() {
    const id = document.getElementById('searchId').value;
    const website = document.getElementById('websiteUrl').value;
    const bodyData = { id, website };

    try {
        const response = await fetch('https://api.peviitor.ro/v6/firme/website/add/', {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(bodyData),
            mode: 'cors' // Folosește CORS policy 
        });

        if (!response.ok) {
            throw new Error(`Failed to add website, server responded with status: ${response.status}`);
        }

        const jsonResponse = await response.json();
        alert('Website adăugat cu succes!');
        document.getElementById('websiteUrl').value = ''; // Clears the input field after successful submission
    } catch (error) {
        console.error('Failed to add website:', error);
        alert('Failed to add website: ' + error.message);
    }
}
