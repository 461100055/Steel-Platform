from django.contrib import admin
from django.contrib.admin.sites import NotRegistered
from django.contrib.auth import get_user_model
from django.contrib.auth.admin import UserAdmin as BaseUserAdmin
from django.contrib.auth.models import Group

from .models import UserProfile, SupplierProfile, Product, Order, OrderItem, RFQ, Conversation, Message

User = get_user_model()


def get_related_profile(user):
    if hasattr(user, 'profile') and user.profile:
        return user.profile
    if hasattr(user, 'userprofile') and user.userprofile:
        return user.userprofile
    return None


class CustomAdminMixin:
    class Media:
        css = {
            'all': ('admin/custom_admin.css',)
        }


class UserRoleFilter(admin.SimpleListFilter):
    title = 'Role'
    parameter_name = 'profile_role'

    def lookups(self, request, model_admin):
        return (
            ('buyer_individual', 'Buyer Individual'),
            ('buyer_company', 'Buyer Company'),
            ('buyer_establishment', 'Buyer Establishment'),
            ('supplier', 'Supplier'),
            ('admin', 'Admin'),
        )

    def queryset(self, request, queryset):
        value = self.value()
        if not value:
            return queryset
        return queryset.filter(profile__role=value)


class UserStatusFilter(admin.SimpleListFilter):
    title = 'Profile Status'
    parameter_name = 'profile_status'

    def lookups(self, request, model_admin):
        return (
            ('active', 'Active'),
            ('inactive', 'Inactive'),
            ('approved', 'Approved'),
            ('rejected', 'Rejected'),
            ('pending', 'Pending'),
        )

    def queryset(self, request, queryset):
        value = self.value()
        if not value:
            return queryset
        return queryset.filter(profile__status=value)


try:
    admin.site.unregister(User)
except NotRegistered:
    pass

try:
    admin.site.unregister(Group)
except NotRegistered:
    pass


@admin.register(User)
class CustomUserAdmin(CustomAdminMixin, BaseUserAdmin):
    list_display = (
        'username',
        'email',
        'role_display',
        'status_display',
        'company_display',
        'city_display',
        'is_active',
        'date_joined',
    )
    list_display_links = ('username', 'email')
    list_filter = (
        UserRoleFilter,
        UserStatusFilter,
        'is_active',
        'is_staff',
        'is_superuser',
        'date_joined',
    )
    search_fields = (
        'username',
        'email',
        'first_name',
        'last_name',
    )
    ordering = ('-date_joined',)
    list_per_page = 20
    empty_value_display = '-'

    fieldsets = (
        ('Account Information', {
            'fields': ('username', 'password')
        }),
        ('Personal Information', {
            'fields': ('first_name', 'last_name', 'email')
        }),
        ('Permissions', {
            'fields': (
                'is_active',
                'is_staff',
                'is_superuser',
                'groups',
                'user_permissions',
            )
        }),
        ('Important Dates', {
            'fields': ('last_login', 'date_joined')
        }),
        ('Profile Overview', {
            'fields': (
                'profile_role_preview',
                'profile_status_preview',
                'profile_company_preview',
                'profile_city_preview',
                'profile_phone_preview',
            )
        }),
    )

    readonly_fields = (
        'last_login',
        'date_joined',
        'profile_role_preview',
        'profile_status_preview',
        'profile_company_preview',
        'profile_city_preview',
        'profile_phone_preview',
    )

    def role_display(self, obj):
        profile = get_related_profile(obj)
        if not profile or not getattr(profile, 'role', None):
            return '-'

        role_map = {
            'buyer': 'Buyer',
            'buyer_individual': 'B-Individual',
            'buyer_company': 'B-Company',
            'buyer_establishment': 'B-Commercial Establishment',
            'supplier': 'Supplier',
            'admin': 'Admin',
            'commercial': 'Buyer Company',
            'individual': 'Buyer Individual',
        }
        return role_map.get(profile.role, str(profile.role).replace('_', ' ').title())
    role_display.short_description = 'Role'

    def status_display(self, obj):
        profile = get_related_profile(obj)
        if not profile or not getattr(profile, 'status', None):
            return '-'
        return str(profile.status).title()
    status_display.short_description = 'Status'

    def company_display(self, obj):
        profile = get_related_profile(obj)
        if not profile:
            return '-'
        return profile.company if getattr(profile, 'company', None) else '-'
    company_display.short_description = 'Company'

    def city_display(self, obj):
        profile = get_related_profile(obj)
        if not profile:
            return '-'
        return profile.city if getattr(profile, 'city', None) else '-'
    city_display.short_description = 'City'

    def profile_role_preview(self, obj):
        return self.role_display(obj)
    profile_role_preview.short_description = 'Profile Role'

    def profile_status_preview(self, obj):
        return self.status_display(obj)
    profile_status_preview.short_description = 'Profile Status'

    def profile_company_preview(self, obj):
        return self.company_display(obj)
    profile_company_preview.short_description = 'Company'

    def profile_city_preview(self, obj):
        return self.city_display(obj)
    profile_city_preview.short_description = 'City'

    def profile_phone_preview(self, obj):
        profile = get_related_profile(obj)
        if not profile:
            return '-'
        return profile.phone if getattr(profile, 'phone', None) else '-'
    profile_phone_preview.short_description = 'Phone'


@admin.register(UserProfile)
class UserProfileAdmin(CustomAdminMixin, admin.ModelAdmin):
    list_display = (
        'user_username',
        'user_email',
        'role_display',
        'phone',
        'city',
        'company_display',
        'status_display',
        'joined_date',
    )
    list_display_links = ('user_username', 'user_email')
    list_filter = (
        'role',
        'status',
        'city',
        'joined_date',
    )
    search_fields = (
        'user__username',
        'user__email',
        'phone',
        'city',
        'company',
    )
    ordering = ('-joined_date',)
    list_per_page = 20
    autocomplete_fields = ('user',)
    readonly_fields = ('joined_date',)
    empty_value_display = '-'

    fieldsets = (
        ('Account Information', {
            'fields': ('user', 'role')
        }),
        ('Profile Details', {
            'fields': ('phone', 'city', 'company', 'status')
        }),
        ('System Information', {
            'fields': ('joined_date',)
        }),
    )

    def user_username(self, obj):
        return obj.user.username if obj.user else '-'
    user_username.short_description = 'Username'
    user_username.admin_order_field = 'user__username'

    def user_email(self, obj):
        return obj.user.email if obj.user else '-'
    user_email.short_description = 'Email'
    user_email.admin_order_field = 'user__email'

    def role_display(self, obj):
        role_map = {
            'buyer': 'Buyer',
            'buyer_individual': 'B-Individual',
            'buyer_company': 'B-Company',
            'buyer_establishment': 'B-Commercial Establishment',
            'supplier': 'Supplier',
            'admin': 'Admin',
            'commercial': 'Buyer Company',
            'individual': 'Buyer Individual',
        }
        return role_map.get(obj.role, str(obj.role).replace('_', ' ').title())
    role_display.short_description = 'Role'
    role_display.admin_order_field = 'role'

    def company_display(self, obj):
        return obj.company if obj.company else '-'
    company_display.short_description = 'Company'
    company_display.admin_order_field = 'company'

    def status_display(self, obj):
        return str(obj.status).title() if obj.status else '-'
    status_display.short_description = 'Status'
    status_display.admin_order_field = 'status'


@admin.register(SupplierProfile)
class SupplierProfileAdmin(CustomAdminMixin, admin.ModelAdmin):
    list_display = (
        'user',
        'company_name',
        'rating',
        'total_orders',
    )
    list_display_links = ('user',)
    search_fields = (
        'user__username',
        'user__email',
    )
    ordering = ('-total_orders',)
    list_per_page = 20
    empty_value_display = '-'

    def company_name(self, obj):
        profile = get_related_profile(obj.user)
        if profile and getattr(profile, 'company', None):
            return profile.company
        return '-'
    company_name.short_description = 'Company'


@admin.register(Product)
class ProductAdmin(CustomAdminMixin, admin.ModelAdmin):
    list_display = (
        'name',
        'supplier_name',
        'category_display',
        'price',
        'inventory',
        'stock_status',
        'status',
        'created_at',
    )
    list_display_links = ('name',)
    list_filter = (
        'category',
        'stock_status',
        'status',
        'created_at',
    )
    search_fields = (
        'name',
        'category',
        'supplier__username',
        'supplier__email',
    )
    ordering = ('-created_at',)
    list_per_page = 20
    empty_value_display = '-'

    def supplier_name(self, obj):
        return obj.supplier.username if obj.supplier else '-'
    supplier_name.short_description = 'Supplier'
    supplier_name.admin_order_field = 'supplier__username'

    def category_display(self, obj):
        return obj.category if obj.category else 'Uncategorized'
    category_display.short_description = 'Category'
    category_display.admin_order_field = 'category'


class OrderItemInline(admin.TabularInline):
    model = OrderItem
    extra = 0


@admin.register(Order)
class OrderAdmin(CustomAdminMixin, admin.ModelAdmin):
    list_display = (
        'id',
        'buyer_name',
        'total_price',
        'status',
        'created_at',
    )
    list_display_links = ('id', 'buyer_name')
    list_filter = (
        'status',
        'created_at',
    )
    search_fields = (
        'buyer__username',
        'buyer__email',
    )
    ordering = ('-created_at',)
    list_per_page = 20
    inlines = [OrderItemInline]
    empty_value_display = '-'

    def buyer_name(self, obj):
        return obj.buyer.username if obj.buyer else '-'
    buyer_name.short_description = 'Buyer'
    buyer_name.admin_order_field = 'buyer__username'


@admin.register(RFQ)
class RFQAdmin(CustomAdminMixin, admin.ModelAdmin):
    list_display = (
        'id',
        'product_name',
        'buyer_name',
        'supplier_name',
        'quantity',
        'target_price',
        'status',
        'created_at',
    )
    list_display_links = ('id', 'product_name')
    list_filter = (
        'status',
        'created_at',
    )
    search_fields = (
        'product_name',
        'buyer__username',
        'buyer__email',
        'supplier__username',
        'supplier__email',
    )
    ordering = ('-created_at',)
    list_per_page = 20
    empty_value_display = '-'

    def buyer_name(self, obj):
        return obj.buyer.username if obj.buyer else '-'
    buyer_name.short_description = 'Buyer'
    buyer_name.admin_order_field = 'buyer__username'

    def supplier_name(self, obj):
        return obj.supplier.username if obj.supplier else '-'
    supplier_name.short_description = 'Supplier'
    supplier_name.admin_order_field = 'supplier__username'


@admin.register(Conversation)
class ConversationAdmin(CustomAdminMixin, admin.ModelAdmin):
    list_display = (
        'id',
        'buyer',
        'supplier',
    )
    list_display_links = ('id',)
    search_fields = (
        'buyer__username',
        'buyer__email',
        'supplier__username',
        'supplier__email',
    )
    ordering = ('-id',)
    list_per_page = 20
    empty_value_display = '-'


@admin.register(Message)
class MessageAdmin(CustomAdminMixin, admin.ModelAdmin):
    list_display = (
        'id',
        'conversation',
        'sender',
        'sender_role',
    )
    list_display_links = ('id',)
    list_filter = (
        'sender_role',
    )
    search_fields = (
        'sender__username',
        'sender__email',
        'content',
    )
    ordering = ('-id',)
    list_per_page = 20
    empty_value_display = '-'