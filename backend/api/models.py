from django.conf import settings
from django.db import models

ROLE_CHOICES = [
    ('buyer_individual', 'Buyer Individual'),
    ('buyer_company', 'Buyer Company'),
    ('buyer_establishment', 'Commercial Establishment'),
    ('supplier', 'Supplier'),
    ('admin', 'Admin'),
]

BUYER_TYPE_CHOICES = [
    ('individual', 'Individual Buyer'),
    ('company', 'Company Buyer'),
    ('establishment', 'Commercial Establishment'),
]

ADMIN_PERMISSION_CHOICES = [
    ('manage_users', 'Manage Users'),
    ('manage_suppliers', 'Manage Suppliers'),
    ('approve_suppliers', 'Approve Suppliers'),
    ('manage_products', 'Manage Products'),
    ('approve_products', 'Approve Products'),
    ('manage_orders', 'Manage Orders'),
    ('manage_rfqs', 'Manage RFQs'),
    ('view_analytics', 'View Analytics'),
    ('manage_messages', 'Manage Messages'),
    ('manage_settings', 'Manage Settings'),
]


class UserProfile(models.Model):
    user = models.OneToOneField(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name='profile'
    )
    role = models.CharField(max_length=30, choices=ROLE_CHOICES, default='buyer_individual')
    buyer_type = models.CharField(max_length=20, choices=BUYER_TYPE_CHOICES, blank=True, default='')
    phone = models.CharField(max_length=50, blank=True)
    city = models.CharField(max_length=100, blank=True)
    company = models.CharField(max_length=255, blank=True)
    status = models.CharField(max_length=20, default='active')
    permissions = models.JSONField(default=list, blank=True)
    joined_date = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"{self.user.username} ({self.role})"

    def has_permission(self, permission_code):
        if self.role != 'admin':
            return False
        return permission_code in (self.permissions or [])


class SupplierProfile(models.Model):
    user = models.OneToOneField(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name='supplier_profile'
    )
    description = models.TextField(blank=True)
    categories = models.JSONField(default=list, blank=True)
    rating = models.FloatField(default=4.5)
    total_orders = models.PositiveIntegerField(default=0)
    image = models.URLField(blank=True)

    def __str__(self):
        return self.user.get_full_name() or self.user.username


class Product(models.Model):
    image = models.ImageField(upload_to='products/')
    STATUS_CHOICES = [
        ('pending', 'Pending'),
        ('approved', 'Approved'),
        ('rejected', 'Rejected'),
    ]

    STOCK_CHOICES = [
        ('In Stock', 'In Stock'),
        ('Low Stock', 'Low Stock'),
        ('Made to Order', 'Made to Order'),
    ]

    supplier = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name='products'
    )
    name = models.CharField(max_length=255)
    category = models.CharField(max_length=100)
    price = models.DecimalField(max_digits=12, decimal_places=2)
    moq = models.PositiveIntegerField(default=1)
    unit = models.CharField(max_length=50, default='ton')
    delivery_time = models.CharField(max_length=100, blank=True)
    description = models.TextField(blank=True)
    inventory = models.PositiveIntegerField(default=0)
    specifications = models.JSONField(default=dict, blank=True)
    image = models.URLField(blank=True)
    rating = models.FloatField(default=4.5)
    stock_status = models.CharField(max_length=20, choices=STOCK_CHOICES, default='In Stock')
    badge = models.CharField(max_length=50, blank=True)
    is_active = models.BooleanField(default=True)
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='approved')
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return self.name


class Order(models.Model):
    STATUS_CHOICES = [
        ('pending', 'Pending'),
        ('confirmed', 'Confirmed'),
        ('shipped', 'Shipped'),
        ('completed', 'Completed'),
        ('cancelled', 'Cancelled'),
    ]

    buyer = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name='orders'
    )
    total_price = models.DecimalField(max_digits=14, decimal_places=2, default=0)
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='pending')
    notes = models.TextField(blank=True)
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"Order #{self.id}"


class OrderItem(models.Model):
    order = models.ForeignKey(
        Order,
        on_delete=models.CASCADE,
        related_name='items'
    )
    product = models.ForeignKey(
        Product,
        on_delete=models.CASCADE,
        related_name='order_items'
    )
    quantity = models.PositiveIntegerField()

    def __str__(self):
        return f"{self.product.name} x {self.quantity}"


class RFQ(models.Model):
    STATUS_CHOICES = [
        ('pending', 'Pending'),
        ('quoted', 'Quoted'),
        ('accepted', 'Accepted'),
        ('rejected', 'Rejected'),
    ]

    buyer = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name='rfqs'
    )
    supplier = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name='supplier_rfqs'
    )
    product_name = models.CharField(max_length=255)
    quantity = models.PositiveIntegerField(default=1)
    unit = models.CharField(max_length=50, default='ton')
    target_price = models.DecimalField(max_digits=12, decimal_places=2, default=0)
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='pending')
    required_date = models.DateField(null=True, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return self.product_name


class Conversation(models.Model):
    STATUS_CHOICES = [
        ('active', 'Active'),
        ('archived', 'Archived'),
    ]

    buyer = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name='buyer_conversations'
    )
    supplier = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name='supplier_conversations'
    )
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='active')
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return f"Conversation #{self.id}"


class Message(models.Model):
    ROLE_CHOICES = [
        ('buyer', 'Buyer'),
        ('supplier', 'Supplier'),
    ]

    conversation = models.ForeignKey(
        Conversation,
        on_delete=models.CASCADE,
        related_name='messages'
    )
    sender = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name='sent_messages'
    )
    sender_role = models.CharField(max_length=20, choices=ROLE_CHOICES)
    content = models.TextField()
    timestamp = models.DateTimeField(auto_now_add=True)
    read = models.BooleanField(default=False)

    def __str__(self):
        return f"Message #{self.id}"