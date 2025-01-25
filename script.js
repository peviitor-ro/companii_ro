// script.js

async function searchFirma() {
    const id = document.getElementById('searchId').value;
    try {
        const response = await fetch(`https://api.peviitor.ro/v6/firme/search/?id=${id}`, {
            method: 'GET',
            mode: 'cors'
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
        alert(`Search failed: ${error.message}`);
    }
}

function displayFirmDetails(firm) {
    const details = document.getElementById('firmDetails');
    details.innerHTML = '';
    details.style.display = 'block';

    // Dinamic generate HTML based on available firm data and style it
    Object.keys(firm).forEach(key => {
        const value = Array.isArray(firm[key]) ? firm[key].join(', ') : firm[key];
        const element = document.createElement('p');
        element.style.color = "#333333"; // Set text color
        element.style.background = "#f8f8f8"; // Set background color
        element.style.padding = "10px"; // Set padding
        element.style.margin = "5px 0"; // Set margin
        element.style.borderRadius = "5px"; // Set border radius
        element.innerHTML = `<strong>${key.toUpperCase()}:</strong> ${value}`;
        details.appendChild(element);
    });
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
            body: JSON.stringify(bodyData),
            mode: 'cors'
        });

        if (!response.ok) {
            throw new Error(`Failed to add the website, server responded with: ${response.status}`);
        }

        await response.json(); // Assuming the response may not be significant for re-display
        alert('Website added successfully!');
        document.getElementById('websiteUrl').value = ''; // Clears the input field after successful submission
        
        searchFirma(); // Re-fetch and display all company data including the new website
    } catch (error) {
        console.error('Failed to add website:', error);
        alert(`Failed to add website: ${error.message}`);
    }
}
