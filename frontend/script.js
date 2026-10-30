
const API_URL = "https://plant-care-managament.onrender.com/api/plants";

// DOM elements
const plantList = document.getElementById("plantList");
const plantForm = document.getElementById("plantForm");
const plantModal = document.getElementById("plantModal");
const searchInput = document.getElementById("searchInput");
const categoryFilter = document.getElementById("categoryFilter");
const message = document.getElementById("message");

let allPlants = [];

// Plant images based on category
const plantImages = {
    Indoor: "https://images.unsplash.com/photo-1501004318641-b39e6451bec6?w=600",
    Outdoor: "https://images.unsplash.com/photo-1509423350716-97f2360afc9e?w=600",
    Flowering: "https://images.unsplash.com/photo-1497250681960-ef046c08a56e?w=600",
    Herb: "https://images.unsplash.com/photo-1485955900006-10f4d324d411?w=600"
};

// Display today's date
document.getElementById("todayDate").textContent =
    new Date().toLocaleDateString("en-IN", {
        day: "numeric",
        month: "short",
        year: "numeric"
    });


// SHOW MESSAGE
function showMessage(text, isError = false) {
    message.textContent = text;
    message.style.color = isError ? "#bf6259" : "#477b5b";

    if (text) {
        window.setTimeout(() => {
            if (message.textContent === text) {
                message.textContent = "";
            }
        }, 4000);
    }
}


// OPEN MODAL
function openModal() {
    plantModal.classList.add("show");
    document.body.style.overflow = "hidden";
}


// CLOSE MODAL
function closeModal() {
    plantModal.classList.remove("show");
    document.body.style.overflow = "";
    resetForm();
}


// RESET FORM
function resetForm() {
    plantForm.reset();

    document.getElementById("plantId").value = "";

    document.getElementById("formTitle").textContent =
        "Add New Plant";

    document.getElementById("submitBtn").innerHTML =
        '<i class="fa-solid fa-plus"></i> Save Plant';
}


// ADD NEW PLANT BUTTONS
document.getElementById("addPlantBtn").addEventListener("click", () => {
    resetForm();
    openModal();
});

document.getElementById("sidebarAddBtn").addEventListener("click", () => {
    resetForm();
    openModal();
});

document.getElementById("closeModal").addEventListener("click", closeModal);

document.getElementById("cancelBtn").addEventListener("click", closeModal);


// CLOSE MODAL BY CLICKING OUTSIDE
plantModal.addEventListener("click", (event) => {
    if (event.target === plantModal) {
        closeModal();
    }
});


// FETCH ALL PLANTS - READ
async function getPlants() {
    try {
        const response = await fetch(API_URL);

        if (!response.ok) {
            throw new Error("Unable to load plant records");
        }

        const result = await response.json();

        allPlants = result.data || [];

        updateStatistics();
        filterPlants();

    } catch (error) {
        plantList.innerHTML = `
            <div class="loading-state">
                <i class="fa-solid fa-triangle-exclamation"></i>
                <p>Unable to connect to the backend. Please check your server.</p>
            </div>
        `;

        showMessage(error.message, true);
    }
}


// UPDATE DASHBOARD STATISTICS
function updateStatistics() {

    document.getElementById("totalPlants").textContent =
        allPlants.length;

    document.getElementById("indoorPlants").textContent =
        allPlants.filter(p => p.category === "Indoor").length;

    document.getElementById("outdoorPlants").textContent =
        allPlants.filter(p => p.category === "Outdoor").length;

    document.getElementById("floweringPlants").textContent =
        allPlants.filter(p => p.category === "Flowering").length;

    document.getElementById("plantCount").textContent =
        `${allPlants.length} ${allPlants.length === 1 ? "Plant" : "Plants"}`;
}


// DISPLAY PLANT CARDS
function displayPlants(plants) {

    plantList.innerHTML = "";

    if (plants.length === 0) {
        plantList.innerHTML = `
            <div class="empty-state">
                <i class="fa-solid fa-seedling"></i>
                <h3>No plants found</h3>
                <p>Add a new plant or change your search filters.</p>
            </div>
        `;
        return;
    }

    plants.forEach(plant => {

        const card = document.createElement("article");
        card.className = "plant-card";

        // Plant image
        const imageSection = document.createElement("div");
        imageSection.className = "plant-image";

        const img = document.createElement("img");
        img.src = plantImages[plant.category] || plantImages.Indoor;
        img.alt = plant.plantName;
        img.loading = "lazy";

        // Fallback if image fails
        img.onerror = function () {
            this.remove();

            const emoji = document.createElement("span");
            emoji.className = "plant-emoji";
            emoji.textContent = "🌿";

            imageSection.prepend(emoji);
        };

        const badge = document.createElement("span");
        badge.className = "category-badge";
        badge.textContent = plant.category;

        imageSection.append(img, badge);


        // Plant information
        const body = document.createElement("div");
        body.className = "plant-body";

        const title = document.createElement("h3");
        title.textContent = plant.plantName;

        const frequency = createDetail(
            "fa-droplet",
            `Water every ${plant.wateringFrequency} days`
        );

        const date = createDetail(
            "fa-calendar-days",
            `Last watered: ${formatDate(plant.lastWatered)}`
        );

        const sunlight = createDetail(
            "fa-sun",
            plant.sunlight
        );

        const notes = document.createElement("div");
        notes.className = "plant-notes";
        notes.textContent =
            plant.notes || "No additional notes available.";


        // Action buttons
        const actions = document.createElement("div");
        actions.className = "card-actions";

        const editButton = document.createElement("button");
        editButton.className = "edit-button";
        editButton.innerHTML =
            '<i class="fa-regular fa-pen-to-square"></i> Edit';

        editButton.addEventListener("click", () => {
            editPlant(plant);
        });

        const deleteButton = document.createElement("button");
        deleteButton.className = "delete-button";
        deleteButton.innerHTML =
            '<i class="fa-regular fa-trash-can"></i> Delete';

        deleteButton.addEventListener("click", () => {
            deletePlant(plant._id);
        });

        actions.append(editButton, deleteButton);

        body.append(title, frequency, date, sunlight, notes, actions);

        card.append(imageSection, body);

        plantList.appendChild(card);
    });
}


// CREATE PLANT DETAIL ELEMENT
function createDetail(iconName, text) {

    const detail = document.createElement("div");
    detail.className = "plant-detail";

    const icon = document.createElement("i");
    icon.className = `fa-solid ${iconName}`;

    const content = document.createElement("span");
    content.textContent = text;

    detail.append(icon, content);

    return detail;
}


// FORMAT DATE
function formatDate(date) {
    const parsedDate = new Date(date);

    if (Number.isNaN(parsedDate.getTime())) {
        return "Not available";
    }

    return parsedDate.toLocaleDateString("en-IN", {
        day: "2-digit",
        month: "short",
        year: "numeric",
        timeZone: "UTC"
    });
}


// CREATE AND UPDATE PLANT
plantForm.addEventListener("submit", async (event) => {

    event.preventDefault();

    const id = document.getElementById("plantId").value;

    const plantData = {

        plantName: document.getElementById("plantName").value.trim(),

        category: document.getElementById("category").value,

        wateringFrequency: Number(
            document.getElementById("wateringFrequency").value
        ),

        lastWatered: document.getElementById("lastWatered").value,

        sunlight: document.getElementById("sunlight").value,

        notes: document.getElementById("notes").value.trim()
    };


    if (!plantData.plantName ||
        !plantData.category ||
        !plantData.lastWatered ||
        !plantData.sunlight ||
        !Number.isInteger(plantData.wateringFrequency) ||
        plantData.wateringFrequency < 1 ||
        plantData.wateringFrequency > 365) {

        showMessage("Please enter valid plant information.", true);
        return;
    }


    const submitButton = document.getElementById("submitBtn");

    submitButton.disabled = true;
    submitButton.textContent = "Saving...";

    try {

        const response = await fetch(
            id ? `${API_URL}/${id}` : API_URL,
            {
                method: id ? "PUT" : "POST",

                headers: {
                    "Content-Type": "application/json"
                },

                body: JSON.stringify(plantData)
            }
        );

        const result = await response.json();

        if (!response.ok) {
            throw new Error(result.message || "Unable to save plant");
        }

        closeModal();

        await getPlants();

        showMessage(result.message);

    } catch (error) {

        showMessage(error.message, true);

    } finally {

        submitButton.disabled = false;

        const isEditing = Boolean(id);

        submitButton.innerHTML = isEditing
            ? '<i class="fa-solid fa-check"></i> Update Plant'
            : '<i class="fa-solid fa-plus"></i> Save Plant';
    }
});


// EDIT PLANT
function editPlant(plant) {

    resetForm();

    document.getElementById("plantId").value = plant._id;

    document.getElementById("plantName").value =
        plant.plantName;

    document.getElementById("category").value =
        plant.category;

    document.getElementById("wateringFrequency").value =
        plant.wateringFrequency;

    document.getElementById("lastWatered").value =
        plant.lastWatered.substring(0, 10);

    document.getElementById("sunlight").value =
        plant.sunlight;

    document.getElementById("notes").value =
        plant.notes || "";

    document.getElementById("formTitle").textContent =
        "Update Plant Details";

    document.getElementById("submitBtn").innerHTML =
        '<i class="fa-solid fa-check"></i> Update Plant';

    openModal();
}


// DELETE PLANT
async function deletePlant(id) {

    const confirmed = confirm(
        "Are you sure you want to delete this plant?"
    );

    if (!confirmed) return;

    try {

        const response = await fetch(`${API_URL}/${id}`, {
            method: "DELETE"
        });

        const result = await response.json();

        if (!response.ok) {
            throw new Error(result.message || "Unable to delete plant");
        }

        await getPlants();

        showMessage(result.message);

    } catch (error) {

        showMessage(error.message, true);
    }
}


// SEARCH AND CATEGORY FILTER
function filterPlants() {

    const searchText = searchInput.value.toLowerCase().trim();

    const selectedCategory = categoryFilter.value;

    const filteredPlants = allPlants.filter(plant => {

        const matchesSearch = plant.plantName
            .toLowerCase()
            .includes(searchText);

        const matchesCategory =
            !selectedCategory ||
            plant.category === selectedCategory;

        return matchesSearch && matchesCategory;
    });

    displayPlants(filteredPlants);
}


searchInput.addEventListener("input", filterPlants);

categoryFilter.addEventListener("change", filterPlants);


// SIDEBAR CATEGORY FILTER
document.querySelectorAll(".category-link").forEach(button => {

    button.addEventListener("click", () => {

        categoryFilter.value = button.dataset.category;

        searchInput.value = "";

        filterPlants();

        document.getElementById("myPlants").scrollIntoView({
            behavior: "smooth"
        });
    });
});


// RESET FILTERS
document.getElementById("resetFilter").addEventListener("click", () => {

    searchInput.value = "";
    categoryFilter.value = "";

    filterPlants();
});


// SIDEBAR NAVIGATION
document.querySelectorAll(".nav-link").forEach(link => {

    if (link.tagName === "A") {

        link.addEventListener("click", () => {

            document.querySelectorAll(".nav-link").forEach(item => {
                item.classList.remove("active");
            });

            link.classList.add("active");
        });
    }
});


// INITIALIZE APPLICATION
getPlants();
