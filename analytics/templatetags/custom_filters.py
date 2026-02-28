from django import template

register = template.Library()

@register.filter
def subtract(value, arg):
    return value - arg

@register.filter
def as_percent(value):
    """Converte valor decimal (0-1) para porcentagem com 2 casas. Ex: 0.75 → 75.00"""
    try:
        value = float(value)
        if 0.0 < value <= 1.0:
            return f"{value * 100:.2f}"
        return f"{value:.2f}"
    except (TypeError, ValueError):
        return "0.00"

@register.filter
def as_point_decimal(value):
    """Converte valor decimal (0-1) para decimal com 2 casas. Ex: 0,75 → 0.75"""
    try:
        return f"{float(value):.2f}".replace(',', '.')
    except (TypeError, ValueError):
        return "0.00"

@register.filter
def as_lower_capitalise_case(value):
    """Converte valor para lower case. Ex: "Home Win" → "home win"""
    try:
        return value.lower().replace("_", " ").capitalize()
    except (TypeError, ValueError):
        return ""