from rest_framework import serializers
from center.models import Project_info
from center.serializar.UserDescSerializer import UserDescSerializer


class ProjectListSerializer(serializers.HyperlinkedModelSerializer ):
    #嵌套用户信息
    creator = UserDescSerializer(read_only=True)
    #格式化日期
    created = serializers.DateTimeField(format="%Y-%m-%d %H:%M:%S",required=False,)
    #新建一个自定义字段
    created_date = serializers.SerializerMethodField(label="created_date")
    class Meta:
        model = Project_info
        fields = '__all__'

    #自定义字段
    def get_created_date(self,obj):
        created_date=obj.created.strftime('%Y-%m-%d')
        return created_date