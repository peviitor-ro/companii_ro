async function searchFirma() {
  const id = document.getElementById("searchId").value.trim();
  if (!id) {
    alert("Please enter an ID to search.");
    return;
  }

  try {
    const response = await fetch(
      `https://api.peviitor.ro/v6/firme/qsearch/?q=${encodeURIComponent(id)}`
    );

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();
    if (!data.docs || data.docs.length === 0) {
      document.getElementById("firmDetailsContainer").textContent =
        "No firm found with given ID.";
      return;
    }

    displayFirmDetails(data.docs);
  } catch (error) {
    console.error("Search failed:", error);
    document.getElementById(
      "errorMessage"
    ).textContent = `Search failed: ${error.message}`;
  }
}

function displayFirmDetails(firms) {
  const container = document.getElementById("firmDetailsContainer");
  container.innerHTML = "";

  firms.forEach((firm) => {
    const detailsDiv = document.createElement("div");
    detailsDiv.className = "firm-details";

    for (const key in firm) {
      if (firm.hasOwnProperty(key)) {
        const value = Array.isArray(firm[key])
          ? firm[key].join(", ")
          : firm[key];
        const element = document.createElement("p");
        element.innerHTML = `<strong>${key.toUpperCase()}:</strong> ${value}`;
        detailsDiv.appendChild(element);
      }
    }

    const fields = ["website", "email", "brands", "scraper"];
    fields.forEach((field) => {
      const input = document.createElement("input");
      input.type = "text";
      input.value = firm[field]
        ? Array.isArray(firm[field])
          ? firm[field][0]
          : firm[field]
        : "";
      input.placeholder = `Add/Update ${field}`;

      const updateBtn = document.createElement("button");
      updateBtn.textContent = "Update";
      updateBtn.onclick = () => updateField(firm.id, field, input.value);

      const deleteBtn = document.createElement("button");
      deleteBtn.innerHTML = "&#x274C;";
      deleteBtn.onclick = () => deleteField(firm.id, field, input.value);

      detailsDiv.appendChild(input);
      detailsDiv.appendChild(updateBtn);
      detailsDiv.appendChild(deleteBtn);
    });

    container.appendChild(detailsDiv);
    container.appendChild(document.createElement("hr"));
  });
}

async function updateField(firmId, field, value) {
  if (!value) {
    alert(`Please enter a ${field} value to update.`);
    return;
  }

  try {
    let response;

    if (field === "website") {
      //PUT with JSON for website
      response = await fetch(`https://api.peviitor.ro/v6/firme/website/add/`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: firmId, [field]: value }),
      });
    } else {
      //POST with form-data for scraper, brands, email
      const formData = new URLSearchParams();
      formData.append("id", firmId);
      formData.append(field, value);

      const endpointMap = {
        scraper: "scraper",
        brands: "brand",
        email: "email",
      };
      const endpoint = endpointMap[field];

      response = await fetch(
        `https://api.peviitor.ro/v6/firme/${endpoint}/add/`,
        {
          method: "POST",
          body: formData,
        }
      );
    }

    if (!response.ok) {
      throw new Error(`Failed to update ${field}, status: ${response.status}`);
    }

    alert(`${field} updated successfully!`);
    searchFirma();
  } catch (error) {
    console.error(`Failed to update ${field}:`, error);
    document.getElementById(
      "errorMessage"
    ).textContent = `Failed to update ${field}: ${error.message}`;
  }
}

async function deleteField(firmId, field, value) {
  if (!value) {
    alert(`No ${field} value to delete.`);
    return;
  }

  try {
    const endpointMap = {
      website: "website",
      email: "email",
      brands: "brand",
      scraper: "scraper",
    };
    const endpoint = endpointMap[field];

    const payloadValue = Array.isArray(value) ? value : value;

    const payload = { id: firmId, [field]: payloadValue };

    const response = await fetch(
      `https://api.peviitor.ro/v6/firme/${endpoint}/delete/`,
      {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      }
    );

    if (!response.ok) {
      throw new Error(`Failed to delete ${field}, status: ${response.status}`);
    }

    alert(`${field} deleted successfully!`);
    searchFirma();
  } catch (error) {
    console.error(`Failed to delete ${field}:`, error);
    alert(`Failed to delete ${field}: ${error.message}`);
  }
}

const searchForm = document.querySelector(".search-form");
searchForm.addEventListener("submit", (event) => {
  event.preventDefault();
  searchFirma();
});
