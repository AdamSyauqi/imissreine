from django.shortcuts import render
import requests
import json
import os

# Create your views here.

def home(request):

    # get reine channel info
    url = "https://holodex.net/api/v2/channels/UChgTyjG-pdNvxxhdsXfHQ5Q"
    header = {'X-APIKEY': os.environ['X-APIKEY']}
    r = requests.get(url, headers=header)
    res = json.loads(r.text)
    desc = res['description']
    desc_split = desc.split("【")

    # # get reine videos
    url = "https://holodex.net/api/v2/channels/UChgTyjG-pdNvxxhdsXfHQ5Q/videos"
    header = {'X-APIKEY': '10ed9af7-1787-40b2-865b-4766227522d1'}
    r = requests.get(url, headers=header)
    videos_list = json.loads(r.text)

    # # filter upcoming
    upcoming_list = []
    upcoming_counter = 0
    for video in videos_list:
        if video['status'] == 'upcoming':
            upcoming_list.append(video)
            upcoming_counter += 1

    live_videos = []
    live_counter = 0
    for video in videos_list:
        if video['status'] == 'live':
            live_videos.append(video)
            live_counter += 1

    # # past videos (10)
    past_videos = []
    counter = 0
    for video in videos_list:
        if counter == 4:
            break
        if video['status'] == 'past' and video['type'] == 'stream':
            past_videos.append(video)
            counter += 1
       
    context = {
        'res': res,
        'desc': desc_split[0],
        'upcoming_list': upcoming_list,
        'upcoming_counter': upcoming_counter,
        'past_videos': past_videos,
        'live_videos': live_videos,
        'live_counter': live_counter
    }

    return render(request, 'home/home.html', context)
