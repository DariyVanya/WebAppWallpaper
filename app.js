import { initializeApp } from "https://www.gstatic.com/firebasejs/9.15.0/firebase-app.js";
import { getDatabase, ref, push, query, orderByChild, equalTo, onValue } from "https://www.gstatic.com/firebasejs/9.15.0/firebase-database.js";

const appSettings = {
    databaseURL: "https://wallpaper-app-af57b-default-rtdb.europe-west1.firebasedatabase.app/"
};

const app = initializeApp(appSettings);
const database = getDatabase(app);
const wallpapersRef = ref(database, "wallpapers");

const devModeBtn = document.getElementById("dev-mode-btn");
const uploadContainer = document.getElementById("upload-container");
const uploadInput = document.getElementById("upload-input");
const tagInput = document.getElementById("tag-input");
const uploadBtn = document.getElementById("upload-btn");
const searchBtn = document.getElementById("search-btn");
const searchInput = document.getElementById("search-input");

let isDevMode = false;

// Toggle Developer Mode
devModeBtn.addEventListener("click", () => {
    isDevMode = !isDevMode;
    uploadContainer.style.display = isDevMode ? "block" : "none";
});

// Handle wallpaper upload with tag and format
uploadBtn.addEventListener("click", () => {
    const file = uploadInput.files[0];
    const tag = tagInput.value.trim();
    
    if (file && tag) {
        const reader = new FileReader();
        reader.onload = (event) => {
            const newWallpaper = {
                url: event.target.result,
                keywords: tag, // Store the tag under "keywords"
                format: file.type // Store the MIME type as "format"
            };
            push(wallpapersRef, newWallpaper).then(() => {
                alert("Wallpaper with tag uploaded successfully.");
                tagInput.value = ""; // Clear tag input after upload
                uploadInput.value = ""; // Clear file input after upload
            }).catch((error) => {
                console.error("Error uploading wallpaper:", error);
            });
        };
        reader.readAsDataURL(file);
    } else {
        alert("Please select a file and enter a tag.");
    }
});

// Search for wallpapers by tag
searchBtn.addEventListener("click", () => {
    const tag = searchInput.value.trim();
    if (tag) {
        searchWallpapers(tag);
    } else {
        alert("Please enter a tag to search.");
    }
});

// Search function to find wallpapers by tag
function searchWallpapers(tag) {
    const tagQuery = query(wallpapersRef, orderByChild("keywords"), equalTo(tag));
    onValue(tagQuery, (snapshot) => {
        const data = snapshot.val();
        displayResults(data);
    });
}

function displayResults(data) {
    const resultsContainer = document.getElementById("results-container");
    resultsContainer.innerHTML = "";
    
    if (data) {
        for (const key in data) {
            const wallpaper = data[key];
            
            // Create a link element for downloading
            const link = document.createElement("a");
            link.href = wallpaper.url;
            link.download = `wallpaper-${key}.${wallpaper.format.split('/')[1]}`; // Set filename with the correct format

            // Create the image element
            const img = document.createElement("img");
            img.src = wallpaper.url;
            img.classList.add("wallpaper-image");
            img.style.width = "100%"; // Set width to 100% of the parent container
            img.style.height = "auto"; // Maintain aspect ratio

            // Append the image to the link, and the link to the results container
            link.appendChild(img);
            resultsContainer.appendChild(link);
        }
    } else {
        alert("No wallpapers found with this tag.");
    }
}
