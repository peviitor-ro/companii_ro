async function searchFirma() {
    const id = document.getElementById('searchId').value.trim();
    if (!id) {
        alert("Please enter an ID to search.");
        return;
    }

    try {
        const response = await fetch(`https://api.peviitor.ro/v6/firme/qsearch/?q=${encodeURIComponent(id)}`, {
            method: 'GET' // Using GET request since we're only fetching data
            // Removed setting 'Content-Type' header as it's a GET request
        });

        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }

        const data = await response.json();
        if (data.length === 0) {
            document.getElementById('firmDetailsContainer').textContent = 'No firm found with given ID.';
            return;
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
                const value = Array.isArray(firm[key]) ? firm[key].join(', ') : firm[key];
                const element = document.createElement('p');
                element.innerHTML = `<strong>${key.toUpperCase()}:</strong> ${value}`;
                detailsDiv.appendChild(element);
            }
        }

        const websiteInput = document.createElement('input');
        websiteInput.type = 'text';
        websiteInput.value = firm.website ? firm.website[0] : '';
        websiteInput.placeholder = 'Add/Update website';
        
        const updateButton = document.createElement('button');
        updateButton.textContent = 'Update';
        updateButton.onclick = () => updateWebsite(firm.id, websiteInput.value);
        
        detailsDiv.appendChild(websiteInput);
        detailsDiv.appendChild(updateButton);

        if (firm.website) {
            const deleteButton = document.createElement('button');
            deleteButton.innerHTML = '&#x274C;';
            deleteButton.onclick = () => deleteWebsite(firm.id);
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
            body: JSON.stringify({ id: firmId, website: website })
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
            body: JSON.stringify({ id: firmId })
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
