from django.template import Library
import datetime

register = Library()

@register.filter(expects_localtime=True)
def parse_iso_youtube(value):
    return datetime.datetime.strptime(value, "%Y-%m-%dT%H:%M:%SZ")