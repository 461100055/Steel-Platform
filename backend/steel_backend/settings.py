from django.conf import settings
from django.conf.urls.static import static
from pathlib import Path
from datetime import timedelta
import cloudinary
import os
import dj_database_url

urlpatterns += static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)

BASE_DIR = Path(__file__).resolve().parent.parent

# =========================================================
# Core settings
# =========================================================
SECRET_KEY = os.getenv("SECRET_KEY", "steel-platform-dev-secret-key-change-this")
DEBUG = os.getenv("DEBUG", "False").strip().lower() == "true"

# =========================================================
# Hosts / CORS / CSRF
# =========================================================
ALLOWED_HOSTS = [
    "127.0.0.1",
    "localhost",
    ".railway.app",
]

CORS_ALLOWED_ORIGINS = [
    "http://localhost:5173",
    "http://127.0.0.1:5173",
    "https://YOUR-VERCEL-DOMAIN.vercel.app",
]

CSRF_TRUSTED_ORIGINS = [
    "https://YOUR-VERCEL-DOMAIN.vercel.app",
    "https://*.railway.app",
]

CORS_ALLOW_CREDENTIALS = True
CORS_ALLOW_ALL_ORIGINS = True

# =========================================================
# Cloudinary
# =========================================================
cloudinary.config(
    cloud_name="dmrnepldy",
    api_key=os.getenv("CLOUDINARY_API_KEY"),
    api_secret=os.getenv("CLOUDINARY_API_SECRET"),
)

# =========================================================
# Applications
# =========================================================
INSTALLED_APPS = [
    'django.contrib.admin',
    'django.contrib.auth',
    'django.contrib.contenttypes',
    'django.contrib.sessions',
    'django.contrib.messages',
    'django.contrib.staticfiles',

    'cloudinary',
    'cloudinary_storage',

    'corsheaders',
    'rest_framework',
    'rest_framework_simplejwt',

    'api',
]

# =========================================================
# Middleware
# =========================================================
MIDDLEWARE = [
    'corsheaders.middleware.CorsMiddleware',  # لازم يكون أول واحد
    'django.middleware.security.SecurityMiddleware',
    'whitenoise.middleware.WhiteNoiseMiddleware',

    'django.contrib.sessions.middleware.SessionMiddleware',
    'django.middleware.common.CommonMiddleware',
    'django.middleware.csrf.CsrfViewMiddleware',
    'django.contrib.auth.middleware.AuthenticationMiddleware',
    'django.contrib.messages.middleware.MessageMiddleware',
    'django.middleware.clickjacking.XFrameOptionsMiddleware',
]

ROOT_URLCONF = 'steel_backend.urls'

TEMPLATES = [
    {
        'BACKEND': 'django.template.backends.django.DjangoTemplates',
        'DIRS': [],
        'APP_DIRS': True,
        'OPTIONS': {
            'context_processors': [
                'django.template.context_processors.request',
                'django.contrib.auth.context_processors.auth',
                'django.contrib.messages.context_processors.messages',
            ],
        },
    },
]

WSGI_APPLICATION = 'steel_backend.wsgi.application'

# =========================================================
# Database
# =========================================================
DATABASES = {
    'default': dj_database_url.config(
        default=f"sqlite:///{BASE_DIR / 'db.sqlite3'}",
        conn_max_age=600,
        ssl_require=False
    )
}

# =========================================================
# Password validation
# =========================================================
AUTH_PASSWORD_VALIDATORS = [
    {
        'NAME': 'django.contrib.auth.password_validation.UserAttributeSimilarityValidator',
    },
    {
        'NAME': 'django.contrib.auth.password_validation.MinimumLengthValidator',
        'OPTIONS': {'min_length': 8},
    },
    {
        'NAME': 'django.contrib.auth.password_validation.CommonPasswordValidator',
    },
]

# =========================================================
# Internationalization
# =========================================================
LANGUAGE_CODE = 'en-us'
TIME_ZONE = 'Asia/Riyadh'
USE_I18N = True
USE_TZ = True

# =========================================================
# Static / Media
# =========================================================
STATIC_URL = '/static/'
STATIC_ROOT = BASE_DIR / 'staticfiles'

# WhiteNoise
STATICFILES_STORAGE = 'whitenoise.storage.CompressedManifestStaticFilesStorage'

# Cloudinary for uploaded media
DEFAULT_FILE_STORAGE = 'cloudinary_storage.storage.MediaCloudinaryStorage'

# هذه تبقى للتوافق فقط، لكن التخزين الفعلي سيكون على Cloudinary
MEDIA_URL = '/media/'
MEDIA_ROOT = '/app/media'
MEDIA_URL = '/media/'
MEDIA_ROOT = BASE_DIR / 'media'

DEFAULT_AUTO_FIELD = 'django.db.models.BigAutoField'

# =========================================================
# DRF / JWT
# =========================================================
REST_FRAMEWORK = {
    'DEFAULT_AUTHENTICATION_CLASSES': (
        'rest_framework_simplejwt.authentication.JWTAuthentication',
    ),
    'DEFAULT_PERMISSION_CLASSES': (
        'rest_framework.permissions.AllowAny',
    ),
}

SIMPLE_JWT = {
    'ACCESS_TOKEN_LIFETIME': timedelta(days=1),
    'REFRESH_TOKEN_LIFETIME': timedelta(days=7),
    'ROTATE_REFRESH_TOKENS': False,
    'BLACKLIST_AFTER_ROTATION': False,
    'AUTH_HEADER_TYPES': ('Bearer',),
}

# =========================================================
# Security settings for public production deployment
# =========================================================
SECURE_PROXY_SSL_HEADER = ('HTTP_X_FORWARDED_PROTO', 'https')
SECURE_SSL_REDIRECT = not DEBUG

SESSION_COOKIE_SECURE = not DEBUG
CSRF_COOKIE_SECURE = not DEBUG

SESSION_COOKIE_SAMESITE = 'Lax'
CSRF_COOKIE_SAMESITE = 'Lax'

X_FRAME_OPTIONS = 'DENY'
SECURE_BROWSER_XSS_FILTER = True
SECURE_CONTENT_TYPE_NOSNIFF = True

SECURE_HSTS_SECONDS = 31536000 if not DEBUG else 0
SECURE_HSTS_INCLUDE_SUBDOMAINS = not DEBUG
SECURE_HSTS_PRELOAD = not DEBUG