function formatPhoneNumber(value) {
  let cleaned = value.replace(/[\s\(\)-]/g, "");

  const hasPlus = cleaned.startsWith("+");
  if (hasPlus) {
    cleaned = "+" + cleaned.slice(1).replace(/\D/g, "");
  } else {
    cleaned = cleaned.replace(/\D/g, "");
  }

  if (cleaned.length <= 3) {
    return cleaned;
  }

  const numDigits = hasPlus ? cleaned.slice(1) : cleaned;
  const prefix = hasPlus ? cleaned.slice(0, 1) : "";

  let formattedDigits = "";
  for (let i = 0; i < numDigits.length; i++) {
    formattedDigits += numDigits[i];
    if ((i + 1) % 3 === 0 && i !== numDigits.length - 1) {
      formattedDigits += " ";
    }
  }

  const regex =
    /(\+\d{1,3})?(\d{1,3})?(\d{1,3})?(\d{1,3})?(\d{1,3})?(\d{1,3})?(\d+)?/;

  return cleaned
    .replace(regex, (match, p1, p2, p3, p4, p5, p6, p7) => {
      let parts = [p1, p2, p3, p4, p5, p6, p7].filter((p) => p);
      let result = "";

      if (parts.length === 0) return "";

      if (parts[0] && parts[0].startsWith("+")) {
        result += parts.shift();
        if (parts.length > 0) {
          result += " " + parts.join(" ");
        }
      } else {
        result = parts.join(" ");
      }

      return result;
    })
    .trim()
    .replace(/\s+/g, " ");
}

function createLink(key, value) {
  if (!value) return "-";

  let cleanValue = value;
  if (key === "phone") {
    cleanValue = value.replace(/[\s\(\)-]/g, "");
  }

  let href = "";
  let target = "";
  let displayValue = value;

  switch (key) {
    case "website":
      href = cleanValue.startsWith("http")
        ? cleanValue
        : `https://${cleanValue}`;
      target = "_blank";
      break;
    case "scraper":
      href = cleanValue.startsWith("http")
        ? cleanValue
        : `https://${cleanValue}`;
      target = "_blank";
      break;
    case "email":
      href = `mailto:${cleanValue}`;
      break;
    case "phone":
      href = `tel:${cleanValue}`;
      displayValue = formatPhoneNumber(value);
      break;
    case "logo":
      href = cleanValue.startsWith("http")
        ? cleanValue
        : `https://${cleanValue}`;
      target = "_blank";
      break;
    default:
      return value;
  }

  return `<a href="${href}"${
    target ? ` target="${target}"` : ""
  }>${displayValue}</a>`;
}

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

    const fields = ["website", "email", "phone", "brands", "logo", "scraper"];
    fields.forEach((field) => {
      const group = document.createElement("div");
      group.className = "input-group";

      const label = document.createElement("label");
      label.textContent = field.charAt(0).toUpperCase() + field.slice(1);

      const input = document.createElement("input");
      input.type = "text";

      let initialValue = "";
      if (Array.isArray(firm[field])) {
        initialValue =
          firm[field].length > 0 ? firm[field][firm[field].length - 1] : "";
      } else {
        initialValue = firm[field] || "";
      }

      if (field === "phone") {
        input.value = formatPhoneNumber(initialValue);

        input.addEventListener("input", (e) => {
          const cursorPosition = input.selectionStart;
          const oldValue = input.value;
          const newValue = formatPhoneNumber(e.target.value);
          input.value = newValue;

          const diff = newValue.length - oldValue.length;
          input.selectionEnd = cursorPosition + diff;
        });

        input.placeholder = "+40 7xx xxx xxx sau număr național";
      } else {
        input.value = initialValue;
        input.placeholder = `Enter ${field}`;
      }

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

      // Only show admin buttons if authenticated
      if (window.authManager && window.authManager.isAuthenticated()) {
        btnGroup.appendChild(addBtn);
        btnGroup.appendChild(deleteBtn);
      } else {
        // Show disabled message
        const disabledMsg = document.createElement("div");
        disabledMsg.className = "admin-disabled";
        disabledMsg.textContent = "Login required for editing";
        btnGroup.appendChild(disabledMsg);
        input.disabled = true;
      }

      group.appendChild(label);
      group.appendChild(input);
      group.appendChild(btnGroup);
      left.appendChild(group);
    });

    const right = document.createElement("div");
    right.className = "card-right";

    for (const key in firm) {
      if (firm.hasOwnProperty(key)) {
        let value = firm[key];
        const keyLower = key.toLowerCase();

        let displayValue;

        if (Array.isArray(value)) {
          const items = value.map((item) => {
            if (
              ["website", "scraper", "email", "logo", "phone"].includes(
                keyLower
              )
            ) {
              return createLink(keyLower, item);
            }
            if (keyLower === "phone") {
              return formatPhoneNumber(item);
            }
            return item;
          });
          displayValue = items.join(", ");
        } else {
          if (
            ["website", "scraper", "email", "logo", "phone"].includes(keyLower)
          ) {
            displayValue = createLink(keyLower, value);
          } else {
            displayValue = value || "";
          }
        }

        const element = document.createElement("div");
        element.className = "info-field";
        element.setAttribute("data-field", keyLower);

        element.innerHTML = `<strong>${key.toUpperCase()}:</strong> ${
          displayValue || "-"
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
  if (!window.authManager || !window.authManager.isAuthenticated()) {
    showFlash(flashArea, "Authentication required to modify data", "error");
    return;
  }

  let cleanValue = value;

  if (!value) {
    showFlash(flashArea, `Please enter a ${field} value.`, "error");
    return;
  }

  if (field === "email") {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(value)) {
      showFlash(flashArea, `Invalid email format.`, "error");
      return;
    }
  }

  if (field === "phone") {
    cleanValue = value.replace(/[\s\(\)-]/g, "");
    const phoneCleanRegex = /^\+?\d+$/;

    if (!phoneCleanRegex.test(cleanValue)) {
      showFlash(
        flashArea,
        `Phone number should contain only digits and may start with '+'.`,
        "error"
      );
      return;
    }
  }

  if (Array.isArray(firm[field]) && firm[field].includes(cleanValue)) {
    showFlash(flashArea, `${field} "${cleanValue}" already exists.`, "error");
    return;
  }

  try {
    let response;
    const formData = new URLSearchParams();
    formData.append("id", firm.id);
    formData.append(field, cleanValue);

    const endpointMap = {
      website: "website",
      scraper: "scraper",
      brands: "brand",
      email: "email",
      phone: "phone",
      logo: "logo",
    };
    const endpoint = endpointMap[field];

    // Use authenticated fetch for API requests
    if (window.authManager.isAuthenticated()) {
      response = await window.authManager.authenticatedFetch(
        `https://api.peviitor.ro/v6/firme/${endpoint}/add/`,
        { method: "POST", body: formData }
      );
    } else {
      // Fallback to regular fetch if not authenticated (should not reach here)
      response = await fetch(
        `https://api.peviitor.ro/v6/firme/${endpoint}/add/`,
        { method: "POST", body: formData }
      );
    }

    if (!response.ok) throw new Error(`Failed to add ${field}`);

    if (Array.isArray(firm[field])) {
      firm[field].push(cleanValue);
    } else if (firm[field]) {
      firm[field] = [firm[field], cleanValue];
    } else {
      firm[field] = [cleanValue];
    }

    let newInputValue = cleanValue;
    if (field === "phone") {
      newInputValue = formatPhoneNumber(cleanValue);
    }

    inputEl.value = newInputValue;

    const fieldElement = card.querySelector(`[data-field="${field}"]`);
    if (fieldElement) {
      let displayValue;
      if (Array.isArray(firm[field])) {
        displayValue = firm[field]
          .map((item) => createLink(field, item))
          .join(", ");
      } else {
        displayValue = createLink(field, firm[field]);
      }

      fieldElement.innerHTML = `<strong>${field.toUpperCase()}:</strong> ${displayValue}`;
    }

    showFlash(flashArea, `${field} added successfully!`, "success");
  } catch (error) {
    console.error(error);
    showFlash(flashArea, `Failed to add ${field}: ${error.message}`, "error");
  }
}

async function deleteField(firm, field, value, flashArea, card, inputEl) {
  if (!window.authManager || !window.authManager.isAuthenticated()) {
    showFlash(flashArea, "Authentication required to modify data", "error");
    return;
  }

  let cleanValue = value;
  if (field === "phone") {
    cleanValue = value.replace(/[\s\(\)-]/g, "");
  }

  if (!cleanValue) {
    showFlash(flashArea, `No ${field} value to delete.`, "error");
    return;
  }

  try {
    const endpointMap = {
      website: "website",
      email: "email",
      phone: "phone",
      brands: "brand",
      logo: "logo",
      scraper: "scraper",
    };
    const endpoint = endpointMap[field];

    const payload = { id: firm.id, [field]: cleanValue };

    let response;
    if (window.authManager.isAuthenticated()) {
      response = await window.authManager.authenticatedFetch(
        `https://api.peviitor.ro/v6/firme/${endpoint}/delete/`,
        {
          method: "DELETE",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        }
      );
    } else {
      response = await fetch(
        `https://api.peviitor.ro/v6/firme/${endpoint}/delete/`,
        {
          method: "DELETE",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        }
      );
    }

    if (!response.ok) throw new Error(`Failed to delete ${field}`);

    if (Array.isArray(firm[field])) {
      firm[field] = firm[field].filter((item) => item !== cleanValue);
    } else {
      firm[field] = null;
    }

    let newInputValue =
      Array.isArray(firm[field]) && firm[field].length > 0
        ? firm[field][firm[field].length - 1]
        : "";

    if (field === "phone") {
      newInputValue = formatPhoneNumber(newInputValue);
    }

    inputEl.value = newInputValue;

    const fieldElement = card.querySelector(`[data-field="${field}"]`);
    if (fieldElement) {
      let displayVal;
      if (Array.isArray(firm[field])) {
        displayVal = firm[field]
          .map((item) => createLink(field, item))
          .join(", ");
      } else {
        displayVal = createLink(field, firm[field]);
      }

      fieldElement.innerHTML = `<strong>${field.toUpperCase()}:</strong> ${
        displayVal || "-"
      }`;
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
