from django.db import models

# Create your models here.
class ClickCounter(models.Model):
    count = models.IntegerField(default=0)