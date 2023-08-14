from django.shortcuts import render, redirect
import requests
import json
# Create your views here.

def home(request):

    # get reine channel info
    url = "https://holodex.net/api/v2/channels/UChgTyjG-pdNvxxhdsXfHQ5Q"
    header = {'X-APIKEY': '10ed9af7-1787-40b2-865b-4766227522d1'}
    r = requests.get(url, headers=header)
    res = json.loads(r.text)
    context = {
        'res': res
    }

    return render(request, 'home/home.html', context)
