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

        // Clear the containers
        $('#cosplay_container').html('');
        $('#fanart_container').html('');
        let modalsHtml = '';

        // List all files (Contents)
        for (let content of contents) {
            const fileName = content.getElementsByTagName("Key")[0].textContent;

            // Skip thumbnail files in this loop, we handle them separately
            if (fileName.includes('_thumb')) {
                continue;
            }

            const fileUrl = `${spaceUrl}/${fileName}`;
            let thumbUrl;

            // Check if the file is an image or a video
            if (/\.(mp4|webm|ogg)$/i.test(fileName)) {
                // For videos, generate a thumbnail URL with .jpg extension
                thumbUrl = `${spaceUrl}/${fileName.replace(/\.(mp4|webm|ogg)$/i, '_thumb.jpg')}`;
            } else {
                // For images, replace the extension with '_thumb' preserving the original extension
                thumbUrl = `${spaceUrl}/${fileName.replace(/\.(jpg|jpeg|png|gif|webp)$/i, '_thumb.$1')}`;
            }

            // Determine the file type by extension
            if (/\.(jpg|jpeg|png|gif|webp)$/i.test(fileName)) {
                // If file is an image
                const img = new Image();
                img.src = thumbUrl;

                // Determine which container to append to
                const container = fileName.startsWith('cosplay/') ? '#cosplay_container' : '#fanart_container';

                // Create a card with the thumbnail
                const cardHtml = createGalleryItemHtml(thumbUrl, fileName, 'is-one-quarter', 'image', fileUrl);
                $(container).append(cardHtml);

                // Prepare modal HTML for the full image with lazy loading
                modalsHtml += createModalHtml(fileUrl, fileName, 'image');

                // Auto-check for portrait or landscape once thumbnail is loaded
                img.onload = function() {
                    const aspectRatio = img.width / img.height;
                    const columnSize = aspectRatio > 1 ? 'is-half' : 'is-one-quarter';

                    // Sanitize the fileName to create a valid ID
                    const sanitizedFileName = fileName.replace(/[^a-zA-Z0-9-_]/g, '-');

                    // Then use it to select the element
                    $(`#card-${sanitizedFileName}`).removeClass('is-one-quarter').addClass(columnSize);
                };

            } else if (/\.(mp4|webm|ogg)$/i.test(fileName)) {
                // If file is a video
                const video = document.createElement('video');
                video.src = fileUrl;

                // Determine which container to append to
                const container = fileName.startsWith('cosplay/') ? '#cosplay_container' : '#fanart_container';

                // Create a card with the thumbnail
                const cardHtml = createGalleryItemHtml(thumbUrl, fileName, 'is-one-quarter', 'video', fileUrl);
                $(container).append(cardHtml);

                // Prepare modal HTML for the full video with lazy loading
                modalsHtml += createModalHtml(fileUrl, fileName, 'video');

                // Auto-check for portrait or landscape once thumbnail is loaded
                video.onloadedmetadata = function() {
                    const aspectRatio = video.videoWidth / video.videoHeight;
                    const columnSize = aspectRatio > 1 ? 'is-half' : 'is-one-quarter';
                    const sanitizedFileName = fileName.replace(/[^a-zA-Z0-9-_]/g, '-');
                    $(`#card-${sanitizedFileName}`).removeClass('is-one-quarter is-half').addClass(columnSize);
                };
            }
        }

        // Append modals to the body
        $('body').append(modalsHtml);

    } catch (error) {
        console.error("Error fetching contents:", error);
    }
}

// Helper function to create gallery item HTML with a thumbnail
function createGalleryItemHtml(thumbUrl, fileName, columnSize, mediaType, fullUrl) {
    const sanitizedFileName = fileName.replace(/[^a-zA-Z0-9-_]/g, '-');
    return `
        <div class="column ${columnSize}" id="card-${sanitizedFileName}">
            <div class="card" onclick="showModal('${sanitizedFileName}', '${fullUrl}', '${mediaType}')">
                <div class="card-image">
                    ${mediaType === 'image' ? `<img src="${thumbUrl}" alt="${fileName}" class="media">` : `<img src="${thumbUrl}" alt="${fileName}" class="media">`}
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

// Helper function to create modal HTML for full-size media with lazy loading and spinner
function createModalHtml(fileUrl, fileName, mediaType) {
    const sanitizedFileName = fileName.replace(/[^a-zA-Z0-9-_]/g, '-');
    return `
        <!-- Modal HTML for full-size media -->
        <div class="modal" id="modal-${sanitizedFileName}">
            <div class="modal-background"></div>
            <div class="modal-content">
                <div class="box">
                    <!-- Loading spinner -->
                    <div class="loading-spinner">
                        <div class="spinner"></div>
                    </div>
                    ${mediaType === 'image' ? `<img data-src="${fileUrl}" alt="${fileName}" class="lazyload">` : `<video data-src="${fileUrl}" controls class="lazyload"></video>`}
                </div>
            </div>
            <button class="modal-close is-large" aria-label="close" onclick="closeModal('${sanitizedFileName}')"></button>
        </div>
    `;
}

// Function to show modal with lazy loading
function showModal(fileName, fullUrl, mediaType) {
    const modalElement = $(`#modal-${fileName}`);
    modalElement.addClass('is-active');

    // Show loading spinner
    const spinnerElement = modalElement.find('.loading-spinner');
    spinnerElement.show();

    // Lazy load the full-size image or video
    const mediaElement = modalElement.find(mediaType === 'image' ? 'img.lazyload' : 'video.lazyload');

    // Set the src attribute to load the media
    mediaElement.attr('src', fullUrl);

    mediaElement.on('load loadeddata', function () {
        spinnerElement.hide(); // Hide the spinner when media is loaded
        mediaElement.removeClass('lazyload'); // Remove lazyload class after loading
    });
}

// Function to close modal
function closeModal(fileName) {
    $(`#modal-${fileName}`).removeClass('is-active');
}
