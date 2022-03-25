from rest_framework import serializers
from center.models import Project_info
from center.serializar.UserDescSerializer import UserDescSerializer


class ProjectListSerializer(serializers.HyperlinkedModelSerializer ):
    #嵌套用户信息
    creator = UserDescSerializer(read_only=True)

    class Meta:
        model = Project_info
        fields = '__all__'