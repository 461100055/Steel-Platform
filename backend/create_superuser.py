import os
import django

os.environ.setdefault("DJANGO_SETTINGS_MODULE", "steel_backend.settings")
django.setup()

from django.contrib.auth import get_user_model

User = get_user_model()

USERNAME = "admin"
PASSWORD = "12345678"

user, created = User.objects.get_or_create(username=USERNAME)

user.is_superuser = True
user.is_staff = True
user.set_password(PASSWORD)
user.save()

print("✅ Admin user is ready (password reset).")