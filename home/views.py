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

    # get reine videos
    url = "https://holodex.net/api/v2/channels/UChgTyjG-pdNvxxhdsXfHQ5Q/videos"
    header = {'X-APIKEY': os.environ['X-APIKEY']}
    r = requests.get(url, headers=header)
    videos_list = json.loads(r.text)

    # get reine collab videos
    url = "https://holodex.net/api/v2/channels/UChgTyjG-pdNvxxhdsXfHQ5Q/collabs"
    header = {'X-APIKEY': os.environ['X-APIKEY']}
    r = requests.get(url, headers=header)
    collabs_list = json.loads(r.text)

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
        'past_collabs_counter': past_collabs_counter
    }

    return render(request, 'home/home.html', context)
