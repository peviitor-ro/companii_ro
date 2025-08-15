const SOLR_URL =
  "http://localhost:8983/solr/firme/update?commitWithin=1000&overwrite=true&wt=json";
const AUTH_HEADER = "Basic YWxlOkFsZWlzb25lb2Z0aGViZXN0am1rZXJhMTIzIw=="; // your auth token

async function searchFirma() {
  const id = document.getElementById("searchId").value.trim();
  if (!id) {
    alert("Please enter an ID to search.");
    return;
  }

  try {
    const response = await fetch(
      `https://api.peviitor.ro/v6/firme/qsearch/?q=${encodeURIComponent(id)}`,
      { method: "GET" }
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

    ["website", "brands", "email", "scraper"].forEach((field) => {
      const input = document.createElement("input");
      input.type = "text";
      input.value =
        Array.isArray(firm[field]) && firm[field].length > 0
          ? firm[field][0]
          : "";
      input.placeholder = `Add/Update ${field}`;

      const updateButton = document.createElement("button");
      updateButton.textContent = "Update";
      updateButton.onclick = () => updateField(firm.id, field, input.value);

      detailsDiv.appendChild(input);
      detailsDiv.appendChild(updateButton);

      if (firm[field] && firm[field].length > 0) {
        const deleteButton = document.createElement("button");
        deleteButton.innerHTML = "&#x274C;";
        deleteButton.onclick = () =>
          deleteField(firm.id, field, firm[field][0]);
        detailsDiv.appendChild(deleteButton);
      }

      detailsDiv.appendChild(document.createElement("br"));
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

  if (field === "website") {
    try {
      const response = await fetch(
        `https://api.peviitor.ro/v6/firme/website/add/`,
        {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ id: firmId, website: value }),
        }
      );
      if (!response.ok)
        throw new Error(`Failed to update website, status: ${response.status}`);
      alert("Website updated successfully!");
      searchFirma();
    } catch (error) {
      console.error("Failed to update website:", error);
      document.getElementById(
        "errorMessage"
      ).textContent = `Failed to update website: ${error.message}`;
    }
    return;
  }

  try {
    const response = await fetch(SOLR_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: AUTH_HEADER,
      },
      body: JSON.stringify(body),
    });

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
  if (field === "website") {
    try {
      const response = await fetch(
        `https://api.peviitor.ro/v6/firme/website/delete/`,
        {
          method: "DELETE",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ id: firmId }),
        }
      );
      if (!response.ok)
        throw new Error(`Failed to delete website, status: ${response.status}`);
      alert("Website deleted successfully!");
      searchFirma();
    } catch (error) {
      console.error("Failed to delete website:", error);
      alert(`Failed to delete website: ${error.message}`);
    }
    return;
  }

  const body = [{ id: firmId, [field]: { remove: value } }];
  try {
    const response = await fetch(SOLR_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: AUTH_HEADER,
      },
      body: JSON.stringify(body),
    });
    if (!response.ok)
      throw new Error(`Failed to delete ${field}, status: ${response.status}`);
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
