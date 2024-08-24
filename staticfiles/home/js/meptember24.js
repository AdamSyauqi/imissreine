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
      const commonPrefixes = xmlDoc.getElementsByTagName("CommonPrefixes");
  
      // Clear any existing content
      const container = document.getElementById("file-list");
      container.innerHTML = '';
  
      // List all folders (CommonPrefixes)
      for (let prefix of commonPrefixes) {
        const folderName = prefix.getElementsByTagName("Prefix")[0].textContent;
        const folderLink = document.createElement("a");
        folderLink.href = "#";
        folderLink.textContent = `Folder: ${folderName}`;
        folderLink.onclick = () => fetchAndDisplayContents(spaceUrl, folderName);
        container.appendChild(folderLink);
        container.appendChild(document.createElement("br"));
      }
  
      // List all files (Contents)
      for (let content of contents) {
        const fileName = content.getElementsByTagName("Key")[0].textContent;
        const fileUrl = `${spaceUrl}/${fileName}`;
  
        // Determine the file type by extension
        if (/\.(jpg|jpeg|png|gif|webp)$/i.test(fileName)) {
          // If file is an image
          const imgElement = document.createElement("img");
          imgElement.src = fileUrl;
          imgElement.alt = fileName;
          imgElement.style.width = "200px";  // Set a default width or customize as needed
          imgElement.style.margin = "10px";
          container.appendChild(imgElement);
        } else if (/\.(mp4|webm|ogg)$/i.test(fileName)) {
          // If file is a video
          const videoElement = document.createElement("video");
          videoElement.src = fileUrl;
          videoElement.controls = true;
          videoElement.style.width = "200px";  // Set a default width or customize as needed
          videoElement.style.margin = "10px";
          container.appendChild(videoElement);
        } else {
          // For unsupported files, display as a link
          const fileLink = document.createElement("a");
          fileLink.href = fileUrl;
          fileLink.textContent = `File: ${fileName}`;
          fileLink.target = "_blank"; // Open in a new tab
          container.appendChild(fileLink);
        }
  
        container.appendChild(document.createElement("br")); // Add line break after each item
      }
    } catch (error) {
      console.error("Error fetching contents:", error);
    }
  }
  
  // Initialize the function on page load or button click
  document.addEventListener("DOMContentLoaded", function() {
    const spaceUrl = "https://reinemeptember.sgp1.digitaloceanspaces.com"; // Your Space URL
    fetchAndDisplayContents(spaceUrl);
  });
  