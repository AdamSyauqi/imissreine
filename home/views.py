from django.shortcuts import render
import requests
import json
import os

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
    url = "https://youtube.googleapis.com/youtube/v3/playlistItems?part=snippet%2CcontentDetails&maxResults=25&playlistId={}&key={}".format(ori_songs, key)
    r = requests.get(url)
    ori_songs_list = json.loads(r.text)

    # Cover Songs 50 Items
    url = "https://youtube.googleapis.com/youtube/v3/playlistItems?part=snippet%2CcontentDetails&maxResults=50&playlistId={}&key={}".format(cover_songs, key)
    r = requests.get(url)
    cover_songs_list = json.loads(r.text)

    # get reine channel info
    url = "https://holodex.net/api/v2/channels/{}".format(channel)
    header = {'X-APIKEY': X_APIKEY}
    r = requests.get(url, headers=header)
    res = json.loads(r.text)
    desc = res['description']
    desc_split = desc.split("【")

    # get reine videos
    url = "https://holodex.net/api/v2/channels/{}/videos".format(channel)
    header = {'X-APIKEY': X_APIKEY}
    r = requests.get(url, headers=header)
    videos_list = json.loads(r.text)

    # get reine collab videos
    url = "https://holodex.net/api/v2/channels/{}/collabs".format(channel)
    header = {'X-APIKEY': X_APIKEY}
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
        'past_collabs_counter': past_collabs_counter,
        'ori_songs_list': ori_songs_list,
        'cover_songs_list': cover_songs_list
    }

    return render(request, 'home/home.html', context)
