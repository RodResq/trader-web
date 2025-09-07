from django.contrib import admin
from django.utils.formats import date_format
from owner_ball.models import CycleOwnerBall

@admin.register(CycleOwnerBall)
class ListingCycleOwnerBall(admin.ModelAdmin):
    
    @admin.display(description="start_date")
    def start_date_formated(self, obj):
        if obj.start_date:
            return date_format(obj.start_date, format='d/m/Y')
        return '-'
    
    @admin.display(description="end_date")
    def end_date_formated(self, obj):
        if obj.end_date:
            return date_format(obj.end_date, format='d/m/Y')
        return '-'
    
    list_display = ("category", "current_balance", "available_value", "start_date", "end_date")