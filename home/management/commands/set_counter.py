from django.core.management.base import BaseCommand
from home.models import ClickCounter  # Adjust if your model is in a different app

class Command(BaseCommand):
    help = "Sets the ClickCounter to a specified value"

    def add_arguments(self, parser):
        parser.add_argument('count', type=int, help='The count value to set.')

    def handle(self, *args, **options):
        count = options['count']
        counter, created = ClickCounter.objects.get_or_create(id=1)
        counter.count = count
        counter.save()
        self.stdout.write(self.style.SUCCESS(
            f"Counter set to {counter.count} (created={created})"
        ))
