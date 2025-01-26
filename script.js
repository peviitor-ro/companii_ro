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
    container.innerHTML = ''; // Clear previous results

    firms.forEach((firm, index) => {
        const details = document.createElement('div');
        details.style.padding = "10px";
        details.style.margin = "10px 0";
        details.style.border = "1px solid #ccc";
        details.style.borderRadius = "5px";

        Object.keys(firm).forEach(key => {
            const value = Array.isArray(firm[key]) ? firm[key].join(', ') : firm[key];
            const element = document.createElement('p');
            element.innerHTML = `<strong>${key.toUpperCase()}:</strong> ${value}`;
            details.appendChild(element);
        });

        if (index < firms.length - 1) {
            const delimiter = document.createElement('hr'); // Delimiter
            details.appendChild(delimiter);
        }
        
        container.appendChild(details);        
    });
}

async function addWebsite() {
    const id = document.getElementById('searchId').value.trim();
    const website = document.getElementById('websiteUrl').value.trim();
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

        await response.json();
        alert('Website added successfully!');
        document.getElementById('websiteUrl').value = '';
        searchFirma(); // Re-fetch and display all firms including the new website data
    } catch (error) {
        console.error('Failed to add website:', error);
        document.getElementById('errorMessage').textContent = `Failed to add website: ${error.message}`;
    }
}
