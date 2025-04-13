from django import template
from django.utils import timezone

register = template.Library()

@register.filter(name='to_utc')
def to_utc(value):
    if value is None:
        return ""
    return timezone.localtime(value, timezone=timezone.utc)