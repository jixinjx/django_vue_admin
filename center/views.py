from django.shortcuts import render

# Create your views here.
from center.pagination import MyPageNumberPagination
from django.http import JsonResponse
from center.models import Project_info
from rest_framework import viewsets
# 这个 ArticleListSerializer 暂时还没有
from center.serializar.ProjectListSerializer import ProjectListSerializer
from django_filters.rest_framework import DjangoFilterBackend

class ProjectInfoViewSet(viewsets.ModelViewSet):
    queryset = Project_info.objects.all()
    serializer_class = ProjectListSerializer
    #设置分页
    pagination_class = MyPageNumberPagination
    #过滤
    filter_backends = [DjangoFilterBackend]
    filterset_fields = ['Project_id', 'title', 'creator']

    def perform_create(self, serializer):
        #绑定
        serializer.save(creator=self.request.user)