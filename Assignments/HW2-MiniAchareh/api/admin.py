from django.contrib import admin
from django.contrib.auth.admin import UserAdmin
from .models import User, Advertisement, Bid, Comment, Ticket

@admin.register(User)
class CustomUserAdmin(UserAdmin):
    list_display = ('username', 'email', 'phone_number', 'role', 'is_staff')
    list_filter = ('role', 'is_staff', 'is_superuser', 'is_active')
    fieldsets = UserAdmin.fieldsets + (
        (None, {'fields': ('role', 'phone_number')}),
    )
    add_fieldsets = UserAdmin.add_fieldsets + (
        (None, {'fields': ('role', 'phone_number', 'email')}),
    )
    search_fields = ('username', 'email', 'phone_number')

@admin.register(Advertisement)
class AdvertisementAdmin(admin.ModelAdmin):
    list_display = ('title', 'owner', 'status', 'assigned_contractor', 'created_at')
    list_filter = ('status', 'created_at')
    search_fields = ('title', 'description', 'owner__username')
    raw_id_fields = ('owner', 'assigned_contractor')

@admin.register(Bid)
class BidAdmin(admin.ModelAdmin):
    list_display = ('contractor', 'advertisement', 'created_at')
    list_filter = ('created_at',)
    search_fields = ('contractor__username', 'advertisement__title')

@admin.register(Comment)
class CommentAdmin(admin.ModelAdmin):
    list_display = ('author', 'contractor', 'advertisement', 'score', 'created_at')
    list_filter = ('score', 'created_at')
    search_fields = ('author__username', 'contractor__username', 'text')

@admin.register(Ticket)
class TicketAdmin(admin.ModelAdmin):
    list_display = ('title', 'author', 'status', 'created_at', 'updated_at')
    list_filter = ('status', 'created_at', 'updated_at')
    search_fields = ('title', 'message', 'response', 'author__username')
    readonly_fields = ('created_at', 'updated_at')

