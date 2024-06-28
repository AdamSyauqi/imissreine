function openTab(evt, tabName) {
    var i, x, tablinks;
    x = document.getElementsByClassName("content-tab");
    for (i = 0; i < x.length; i++) {
        x[i].style.display = "none";
    }
    tablinks = document.getElementsByClassName("tab");
    for (i = 0; i < x.length; i++) {
        tablinks[i].className = tablinks[i].className.replace(" is-active", "");
    }
    document.getElementById(tabName).style.display = "block";
    evt.currentTarget.className += " is-active";
  }

var mep_loud = document.getElementById("punch-sound-1");
mep_loud.volume = 0.7;

  function getCookie(name) {
    let cookieValue = null;
    if (document.cookie && document.cookie !== '') {
        const cookies = document.cookie.split(';');
        for (let i = 0; i < cookies.length; i++) {
            const cookie = cookies[i].trim();
            if (cookie.substring(0, name.length + 1) === (name + '=')) {
                cookieValue = decodeURIComponent(cookie.substring(name.length + 1));
                break;
            }
        }
    }
    return cookieValue;
}
const csrftoken = getCookie('csrftoken');

$(document).ready(function() {
    $('#click-button').click(function() {
        // Select a random audio element
        var sounds = ['punch-sound-1', 'punch-sound-2', 'punch-sound-3', 'punch-sound-4'];
        var randomSoundId = sounds[Math.floor(Math.random() * sounds.length)];
        var audioElement = document.getElementById(randomSoundId);
        audioElement.play();

        // Add animation class to the icon
        $('#punch-icon').addClass('punch-animation');

        // Remove animation class after animation ends
        setTimeout(function() {
            $('#punch-icon').removeClass('punch-animation');
        }, 300);

        $.ajax({
            url: incrementCounterUrl,  // Use the global variable for the URL
            type: "POST",
            headers: {'X-CSRFToken': csrftoken},
            data: {
                csrfmiddlewaretoken: csrftoken,  // Explicitly add CSRF token to data
            },
            success: function(data) {
                $('#counter').text(data.count);
            },
            error: function(xhr, errmsg, err) {
                console.log(xhr.status + ": " + xhr.responseText);
            }
        });
    });

    $(window).on('scroll', function() {
        var footerOffsetTop = $('footer').offset().top;
        var containerHeight = $('#tonjok-box').outerHeight();
        var scrollTop = $(window).scrollTop();
        var windowHeight = $(window).height();

        // Calculate the bottom offset of the floating container
        var containerBottom = scrollTop + windowHeight - containerHeight - 20; // 20px buffer

        if (containerBottom + containerHeight >= footerOffsetTop) {
            $('#tonjok-box').css({
                position: 'absolute',
                top: footerOffsetTop - containerHeight - 20 + 'px',
                bottom: 'auto'
            });
        } else {
            $('#tonjok-box').css({
                position: 'fixed',
                bottom: '20px',
                right: '20px',
                top: 'auto'
            });
        }
    });
    $('#toggle-button').click(function() {
        $('#main-content').toggle('fast', function() {
            // Update the icon based on visibility
            if ($('#main-content').is(':visible')) {
                $('#eye-icon').html('<i class="fas fa-eye"></i>');
                $('#toggle-tab').hide(); // Ensure the tab is completely hidden
            } else {
                $('#eye-icon').html('<i class="fas fa-eye-slash"></i>');
                $('#toggle-tab').show();
            }
        });
    });
});

function updateResult() {
    const month = document.getElementById('month-select').value;
    const day = document.getElementById('day-select').value;
    const language = document.getElementById('language-select').value;
    if (month && day) {
        const imageUrl = `/generate-image/?month=${encodeURIComponent(month)}&day=${encodeURIComponent(day)}&language=${encodeURIComponent(language)}&disposition=inline`;
        document.getElementById('reine-image').src = imageUrl;
        document.getElementById('image-url').value = imageUrl; // Store the image URL

        document.getElementById('twitter-image').setAttribute("content", imageUrl);
        document.getElementById('twitter-desc').setAttribute("content", "Check your Khodam with Reine!");
    } else {
        alert("Please select both month and day.");
    }
}

function checkSelection() {
    const monthSelect = document.getElementById('month-select').value;
    const daySelect = document.getElementById('day-select').value;
    const button = document.querySelector('.button'); // Make sure this is specific enough or use an ID.

    if (monthSelect && daySelect) {
        button.disabled = false; // Enable the button if both selections are made
    } else {
        button.disabled = true; // Disable the button if selections are incomplete
    }
}

// Call checkSelection on page load to set initial state
document.addEventListener('DOMContentLoaded', checkSelection);

function downloadImage() {
    const imageUrl = document.getElementById('image-url').value;
    if (imageUrl) {
        imageUrl = `/generate-image/?month=${encodeURIComponent(month)}&day=${encodeURIComponent(day)}&language=${encodeURIComponent(language)}&disposition=attachment`
        window.location.href = imageUrl;
    } else {
        alert("Please confirm your selection first.");
    }
}

function shareOnTwitter() {
    const imageUrl = document.getElementById('image-url').value;
    if (imageUrl) {
        const text = encodeURIComponent("This is my Khodam with Reine! Check out yours too!");
        const url = `https://twitter.com/intent/tweet?text=${text}&url=${encodeURIComponent(window.location.origin + imageUrl)}`;
        window.open(url, '_blank');
    } else {
        alert("Please confirm your selection first.");
    }
}