from django.contrib import admin
from django.urls import path, include
from django.http import HttpResponse

def home(request):
    return HttpResponse("Steel Platform backend is running.")

urlpatterns = [
    path('admin/', admin.site.urls),
    path('api/', include('api.urls')),
    path('', home),
]