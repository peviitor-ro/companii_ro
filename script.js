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
        document.getElementById('errorMessage').textContent = `Search failed: ${error.message}`;
    }
}

function displayFirmDetails(firms) {
    const container = document.getElementById('firmDetailsContainer');
    container.innerHTML = '';

    firms.forEach((firm) => {
        const details = document.createElement('div');
        details.className = 'firm-details';
        
        // Iterate through all keys in each firm object
        for (const key in firm) {
            if (firm.hasOwnProperty(key)) {
                const value = firm[key];
                const element = document.createElement('p');
                element.innerHTML = `<strong>${key.toUpperCase()}:</strong> ${value}`;
                details.appendChild(element);
            }
        }

        const inputContainer = document.createElement('div');
        inputContainer.className = 'website-update-container';

        // Input for updating website
        const websiteInput = document.createElement('input');
        websiteInput.type = 'text';
        websiteInput.value = firm.website || '';
        websiteInput.placeholder = 'Add/Update website';

        const updateButton = document.createElement('button');
        updateButton.textContent = 'Update';
        updateButton.onclick = () => updateWebsite(firm.id, websiteInput.value);

        inputContainer.appendChild(websiteInput);
        inputContainer.appendChild(updateButton);
        details.appendChild(inputContainer);

        // Conditional delete button
        if (firm.website) {
            const deleteButton = document.createElement('button');
            deleteButton.innerHTML = '&#x274C;'; // Unicode for a delete icon
            deleteButton.onclick = () => deleteWebsite(firm.id);
            details.appendChild(deleteButton);
        }

        container.appendChild(details);
        container.appendChild(document.createElement('hr')); // Separates each firm entry
    });
}

async function updateWebsite(firmId, website) {
    try {
        const response = await fetch(`https://api.peviitor.ro/v6/firme/website/add/`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ id: firmId, website }),
            mode: 'cors'
        });

        if (!response.ok) {
            throw new Error(`Failed to update website, server responded with: ${response.status}`);
        }

        alert('Website updated successfully!');
        searchFirma(); // Refresh to see changes
    } catch (error) {
        console.error('Failed to update website:', error);
        document.getElementById('errorMessage').textContent = `Failed to update website: ${error.message}`;
    }
}

async function deleteWebsite(firmId) {
    try {
        const response = await fetch(`https://api.peviitor.ro/v6/firme/website/delete/`, {
            method: 'DELETE',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ id: firmId }),
            mode: 'cors'
        });

        if (!response.ok) {
            throw new Error(`Failed to delete website, server responded with: ${response.status}`);
        }

        alert('Website deleted successfully!');
        searchFirma(); // Refresh to see changes
    } catch (error) {
        console.error('Failed to delete website:', error);
        document.getElementById('errorMessage').textContent = `Failed to delete website: ${error.message}`;
    }
}
