
from django.db.models.functions import Substr, Cast
from django.shortcuts import render

# Create your views here.
from rest_framework.response import Response

from center.pagination import MyPageNumberPagination
from django.http import JsonResponse
from center.models import Project_info
from rest_framework import viewsets, status
# 这个 ArticleListSerializer 暂时还没有
from center.serializar.ProjectListSerializer import ProjectListSerializer
from django_filters.rest_framework import DjangoFilterBackend
from rest_framework import filters
from rest_framework.decorators import action
from django.db.models import Avg, Max, Min, Count, Sum, CharField, DateField  # 引入函数
from django.db.models import F
from center.permissions import IsAdminUserOrReadOnly

class ProjectInfoViewSet(viewsets.ModelViewSet):
    queryset = Project_info.objects.all()
    serializer_class = ProjectListSerializer
    # 设置分页
    pagination_class = MyPageNumberPagination
    # 过滤
    # filter_backends = [DjangoFilterBackend]
    # filterset_fields = ['Project_id', 'title', 'creator']
    # 搜索
    filter_backends = [filters.SearchFilter]
    search_fields = ['title']
    #设置权限
    permission_classes = [IsAdminUserOrReadOnly]

    def perform_create(self, serializer):
        # 绑定
        serializer.save(creator=self.request.user)

    @action(
        methods=["GET"], detail=False, url_name="count"
    )
    def project_count(self, request, *args, **kwargs):
        res = Project_info.objects.values('status').annotate(name=F('status'), value=Count("status")).values("name",
                                                                                                             'value')

        return Response(data=res, status=status.HTTP_200_OK)

    @action(
        methods=["GET"], detail=False, url_name="countbytimes"
    )
    def project_countbytimes(self, request, *args, **kwargs):
        res = Project_info.objects.annotate(a=Cast(('created'), output_field=DateField())).values("a").annotate(name=F("a"),values=Count("a")).values("name","values")
            # .annotate(name=Cast(('a'), output_field=DateField()),value=Count(Cast(('a'), output_field=DateField())))
            # .value("name").annotate(name=F("name"),value=Count("value"))

        return Response(data=res, status=status.HTTP_200_OK)
# name=Cast(DATE_FORMAT('created',"%Y-%m"), output_field=CharField()