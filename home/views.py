from django.shortcuts import render
import requests
import json
import os
import time
from datetime import datetime, timedelta
from django.http import JsonResponse, HttpResponse
from .models import ClickCounter
from PIL import Image, ImageDraw, ImageFont
import io
# Create your views here.

def home(request):

    # Reine's channel id
    channel = 'UChgTyjG-pdNvxxhdsXfHQ5Q'

    # Reine's Original Song Playlist ID
    ori_songs = 'PLrALGrrF-6IWBHB3pdou530lFKrSsCtD4'

    # Reine's Cover Song Playlist ID
    cover_songs = 'PLrALGrrF-6IVnnurSv7Nxdxpo5zJmmjnC'

    # Youtube API Key
    key = os.environ['key']

    # Holodex API Key
    X_APIKEY = os.environ['X-APIKEY']

    # Original Songs 25 Items
    url = "https://youtube.googleapis.com/youtube/v3/playlistItems?part=contentDetails&part=snippet&maxResults=25&playlistId={}&key={}".format(ori_songs, key)
    try:
        r = requests.get(url, timeout=20)
        ori_songs_list = json.loads(r.text)
        save_info("ori_songs", ori_songs_list)
    except requests.exceptions.Timeout:
        ori_songs_list = get_saved_info("ori_songs")
    except requests.exceptions.RequestException:
        ori_songs_list = get_saved_info("ori_songs")

    # Cover Songs 50 Items
    url = "https://youtube.googleapis.com/youtube/v3/playlistItems?part=contentDetails&part=snippet&maxResults=50&playlistId={}&key={}".format(cover_songs, key)
    try:
        r = requests.get(url, timeout=20)
        cover_songs_list = json.loads(r.text)
        save_info("cover_songs", cover_songs_list)
    except requests.exceptions.Timeout:
        cover_songs_list = get_saved_info("cover_songs")
    except requests.exceptions.RequestException:
        cover_songs_list = get_saved_info("cover_songs")

    # get reine channel info
    start_time = time.time()
    url = "https://holodex.net/api/v2/channels/{}".format(channel)
    header = {'X-APIKEY': X_APIKEY}
    try:
        r = requests.get(url, headers=header, timeout=20)
        res = json.loads(r.text)
        save_info("channel", res) # saves data
        desc = res['description']
        desc_split = desc.split("【")
        print("Holodex Reine Channel Info")
    except requests.exceptions.Timeout:
        # timeout
        res = get_saved_info("channel")
        desc = res['description']
        desc_split = desc.split("【")
        print("Holodex Reine Channel Info")
    except requests.exceptions.RequestException:
        # other requests
        res = get_saved_info("channel")
        desc = res['description']
        desc_split = desc.split("【")
        print("Holodex Reine Channel Info")
    print("--- %s seconds ---" % (time.time() - start_time))

    # get reine videos
    start_time = time.time()
    url = "https://holodex.net/api/v2/channels/{}/videos".format(channel)
    header = {'X-APIKEY': X_APIKEY}
    try:
        r = requests.get(url, headers=header, timeout=20)
        videos_list = json.loads(r.text)
        save_info("videos", videos_list) # saves data
        print("Holodex Reine Channel Videos")
    except requests.exceptions.Timeout:
        videos_list = get_saved_info("videos")
        print("Holodex Reine Channel Videos")
    except requests.exceptions.RequestException:    
        videos_list = get_saved_info("videos")
        print("Holodex Reine Channel Videos")
    print("--- %s seconds ---" % (time.time() - start_time))

    start_time = time.time()
    # get reine collab videos
    url = "https://holodex.net/api/v2/channels/{}/collabs".format(channel)
    header = {'X-APIKEY': X_APIKEY}
    try:
        r = requests.get(url, headers=header, timeout=20)
        collabs_list = json.loads(r.text)
        save_info("collabs", collabs_list) # saves data
        print("Holodex Reine Channel Videos Collab")
    except requests.exceptions.Timeout:
        collabs_list = get_saved_info("collabs")
        print("Holodex Reine Channel Videos Collab")
    except requests.exceptions.RequestException:
        collabs_list = get_saved_info("collabs")
        print("Holodex Reine Channel Videos Collab")
    print("--- %s seconds ---" % (time.time() - start_time))

    # filter upcoming and live
    upcoming_list = []
    upcoming_counter = 0
    live_videos = []
    live_counter = 0
    for video in videos_list:
        if video['status'] == 'upcoming':
            upcoming_list.append(video)
            upcoming_counter += 1
        elif video['status'] == 'live':
            live_videos.append(video)
            live_counter += 1

    # past videos (5)
    past_videos = []
    counter = 0
    for video in videos_list:
        if counter == 5:
            break
        if video['status'] == 'past' and video['type'] == 'stream':
            past_videos.append(video)
            counter += 1

    # filter live and past collabs
    live_collabs_videos = []
    past_collabs_videos = []
    live_collabs_counter = 0
    past_collabs_counter = 0
    for video in collabs_list:
        if video['status'] == 'live' and video['type'] == 'stream':
            live_collabs_videos.append(video)
            live_collabs_counter += 1
        elif video['status'] == 'past' and video['type'] == 'stream' and past_collabs_counter < 6:
            past_collabs_videos.append(video)
            past_collabs_counter += 1

    try:
        # Get the click counter value
        counter, created = ClickCounter.objects.get_or_create(id=1)
    except Exception as e:
        print(f"Error retrieving or creating ClickCounter: {e}")
        counter = None
       
    context = {
        'res': res,
        'desc': desc_split[0],
        'upcoming_list': upcoming_list,
        'upcoming_counter': upcoming_counter,
        'past_videos': past_videos,
        'live_videos': live_videos,
        'live_counter': live_counter,
        'live_collabs_videos': live_collabs_videos,
        'live_collabs_counter': live_collabs_counter,
        'past_collabs_videos': past_collabs_videos,
        'past_collabs_counter': past_collabs_counter,
        'ori_songs_list': ori_songs_list,
        'cover_songs_list': cover_songs_list,
        'click_counter': counter.count
    }

    return render(request, 'home/home.html', context)

def increment_counter(request):
    try:
        if request.method == "POST":
            counter, created = ClickCounter.objects.get_or_create(id=1)
            counter.count += 1

            # Define the threshold for resetting the counter
            reset_threshold = 2**31 - 1  # For IntegerField (maximum value)

            # Check if the counter exceeds the threshold
            if counter.count > reset_threshold:
                counter.count = 0

            counter.save()
            return JsonResponse({'count': counter.count})
        else:
            counter = ClickCounter.objects.get_or_create(id=1)[0]
            return JsonResponse({'count': counter.count})
    except Exception as e:
        print(f"Error in increment_counter view: {e}")
        return JsonResponse({'error': str(e)}, status=500)

def save_info(data_type, data):
    text_file = str(data_type) + ".txt"
    now = datetime.now() # check current time
    try:
        with open(text_file, "r") as f:
            prev = f.readline()
            prev = prev.strip()
            prev_time = datetime.strptime(prev, "%Y-%m-%d %H:%M:%S.%f")
            time_diff = now - prev_time
            if time_diff > timedelta(minutes=10):
                with open(text_file, "w") as f:
                    print(f"saving {str(data_type)} data")
                    f.write(str(now) + "\n")
                    f.write(json.dumps(data))
    except FileNotFoundError:
        with open(text_file, "w") as f:
            print(f"saving {str(data_type)} data")
            f.write(str(now) + "\n")
            f.write(json.dumps(data))
    except Exception as e:
        print(f"Failed to save information: {e}")
    f.close()

def get_saved_info(data_type):
    text_file = str(data_type) + ".txt"
    if os.path.exists(text_file):
        with open(text_file, "r") as f:
            f.readline()
            data = f.read()
            return json.loads(data)

mon_dict = {
    "January": "Chicken Porrdige", 
    "February": "Beautiful Plate", 
    "March": "Pandan Leaf", 
    "April": "Palm Sugar", 
    "May": "Kerupuk Putih", 
    "June": "Coconut Rice Porridge", 
    "July": "Dory Fish", 
    "August": "Peanuts", 
    "September": "Shredded Chicken", 
    "October": "Sweet Potato Cookies", 
    "November": "Salmon Fried Rice", 
    "December": "Shrimp Paste Sambal"
}

day_dict = {
    "Monday": "Swimming", 
    "Tuesday": "Flying", 
    "Wednesday": "Sommersaulting", 
    "Thursday": "Pilates", 
    "Friday": "Leaping", 
    "Saturday": "Breakdancing", 
    "Sunday": "Floating"
}

def wrap_text(text, font, max_width):
    """
    Wrap the text to fit within the specified width.
    """
    lines = []
    words = text.split(' ')
    current_line = ''
    
    for word in words:
        if font.getsize(word)[0] > max_width:
            if current_line:
                lines.append(current_line)
                current_line = ''
            part = ''
            for char in word:
                test_part = part + char
                if font.getsize(test_part)[0] > max_width:
                    if part:
                        lines.append(part + '-')
                    part = char
                else:
                    part = test_part
            current_line = part
        else:
            test_line = f"{current_line} {word}" if current_line else word
            if font.getsize(test_line)[0] > max_width:
                lines.append(current_line)
                current_line = word
            else:
                current_line = test_line

    if current_line:
        lines.append(current_line)
    return lines

def generate_image(request):
    # Get the month and day from the request
    month = request.GET.get('month', '')
    day = request.GET.get('day', '')
    
    # Load an image
    base_dir = os.path.dirname(__file__)
    staticfiles = os.path.join(base_dir, "../staticfiles/home")
    img_path = os.path.join(staticfiles, "./img/reineboard.png")
    img = Image.open(img_path)
       
    # Define the text and the font
    month = mon_dict[month] # Already made dictionary
    day = day_dict[day] # Already made dictionary
    text = f"{month} {day}"
    font_path = os.path.join(staticfiles, "./font/ShareTech-Regular.ttf")
    font = ImageFont.truetype(font_path, 50)  # Adjust font size as needed
    font_size = 50

    start_x, start_y = 100, 300
    end_x, end_y = 285, 450
    max_width = end_x - start_x  # Calculate max width from given coordinates
    wrapped_text = None

    # Adjust font size until text fits within the vertical boundary
    while True:
        font = ImageFont.truetype(font_path, font_size)
        wrapped_text = wrap_text(text, font, max_width)
        total_height = sum(font.getsize(line)[1] for line in wrapped_text)
        if start_y + total_height > end_y and font_size > 10:
            font_size -= 1  # Decrease font size by 1
        else:
            break
    
    y = start_y
    draw = ImageDraw.Draw(img)
    for line in wrapped_text:
        x = start_x  # Text starts at the horizontal position of 100
        draw.text((x, y), line, font=font, fill=(26, 117, 255))
        y += font.getsize(line)[1]  # Increment y for each new line using getsize()

    # Save the image to a bytes buffer
    img_byte_arr = io.BytesIO()
    img.save(img_byte_arr, format='PNG')
    img_byte_arr = img_byte_arr.getvalue()

    # Return image as a HTTP response
    return HttpResponse(img_byte_arr, content_type='image/png')