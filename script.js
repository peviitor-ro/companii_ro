async function searchFirma() {
    const id = document.getElementById('searchId').value.trim();
    if (!id) {
        alert("Please enter an ID to search.");
        return;
    }

    try {
        const response = await fetch(`https://api.peviitor.ro/v6/firme/qsearch/?q=${encodeURIComponent(id)}`, {
            method: 'GET',
            mode: 'cors',
            headers: {
                'Content-Type': 'application/json'
            }
        });

        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }

        const data = await response.json();
        if (data.length === 0) {
            throw new Error('No firm found with given ID');
        }
        
        displayFirmDetails(data);
    } catch (error) {
        console.error('Search failed:', error);
        document.getElementById('errorMessage').textContent = `Search failed: ${error.message}`;
    }
}

function displayFirmDetails(firms) {
    const container = document.getElementById('firmDetailsContainer');
    container.innerHTML = '';

    firms.forEach((firm) => {
        const detailsDiv = document.createElement('div');
        detailsDiv.className = 'firm-details';

        for (const key in firm) {
            if (firm.hasOwnProperty(key)) {
                const value = firm[key];
                const element = document.createElement('p');
                if (Array.isArray(value)) {
                    element.innerHTML = `<strong>${key.toUpperCase()}:</strong> ${value.join(', ')}`;
                } else {
                    element.innerHTML = `<strong>${key.toUpperCase()}:</strong> ${value}`;
                }
                detailsDiv.appendChild(element);
            }
        }

        if (firm.website && firm.website.length > 0) {
            const websiteInput = document.createElement('input');
            websiteInput.type = 'text';
            websiteInput.value = firm.website[0]; // assuming first entry is the main website
            websiteInput.placeholder = 'Add/Update website';

            const updateButton = document.createElement('button');
            updateButton.textContent = 'Update';
            updateButton.onclick = () => updateWebsite(firm.id, websiteInput.value);

            const deleteButton = document.createElement('button');
            deleteButton.innerHTML = '&#x274C;';
            deleteButton.onclick = () => deleteWebsite(firm.id);

            detailsDiv.appendChild(websiteInput);
            detailsDiv.appendChild(updateButton);
            detailsDiv.appendChild(deleteButton);
        }

        container.appendChild(detailsDiv);
        container.appendChild(document.createElement('hr'));
    });
}

async function updateWebsite(firmId, website) {
    try {
        const response = await fetch(`https://api.peviitor.ro/v6/firme/website/add/`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ id: firmId, website: website }),
            mode: 'cors'
        });

        if (!response.ok) {
            throw new Error(`Failed to update website, server responded with: ${response.status}`);
        }

        alert('Website updated successfully!');
        searchFirma(); // Refresh to show updated data
    } catch (error) {
        console.error('Failed to update website:', error);
        document.getElementById('errorMessage').textContent = `Failed to update website: ${error.message}`;
    }
}

async function deleteWebsite(firmId) {
    try {
        const response = await fetch(`https://api.peviitor.ro/v6/firme/website/delete/`, {
            method: 'DELETE',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ id: firmId }),
            mode: 'cors'
        });

        if (!response.ok) {
            throw new Error(`Failed to delete website, server responded with: ${response.status}`);
        }

        alert('Website deleted successfully!');
        searchFirma(); // Refresh to show that the website has been removed
    } catch (error) {
        console.error('Failed to delete website:', error);
        document.getElementById('errorMessage').textContent = `Failed to delete website: ${error.message}`;
    }
}
