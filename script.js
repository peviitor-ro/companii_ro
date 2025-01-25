// script.js
async function searchFirma() {
    const id = document.getElementById('searchId').value;
    try {
        const response = await fetch(`https://api.peviitor.ro/v6/firme/search/?id=${id}`);
        const data = await response.json();
        displayFirmDetails(data);
    } catch (error) {
        console.error('Search failed:', error);
    }
}

function displayFirmDetails(data) {
    const details = document.getElementById('firmDetails');
    details.style.display = 'block';
    details.textContent = `Denumire: ${data.denumire[0]}, Adresa: ${data.adresa_completa[0]}`;
}

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
            body: JSON.stringify(bodyData)
        });

        const jsonResponse = await response.json();
        alert('Website adăugat cu succes!');
        document.getElementById('websiteUrl').value = ''; // clear input
    } catch (error) {
        console.error('Failed to add website:', error);
    }
}
