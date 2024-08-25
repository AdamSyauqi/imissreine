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
      let gallery_container_elements = '<div class="grid">';

      // List all files (Contents)
      for (let content of contents) {
          const fileName = content.getElementsByTagName("Key")[0].textContent;
          const fileUrl = `${spaceUrl}/${fileName}`;

          // Determine the file type by extension
          if (/\.(jpg|jpeg|png|gif|webp)$/i.test(fileName)) {
              gallery_container_elements += `
                  <div class="cell">
                      <img src="${fileUrl}" alt="${fileName}">
                  </div>
              `;
          } else if (/\.(mp4|webm|ogg)$/i.test(fileName)) {
              gallery_container_elements += `
                  <div class="cell">
                      <video src="${fileUrl}" controls></video>
                  </div>
              `;
          }
      }
      gallery_container_elements += '</div>'
      // Append the generated HTML to the gallery container
      $('#gallery_container').html(gallery_container_elements);

  } catch (error) {
      console.error("Error fetching contents:", error);
  }
}