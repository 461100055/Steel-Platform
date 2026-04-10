import os
import django

os.environ.setdefault("DJANGO_SETTINGS_MODULE", "steel_backend.settings")
django.setup()

from django.contrib.auth import get_user_model  # noqa: E402

User = get_user_model()

USERNAME = os.getenv("DJANGO_SUPERUSER_USERNAME", "admin")
EMAIL = os.getenv("DJANGO_SUPERUSER_EMAIL", "admin@test.com")
PASSWORD = os.getenv("DJANGO_SUPERUSER_PASSWORD", "12345678")

if not User.objects.filter(username=USERNAME).exists():
    User.objects.create_superuser(
        username=USERNAME,
        email=EMAIL,
        password=PASSWORD,
    )
    print(f"Superuser '{USERNAME}' created successfully.")
else:
    print(f"Superuser '{USERNAME}' already exists.")