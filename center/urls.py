
from django.urls import path
from center import views

app_name = 'center'

urlpatterns = [
    path('', views.project_info_list, name='list'),
]