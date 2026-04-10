import os
import django

os.environ.setdefault("DJANGO_SETTINGS_MODULE", "steel_backend.settings")
django.setup()

from django.contrib.auth import get_user_model

User = get_user_model()

USERNAME = "admin"
PASSWORD = "12345678"
EMAIL = "admin@test.com"

user, created = User.objects.get_or_create(username=USERNAME, defaults={"email": EMAIL})
user.email = EMAIL
user.is_superuser = True
user.is_staff = True
user.is_active = True
user.set_password(PASSWORD)
user.save()

print("=== ADMIN USER READY ===")
print(f"username: {USERNAME}")
print("password has been reset successfully")