$(document).ready(function () {
    const spaceUrl = "https://reinemeptember.sgp1.digitaloceanspaces.com";
    fetchAndDisplayContents(spaceUrl);
});

// Function to fetch and display contents of the DigitalOcean Space
async function fetchAndDisplayContents(spaceUrl, folder = '') {
    try {
        // Fetch the XML response from the Space
        const response = await fetch(`${spaceUrl}?prefix=${folder}`);

        if (!response.ok) {
            throw new Error(`Failed to fetch the contents: ${response.status}`);
        }

        // Parse the XML response
        const text = await response.text();
        const parser = new DOMParser();
        const xmlDoc = parser.parseFromString(text, "text/xml");

        // Get the file and folder contents from the XML
        const contents = xmlDoc.getElementsByTagName("Contents");

        // Clear the gallery container
        $('#gallery_container').html('');

        // List all files (Contents)
        for (let content of contents) {
            const fileName = content.getElementsByTagName("Key")[0].textContent;
            const fileUrl = `${spaceUrl}/${fileName}`;

            // Determine the file type by extension
            if (/\.(jpg|jpeg|png|gif|webp)$/i.test(fileName)) {
                // If file is an image
                const img = new Image();
                img.src = fileUrl;

                // Create a card with a loading spinner
                const cardHtml = createGalleryItemHtml(fileUrl, fileName, 'is-one-quarter', 'image');
                $('#gallery_container').append(cardHtml);

                // Replace the spinner with the image when loaded
                img.onload = function () {
                    const aspectRatio = img.width / img.height;
                    const columnSize = getColumnSize(aspectRatio, 'image');
                    replaceSpinnerWithMedia(fileUrl, fileName, 'image', columnSize);
                };

            } else if (/\.(mp4|webm|ogg)$/i.test(fileName)) {
                // If file is a video
                const video = document.createElement('video');
                video.src = fileUrl;

                // Create a card with a loading spinner
                const cardHtml = createGalleryItemHtml(fileUrl, fileName, 'is-one-quarter', 'video');
                $('#gallery_container').append(cardHtml);

                // Replace the spinner with the video when loaded
                video.onloadedmetadata = function () {
                    const aspectRatio = video.videoWidth / video.videoHeight;
                    const columnSize = getColumnSize(aspectRatio, 'video');
                    replaceSpinnerWithMedia(fileUrl, fileName, 'video', columnSize);
                };
            }
        }

    } catch (error) {
        console.error("Error fetching contents:", error);
    }
}

// Helper function to create gallery item HTML with a spinner
function createGalleryItemHtml(fileUrl, fileName, columnSize, mediaType) {
    return `
        <div class="column ${columnSize}" id="card-${fileName}">
            <div class="card">
                <div class="loading-spinner">
                     <div class="spinner"></div> <!-- Loading spinner -->
                </div>
                <div class="card-image">
                    ${mediaType === 'image' ? `<img src="${thumbnailUrl}" alt="${fileName}" class="media">` : `<img src="${thumbnailUrl}" alt="${fileName}" class="media">`}
                </div>
                <div class="card-content">
                    <div class="media-content">
                        <p class="title is-4">John Smith</p>
                        <p class="subtitle is-6">@johnsmith</p>
                    </div>
                </div>
            </div>
        </div>
    `;
}


// Helper function to replace the spinner with the actual media
function replaceSpinnerWithMedia(fileUrl, fileName, mediaType, columnSize) {
    const mediaSelector = mediaType === 'image' ? img[src="${fileUrl}"] : video[src="${fileUrl}"];
    const $mediaElement = $(mediaSelector);

    // Update the column size based on aspect ratio
    $mediaElement.closest('.column').removeClass('is-one-quarter is-half is-full').addClass(columnSize);

    // Hide the spinner and show the media
    $mediaElement.siblings('.loading-spinner').remove();
    $mediaElement.show();
}

// Helper function to determine column size based on aspect ratio and screen width
function getColumnSize(aspectRatio, mediaType) {
    const isMobile = window.innerWidth < 768; // Define mobile breakpoint

    if (isMobile) {
        return 'is-full'; // Full width on mobile for both landscape and portrait
    } else {
        return aspectRatio > 1 ? 'is-half' : 'is-one-quarter'; // Half width for landscape, quarter width for portrait on larger screens
    }
}

// CSS for loading spinner
const style = document.createElement('style');
style.innerHTML = `
    .loading-spinner {
        display: flex;
        align-items: center;
        justify-content: center;
        height: 150px; /* Adjust based on desired spinner size */
    }
    .spinner {
        border: 4px solid #f3f3f3; /* Light grey */
        border-top: 4px solid #3498db; /* Blue */
        border-radius: 50%;
        width: 24px;
        height: 24px;
        animation: spin 2s linear infinite;
    }
    @keyframes spin {
        0% { transform: rotate(0deg); }
        100% { transform: rotate(360deg); }
    }
`;
document.head.appendChild(style);