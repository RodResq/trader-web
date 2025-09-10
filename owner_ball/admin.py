from django.contrib import admin
from django.utils.formats import date_format
from django.urls import reverse
from django.utils.html import format_html
from owner_ball.models import CycleOwnerBall, CycleManagerOwnerBall

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
    
    
@admin.register(CycleManagerOwnerBall)
class ListingCycleManagerOwnerBall(admin.ModelAdmin):
    
    @admin.display(description="Id Ciclo Owner Ball")
    def link_para_cycle_ob(self, obj):
        if obj:
            url = reverse(
                f'admin:{obj._meta.app_label}_{obj._meta.model_name}_change',
                args=[obj.id]
            )
            
            return format_html('<a href="{}">{}</a>', url, obj.id)
        return "-"
    
    list_display = ('id', 'total_entries_number', 'total_entries_value', 'total_return_value', 'link_para_cycle_ob',)