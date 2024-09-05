$(document).ready(function () {
    const spaceUrl = document.getElementById('digital_ocean_url').value;
    
    // Load JSON data and then fetch and display contents
    loadJsonData('/static/home/json/Reine_MepTember_2024_With_Fanart.json').then(jsonData => {
        fetchAndDisplayContents(spaceUrl, jsonData);
    }).catch(error => {
        console.error('Error loading JSON data:', error);
    });
});

async function loadJsonData(jsonPath) {
    try {
        const response = await fetch(jsonPath);
        if (!response.ok) {
            throw new Error(`Failed to fetch JSON data: ${response.status}`);
        }
        const jsonData = await response.json();
        return jsonData;
    } catch (error) {
        console.error('Error fetching JSON file:', error);
        throw error;
    }
}

// Function to fetch and display contents of the DigitalOcean Space
async function fetchAndDisplayContents(spaceUrl, birthdayMessages, folder = '') {
    try {
        const response = await fetch(`${spaceUrl}?prefix=${folder}`);

        if (!response.ok) {
            throw new Error(`Failed to fetch the contents: ${response.status}`);
        }

        const text = await response.text();
        const parser = new DOMParser();
        const xmlDoc = parser.parseFromString(text, "text/xml");

        const contents = xmlDoc.getElementsByTagName("Contents");

        $('#cosplay_container').html('');
        $('#fanart_container').html('');
        let modalsHtml = '';

        for (let content of contents) {
            const fileName = content.getElementsByTagName("Key")[0].textContent;

            if (fileName.includes('_thumb')) continue;

            const fileUrl = `${spaceUrl}/${fileName}`;
            let thumbUrl;

            if (/\.(mp4|webm|ogg)$/i.test(fileName)) {
                thumbUrl = `${spaceUrl}/${fileName.replace(/\.(mp4|webm|ogg)$/i, '_thumb.jpg')}`;
            } else {
                thumbUrl = `${spaceUrl}/${fileName.replace(/\.(jpg|jpeg|png|gif|webp)$/i, '_thumb.$1')}`;
            }

            const container = fileName.startsWith('cosplay/') ? '#cosplay_container' : '#fanart_container';
            const sanitizedFileName = fileName.replace(/[^a-zA-Z0-9-_]/g, '-');

            // Extract submitter name from the file name
            const submitterName = fileName.split('/')[1].split('.')[0]; // Extract name without prefix and extension
            const birthdayData = findBirthdayData(submitterName, birthdayMessages);

            if (/\.(jpg|jpeg|png|gif|webp)$/i.test(fileName)) {
                const img = new Image();
                img.src = thumbUrl;
                const cardHtml = createGalleryItemHtml(thumbUrl, fileName, 'is-one-quarter', 'image', fileUrl, birthdayData);
                $(container).append(cardHtml);

                modalsHtml += createModalHtml(fileUrl, fileName, 'image', birthdayData);

                img.onload = function() {
                    const aspectRatio = img.width / img.height;
                    const columnSize = aspectRatio > 1 ? 'is-half' : 'is-one-quarter';
                    $(`#card-${sanitizedFileName}`).removeClass('is-one-quarter').addClass('is-one-quarter');
                };
            } else if (/\.(mp4|webm|ogg)$/i.test(fileName)) {
                const video = document.createElement('video');
                video.src = fileUrl;
                const cardHtml = createGalleryItemHtml(thumbUrl, fileName, 'is-one-quarter', 'video', fileUrl, birthdayData);
                $(container).append(cardHtml);

                modalsHtml += createModalHtml(fileUrl, fileName, 'video', birthdayData);

                video.onloadedmetadata = function() {
                    const aspectRatio = video.videoWidth / video.videoHeight;
                    const columnSize = aspectRatio > 1 ? 'is-half' : 'is-one-quarter';
                    $(`#card-${sanitizedFileName}`).removeClass('is-one-quarter is-half').addClass('is-one-quarter');
                };
            }
        }

        $('body').append(modalsHtml);

    } catch (error) {
        console.error("Error fetching contents:", error);
    }
}

// Helper function to find the corresponding birthday data
function findBirthdayData(submitterName, birthdayMessages) {
    if(submitterName.startsWith("Cosplay_")) {
        submitterName = submitterName.split("_")[1]
    }

    if(submitterName.startsWith("Artblocks")) {
        submitterName = "Artblock's"
    }

    if(submitterName.startsWith("DarthPika")) {
        submitterName = "DarthPika26"
    }

    if(submitterName.startsWith("Kaiカイ")) {
        submitterName = "Kai/カイ"
    }
    return birthdayMessages.find(entry => entry.name === submitterName) || {};
}

// Helper function to create gallery item HTML with a thumbnail
function createGalleryItemHtml(thumbUrl, fileName, columnSize, mediaType, fullUrl, birthdayData) {
    const sanitizedFileName = fileName.replace(/[^a-zA-Z0-9-_]/g, '-');
    const { name = 'Anonymous', message = '', contactLink = '' } = birthdayData;

    // Determine the Font Awesome icon to display based on media type
    const iconClass = mediaType === 'image' ? 'fa-image' : 'fa-video';

    return `
        <div class="column ${columnSize}" id="card-${sanitizedFileName}">
            <div class="card" onclick="showModal('${sanitizedFileName}', '${fullUrl}', '${mediaType}')">
                <div class="card-image">
                    ${mediaType === 'image' ? `<img src="${thumbUrl}" alt="${fileName}" class="media" oncontextmenu="return false;" ondragstart="return false;">` : `<img src="${thumbUrl}" alt="${fileName}" class="media" oncontextmenu="return false;" ondragstart="return false;">`}
                    <div class="media-logo-overlay">
                        <i class="fas ${iconClass} media-icon"></i> <!-- Font Awesome icon -->
                    </div>
                </div>
                <div class="card-content">
                    <div class="media-content">
                        <p class="title is-4">${name}</p>
                    </div>
                </div>
            </div>
        </div>
    `;
}

// Helper function to create modal HTML for full-size media with lazy loading and spinner
function createModalHtml(fileUrl, fileName, mediaType, birthdayData) {
    const sanitizedFileName = fileName.replace(/[^a-zA-Z0-9-_]/g, '-');
    const { name = 'Anonymous', message = '', contactLink = '' } = birthdayData;

    // Generate social media links
    let socialMediaHtml = '';
    if (contactLink.startsWith('Manual')) {
        socialMediaHtml = `<p>Contact: ${contactLink}</p>`;
    } else {
        const links = contactLink.split('|');
        links.forEach(link => {
            if (link.includes('Discord:')) {
                const discordId = link.split(':')[1].trim();
                socialMediaHtml += `
                    <span class="icon discord-icon-wrapper" data-discord-id="${discordId}">
                        <a href="#" onclick="event.preventDefault();">
                            <i class="fab fa-discord" id="social_media_links"></i>
                        </a>
                        <div class="discord-tooltip">${discordId}</div>
                    </span>`;
            } else if (link.includes('https://linktr.ee')) {
                socialMediaHtml += `
                    <span class="icon">
                        <a href="${link}" target="_blank">
                            <i class="fas fa-${getSocialMediaIcon(link)}" id="social_media_links"></i>
                        </a>
                    </span>`;
            } else {
                socialMediaHtml += `
                    <span class="icon">
                        <a href="${link}" target="_blank">
                            <i class="fab fa-${getSocialMediaIcon(link)}" id="social_media_links"></i>
                        </a>
                    </span>`;
            }
        });
    }

    return `
        <!-- Modal HTML for full-size media -->
        <div class="modal" id="modal-${sanitizedFileName}">
            <div class="modal-background" onclick="closeModal('${sanitizedFileName}')"></div>
            <div class="modal-content">
                <!-- Loading spinner -->
                <div class="loading-spinner">
                    <div class="spinner"></div>
                </div>
                <div class="submission_container">
                    ${mediaType === 'image' ? `<img data-src="${fileUrl}" alt="${fileName}" class="lazyload" oncontextmenu="return false;" ondragstart="return false;">` : `<video data-src="${fileUrl}" controls controlsList="nodownload" oncontextmenu="return false;" class="lazyload" ondragstart="return false;"></video>`}
                </div>
                <div class="box" id="submission_box">
                    <div class="content" id="submission_message">
                        <h3 class="submission_name">${name}</h3>
                        <hr class="submission_divider">
                        <p class="submission_message_content">${message}</p>
                        <div class="social_media_links">${socialMediaHtml}</div>
                    </div>
                </div>
            </div>
            <button class="modal-close is-large" aria-label="close" onclick="closeModal('${sanitizedFileName}')"></button>
        </div>
    `;
}

// Function to determine social media icon based on link
function getSocialMediaIcon(link) {
    if (link.includes('youtube.com')) return 'youtube';
    if (link.includes('twitter.com') || link.includes('x.com')) return 'twitter';
    if (link.includes('instagram.com')) return 'instagram';
    if (link.includes('facebook.com')) return 'facebook';
    if (link.includes('linktr.ee')) return 'link';
    return 'link';
}

// Function to show modal with lazy loading
function showModal(fileName, fullUrl, mediaType) {
    const modalElement = $(`#modal-${fileName}`);
    modalElement.addClass('is-active');

    const spinnerElement = modalElement.find('.loading-spinner');
    spinnerElement.show();

    const mediaElement = modalElement.find(mediaType === 'image' ? 'img.lazyload' : 'video.lazyload');

    mediaElement.attr('src', fullUrl);

    mediaElement.on('load loadeddata', function () {
        spinnerElement.hide(); 
        mediaElement.removeClass('lazyload'); 
    });
}

// Function to close modal
function closeModal(fileName) {
    const modalElement = $(`#modal-${fileName}`);
    modalElement.removeClass('is-active');

    // Pause video if it exists in the modal
    const videoElement = modalElement.find('video')[0]; // Get the first video element inside the modal
    if (videoElement) {
        videoElement.pause(); // Pause the video
        videoElement.currentTime = 0; // Optional: Reset video to start
    }
}
