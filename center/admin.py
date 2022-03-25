from django.contrib import admin

# Register your models here.


from .models import Project_info

# 注册Project_info到admin中
admin.site.register(Project_info)