async function searchFirma() {
    const id = document.getElementById('searchId').value.trim();
    try {
        const response = await fetch(`https://api.peviitor.ro/v6/firme/qsearch/?q=${encodeURIComponent(id)}`, {
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
        displayFirmDetails(data);
    } catch (error) {
        console.error('Search failed:', error);
        const errorMessage = document.getElementById('errorMessage');
        if (errorMessage) {
            errorMessage.textContent = `Search failed: ${error.message}`;
        } else {
            console.error('Error message container not found');
        }
    }
}

function displayFirmDetails(firms) {
    const container = document.getElementById('firmDetailsContainer');
    if (!container) {
        console.error('Firm details container not found');
        return;
    }
    container.innerHTML = '';

    firms.forEach((firm, index) => {
        const details = document.createElement('div');
        details.style.marginBottom = "20px";

        Object.keys(firm).forEach(key => {
            const value = Array.isArray(firm[key]) ? firm[key].join(', ') : firm[key];
            const element = document.createElement('p');
            element.innerHTML = `<strong>${key.toUpperCase()}:</strong> ${value}`;
            details.appendChild(element);
        });

        // Adding a button for updating the website for each firm
        const updateButton = document.createElement('button');
        updateButton.textContent = 'Update Website';
        updateButton.onclick = function() {
            addWebsite(firm.id); // Assuming 'id' is the unique identifier for firms
        };
        details.appendChild(updateButton);

        container.appendChild(details);
        
        if (index !== firms.length - 1) {
            container.appendChild(document.createElement('hr'));
        }
    });
}

async function addWebsite(firmId) {
    const website = document.getElementById('websiteUrl').value.trim();
    const bodyData = { id: firmId, website };

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
            throw new Error(`Failed to add website, server responded with: ${response.status}`);
        }

        await response.json(); // Confirm success
        alert('Website updated successfully for Firm ID: ' + firmId);
        document.getElementById('websiteUrl').value = '';
        searchFirma(); // Re-fetch to update display
    } catch (error) {
        console.error('Failed to add website:', error);
        const errorMessage = document.getElementById('errorMessage');
        if (errorMessage) {
            errorMessage.textContent = `Failed to add website: ${error.message}`;
        } else {
            console.error('Error message container for adding website not found');
        }
    }
}
