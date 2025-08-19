async function searchFirma() {
  const id = document.getElementById("searchId").value.trim();
  const flashArea = document.getElementById("errorMessage");
  flashArea.innerHTML = "";

  if (!id) {
    showFlash(
      flashArea,
      "Please enter company Name or CUI to perform search.",
      "error"
    );
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
      showFlash(flashArea, "No firm found with given ID.", "error");
      return;
    }

    displayFirmDetails(data.docs);
  } catch (error) {
    console.error("Search failed:", error);
    showFlash(flashArea, `Search failed: ${error.message}`, "error");
  }
}

function displayFirmDetails(firms) {
  const container = document.getElementById("firmDetailsContainer");
  container.innerHTML = "";

  firms.forEach((firm) => {
    const card = document.createElement("div");
    card.className = "firm-card";

    const cardFlash = document.createElement("div");
    cardFlash.className = "card-flash";
    card.appendChild(cardFlash);

    const cardContent = document.createElement("div");
    cardContent.className = "card-content";

    const left = document.createElement("div");
    left.className = "card-left";

    const fields = ["website", "email", "brands", "scraper"];
    fields.forEach((field) => {
      const group = document.createElement("div");
      group.className = "input-group";

      const label = document.createElement("label");
      label.textContent = field.charAt(0).toUpperCase() + field.slice(1);

      const input = document.createElement("input");
      input.type = "text";

      if (Array.isArray(firm[field])) {
        input.value =
          firm[field].length > 0 ? firm[field][firm[field].length - 1] : "";
      } else {
        input.value = firm[field] || "";
      }

      input.placeholder = `Enter ${field}`;

      const btnGroup = document.createElement("div");
      btnGroup.className = "button-group";

      const addBtn = document.createElement("button");
      addBtn.textContent = "Add";
      addBtn.onclick = () =>
        updateField(firm, field, input.value, cardFlash, card, input);

      const deleteBtn = document.createElement("button");
      deleteBtn.textContent = "Delete";
      deleteBtn.onclick = () =>
        deleteField(firm, field, input.value, cardFlash, card, input);

      btnGroup.appendChild(addBtn);
      btnGroup.appendChild(deleteBtn);

      group.appendChild(label);
      group.appendChild(input);
      group.appendChild(btnGroup);
      left.appendChild(group);
    });

    const right = document.createElement("div");
    right.className = "card-right";

    for (const key in firm) {
      if (firm.hasOwnProperty(key)) {
        const value = Array.isArray(firm[key])
          ? firm[key].join(", ")
          : firm[key];

        const element = document.createElement("div");
        element.className = "info-field";
        element.setAttribute("data-field", key.toLowerCase());
        element.innerHTML = `<strong>${key.toUpperCase()}:</strong> ${
          value || "-"
        }`;
        right.appendChild(element);
      }
    }

    cardContent.appendChild(left);
    cardContent.appendChild(right);
    card.appendChild(cardContent);
    container.appendChild(card);
  });
}

function showFlash(container, message, type = "success") {
  container.innerHTML = "";
  const msg = document.createElement("div");
  msg.className = `flash ${type}`;
  msg.textContent = message;
  container.appendChild(msg);

  setTimeout(() => {
    msg.remove();
  }, 3000);
}

async function updateField(firm, field, value, flashArea, card, inputEl) {
  if (!value) {
    showFlash(flashArea, `Please enter a ${field} value.`, "error");
    return;
  }

  try {
    let response;

    if (field === "website") {
      response = await fetch(`https://api.peviitor.ro/v6/firme/website/add/`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: firm.id, [field]: value }),
      });
    } else {
      const formData = new URLSearchParams();
      formData.append("id", firm.id);
      formData.append(field, value);

      const endpointMap = {
        scraper: "scraper",
        brands: "brand",
        email: "email",
      };
      const endpoint = endpointMap[field];

      response = await fetch(
        `https://api.peviitor.ro/v6/firme/${endpoint}/add/`,
        { method: "POST", body: formData }
      );
    }

    if (!response.ok) throw new Error(`Failed to add ${field}`);

    if (Array.isArray(firm[field])) {
      firm[field].push(value);
    } else if (firm[field]) {
      firm[field] = [firm[field], value];
    } else {
      firm[field] = [value];
    }
    inputEl.value = firm[field][firm[field].length - 1];

    const fieldElement = card.querySelector(`[data-field="${field}"]`);
    if (fieldElement) {
      fieldElement.innerHTML = `<strong>${field.toUpperCase()}:</strong> ${firm[
        field
      ].join(", ")}`;
    }

    showFlash(flashArea, `${field} added successfully!`, "success");
  } catch (error) {
    console.error(error);
    showFlash(flashArea, `Failed to add ${field}: ${error.message}`, "error");
  }
}

async function deleteField(firm, field, value, flashArea, card, inputEl) {
  if (!value) {
    showFlash(flashArea, `No ${field} value to delete.`, "error");
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

    const payload = { id: firm.id, [field]: value };

    const response = await fetch(
      `https://api.peviitor.ro/v6/firme/${endpoint}/delete/`,
      {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      }
    );

    if (!response.ok) throw new Error(`Failed to delete ${field}`);

    if (Array.isArray(firm[field])) {
      firm[field] = firm[field].filter((item) => item !== value);
    } else {
      firm[field] = null;
    }

    if (Array.isArray(firm[field]) && firm[field].length > 0) {
      inputEl.value = firm[field][firm[field].length - 1];
    } else {
      inputEl.value = "";
    }

    const fieldElement = card.querySelector(`[data-field="${field}"]`);
    if (fieldElement) {
      const displayVal = Array.isArray(firm[field])
        ? firm[field].join(", ")
        : firm[field] || "-";
      fieldElement.innerHTML = `<strong>${field.toUpperCase()}:</strong> ${displayVal}`;
    }

    showFlash(flashArea, `${field} deleted successfully!`, "success");
  } catch (error) {
    console.error(error);
    showFlash(
      flashArea,
      `Failed to delete ${field}: ${error.message}`,
      "error"
    );
  }
}

const searchForm = document.querySelector(".search-form");
searchForm.addEventListener("submit", (event) => {
  event.preventDefault();
  searchFirma();
});
