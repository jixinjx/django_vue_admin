## 环境设置

```
python manage.py startapp article
```

### mysql数据库链接

```
pip install pymysql

```

在总目录下的Init.py中

```
import pymysql
pymysql.install_as_MySQLdb()
```

seeting中设置

```
DATABASES = {
    'default': {
         'ENGINE': 'django.db.backends.mysql',  # 换成mysql或其他
        'NAME': 'center',
        'USER': 'root',
        'PASSWORD': 'jixinjx',
        'HOST': '127.0.0.1',
        'PORT': 3306,
        'OPTIONS': {
            'autocommit': True,
        },
    }
}

```



### 注册APP（settings）

```
admin/settings.py

INSTALLED_APPS = [
    # 其他代码
    ...

    # 新增'article'代码，激活app
    'article',
]
```

### 配置访问路径（urls）

```
admin/urls.py
from django.contrib import admin
# 记得引入include
from django.urls import path, include

# 存放映射关系的列表
urlpatterns = [
    path('admin/', admin.site.urls),

    # 新增代码，配置app的url
    path('article/', include('article.urls', namespace='article')),
]
```

在app文件夹中创建urls.py

```
# 引入path
from django.urls import path

# 正在部署的应用的名称
app_name = 'article'

urlpatterns = [
    # 目前还没有urls
]
```

### 安装 DRF 及其他依赖库：

```
pip install djangorestframework==3.12.2
pip install markdown==3.3.3
pip install django-filter==2.4.0
```

注册

```
INSTALLED_APPS = [
    ...

    'rest_framework',
    
]
```

接着还需要添加 DRF 的登录视图，以便 DRF 自动为你的可视化接口页面生成一个用户登录的入口：

```
# admin/urls.py

...
from django.urls import include

urlpatterns = [
    ...
    path('api-auth/', include('rest_framework.urls')),
]
```



## 编写模型

| 模型（Model），即数据存取层    | 处理与数据相关的所有事务： 如何存取、如何验证有效性、包含哪些行为以及数据之间的关系等。 |
| ------------------------------ | ------------------------------------------------------------ |
| 模板（Template），即业务逻辑层 | 处理与表现相关的决定： 如何在页面或其他类型文档中进行显示。  |
| 视图（View），即表现层         | 存取模型及调取恰当模板的相关逻辑。模型与模板的桥梁。         |

```
from django.db import models

# Create your models here.


from django.db import models
# 导入内建的User模型。
from django.contrib.auth.models import User
# timezone 用于处理时间相关事务。
from django.utils import timezone

# 项目概况数据模型
class ArticlePost(models.Model):
    # 负责人，参数 on_delete 用于指定数据删除的方式，定义关系
    creator = models.ForeignKey(User, on_delete=models.CASCADE)

    # 项目标题。models.CharField 为字符串字段，用于保存较短的字符串，比如标题
    title = models.CharField(max_length=100)

    # 项目概况。保存大量文本使用 TextField
    body = models.TextField()

    # 项目创建时间。参数 default=timezone.now 指定其在创建数据时将默认写入当前的时间
    created = models.DateTimeField(default=timezone.now)

    # 项目更新时间。参数 auto_now=True 指定每次数据更新时自动写入当前时间
    updated = models.DateTimeField(auto_now=True)

    # 项目状态
    status= models.CharField(max_length=100)

    # 内部类 class Meta 用于给 model 定义元数据
    class Meta:
        # ordering 指定模型返回的数据的排列顺序
        # '-created' 表明数据应该以倒序排列
        ordering = ('-created',)

    # 函数 __str__ 定义当调用对象的 str() 方法时的返回值内容
    def __str__(self):
        # return self.title 将文章标题返回
        return self.title
```

- 内部类`Meta`中的`ordering`定义了数据的排列方式。`-created`表示将以创建时间的倒序排列，保证了最新的文章总是在网页的最上方。注意`ordering`是元组，括号中只含一个元素时不要忘记末尾的逗号。
- `__str__`方法定义了需要表示数据时应该显示的名称。给模型增加 `__str__`方法是很重要的，它最常见的就是在Django管理后台中做为对象的显示值。因此应该总是返回一个友好易读的字符串。

## 数据迁移

**每当对数据库进行了更改（添加、修改、删除等）操作，都需要进行数据迁移。**

```
python manage.py makemigrations，对模型的更改创建新的迁移表
python manage.py migrate，应用迁移到数据库中：
```

## 序列化

前后端分离的核心思想之一，就是两端交互不通过模板语言，而只传输需要的数据。因此问题就来了。

在 Django 程序的运行过程中，变量都是存储在服务器的内存中；更要命的是，后端 Django 程序中存储的是 Python 变量，而前端的浏览器中是 Javascript 变量，这两者是无法直接通过你家的网线进行传递和交流的。因此需要规定一个“标准格式”，前后端都根据这个标准格式，对资源进行保存、读取、传输等操作。

`JSON` 就是这种标准格式之一。它很轻量，表示出来就是个字符串，可以直接被几乎所有的语言读取，非常方便。

把 Python 对象转换为 JSON ，这被称为**序列化**（serialization）

把 JSON 转换为 Javascript 对象，被称为**反序列化**

总之，把变量从内存中变成可存储或传输的过程称之为**序列化**，反过来把变量内容从序列化的对象重新读到内存里称之为**反序列化**。



创建序列化文件

```
from rest_framework import serializers


class ProjectListSerializer(serializers.Serializer):
    id = serializers.CharField(read_only=True)
    title = serializers.CharField(allow_blank=True, max_length=100)
    body = serializers.CharField(allow_blank=True)
    creator = serializers.CharField(allow_blank=True, max_length=100)
    status = serializers.CharField(allow_blank=True, max_length=100)
    created = serializers.DateTimeField()
    updated = serializers.DateTimeField()
```

创建VIEW

```
from django.shortcuts import render

# Create your views here.

from django.http import JsonResponse
from center.models import Project_info

from center.serializar.ProjectListSerializer import ProjectListSerializer

def article_list(request):
    project_info = Project_info.objects.all()
    serializer = ProjectListSerializer(project_info, many=True)
    return JsonResponse(serializer.data, safe=False)
```

简单的配置一下路由

```
# admin/urls.py
...
urlpatterns = [
    ...
    path('api/project_info/', include('center.urls', namespace='center')),
]
```



```
# center/urls.py

from django.urls import path
from article import views

app_name = 'center'

urlpatterns = [
    path('', views.project_info_list, name='list'),
]
```

创建一个超级用户，进入后台增加几个数据

```
python manage.py createsuperuser
```

如果报错,因为版本问题没有pytz

```
pip install pytz
```

接下来我们需要“告诉”Django，后台中需要添加数据表供管理。

```
#center/admin.py
from django.contrib import admin

# Register your models here.


from .models import Project_info

# 注册Project_info到admin中
admin.site.register(Project_info)
```

### 改写为序列化器

相关序列化器

https://www.liujiangblog.com/blog/43/

可以用ModelSerializer简化序列化器

```
from rest_framework import serializers
from center.models import Project_info

class ProjectListSerializer(serializers.ModelSerializer):
    class Meta:
        model = Project_info
        fields = '__all__'
```

### 序列化器新增字段

想要给序列化器新曾一个日期字段

```
from rest_framework import serializers
from center.models import Project_info
from center.serializar.UserDescSerializer import UserDescSerializer


class ProjectListSerializer(serializers.HyperlinkedModelSerializer ):
    #嵌套用户信息
    creator = UserDescSerializer(read_only=True)
    #格式化日期
    created = serializers.DateTimeField(format="%Y-%m-%d %H:%M:%S")
    #新建一个自定义字段
    created_date = serializers.SerializerMethodField(label="created_date")
    class Meta:
        model = Project_info
        fields = '__all__'

    #自定义字段
    def get_created_date(self,obj):
        created_date=obj.created.strftime('%Y-%m-%d')
        return created_date
```



## 创建视图集

序列化器继承的 `HyperlinkedModelSerializer` 基本上与之前用的 `ModelSerializer` 差不多，区别是它自动提供了外键字段的超链接，并且默认不包含模型对象的 id 字段。

更改序列化器中的

```
from rest_framework import serializers
from center.models import Project_info
from center.serializar.UserDescSerializer import UserDescSerializer


class ProjectListSerializer(serializers.HyperlinkedModelSerializer ):
    #嵌套用户信息
    creator = UserDescSerializer(read_only=True)

    class Meta:
        model = Project_info
        fields = '__all__'
```



```
from django.shortcuts import render

# Create your views here.
from center.pagination import MyPageNumberPagination
from django.http import JsonResponse
from center.models import Project_info
from rest_framework import viewsets
# 这个 ArticleListSerializer 暂时还没有
from center.serializar.ProjectListSerializer import ProjectListSerializer

class ProjectInfoViewSet(viewsets.ModelViewSet):
    queryset = Project_info.objects.all()
    serializer_class = ProjectListSerializer
    #设置分页
    pagination_class = MyPageNumberPagination

    def perform_create(self, serializer):
        #绑定
        serializer.save(creator=self.request.user)
```

首先创建ProjectInfoViewSet，继承viewsets.ModelViewSet

在视图集中，可直接继承各种方法。

### 实现项目关联用户

项目模型添加用户外键，确定每篇项目的作者了

既然请求体中已经包含用户信息了，那就可以从 `Request` 中提取用户信息，并把额外的用户信息注入到已有的数据中。

在视图中

```
  # 新增代码
    def perform_create(self, serializer):
        serializer.save(creator=self.request.user)
```

- 新增的这个 `perform_create()` 从父类 `ListCreateAPIView` 继承而来，它在序列化数据真正保存之前调用，因此可以在这里添加额外的数据（即用户对象）。
- `serializer` 参数是 `ArticleListSerializer` 序列化器实例，并且已经携带着验证后的数据。它的 `save()` 方法可以接收关键字参数作为额外的需要保存的数据。

虽然作者外键已经出现在序列化数据中了，但是仅仅显示作者的 id 不太有用，我们更想要的是比如名字、性别等更具体的结构化信息。所以就需要将序列化数据**嵌套**起来。



创建user的序列化器

```
from django.contrib.auth.models import User
from rest_framework import serializers

class UserDescSerializer(serializers.ModelSerializer):
    """于文章列表中引用的嵌套序列化器"""

    class Meta:
        model = User
        fields = [
            'id',
            'username',
            'last_login',
            'date_joined'
        ]
```

然后嵌套在一起

```
from rest_framework import serializers
from center.models import Project_info
from UserDescSerializer import UserDescSerializer


class ProjectListSerializer(serializers.ModelSerializer):
    #嵌套用户信息
    creator = UserDescSerializer(read_only=True)

    class Meta:
        model = Project_info
        fields = '__all__'
```

### 修改路由

由于使用了视图集，我们甚至连**路由**都不用自己设计了，使用框架提供的 `Router` 类就可以自动处理视图和 url 的连接。

```python
from rest_framework.routers import DefaultRouter
from center import views
router = DefaultRouter()
router.register(r'article', views.ProjectInfoViewSet)

urlpatterns = [
    path('admin/', admin.site.urls),
    path('api-auth/', include('rest_framework.urls')),
    path('api/', include(router.urls)),
    #path('api/project_info/', include('center.urls', namespace='center')),
]

```



## 分页

DRF 框架继承了 Django 方便易用的传统，分页这种常见功能提供了默认实现。、

常见的是**PageNumberPagination**：普通分页器。支持用户按?page=3&size=10这种更灵活的方式进行查询，这样用户不仅可以选择页码，还可以选择每页展示数据的数量。通常还需要设置max_page_size这个参数限制每页展示数据的最大数量，以防止用户进行恶意查询(比如size=10000), 这样一页展示1万条数据将使分页变得没有意义。

DRF中使用默认分页类的最简单方式就是在`settings.py`中进行全局配置，如下所示：

```
REST_FRAMEWORK ={
    'DEFAULT_PAGINATION_CLASS':'rest_framework.pagination.PageNumberPagination',
    'PAGE_SIZE':2
}
```

但是如果你希望用户按`?page=3&size=10`这种更灵活的方式进行查询，你就要进行个性化定制。在实际开发过程中，定制比使用默认的分页类更常见，具体做法如下。

第一步: 在app目录下新建`pagination.py`, 添加如下代码：

```
#blog/pagination.py
from rest_framework.pagination import PageNumberPagination

class MyPageNumberPagination(PageNumberPagination):
    page_size = 2   # default page size
    page_size_query_param = 'size'  # ?page=xx&size=??
    max_page_size = 10 # max page size
```

我们自定义了一个`MyPageNumberPagination`类，该类继承了`PageNumberPagination`类。我们通过`page_size`设置了每页默认展示数据的条数，通过`page_size_query_param`设置了每页size的参数名以及通过`max_page_size`设置了每个可以展示的最大数据条数。

第二步：使用自定义的分页类

在基于类的视图中，你可以使用`pagination_class`这个属性使用自定义的分页类，如下所示：

```
from rest_framework import viewsets
from .pagination import MyPageNumberPagination

class ArticleViewSet(viewsets.ModelViewSet):
    # 用一个视图集替代ArticleList和ArticleDetail两个视图
    queryset = Article.objects.all()
    serializer_class = ArticleSerializer
    pagination_class = MyPageNumberPagination

    # 自行添加，将request.user与author绑定
    def perform_create(self, serializer):
        serializer.save(author=self.request.user)

    # 自行添加，将request.user与author绑定
    def perform_update(self, serializer):
        serializer.save(author=self.request.user)
```

当然定制分页类不限于指定`page_size`和`max_page_size`这些属性，你还可以改变响应数据的输出格式。比如我们这里希望把next和previous放在一个名为`links`的key里，我们可以修改`MyPageNumberPagination`类，重写`get_paginated_response`方法：

```
from rest_framework.pagination import PageNumberPagination
from rest_framework.response import Response


class MyPageNumberPagination(PageNumberPagination):
    page_size = 2   # default page size
    page_size_query_param = 'size'  # ?page=xx&size=??
    max_page_size = 10 # max page size
    
    
    def get_paginated_response(self, data):
        return Response({
            'links': {
                'next': self.get_next_link(),
                'previous': self.get_previous_link()
            },
            'count': self.page.paginator.count,
            'results': data
        })
```

## 过滤

`django-filter` ，这就是用于过滤的轮子、

安装包

```
INSTALLED_APPS = [ ... 'rest_framework', 'django_filters', ... ]
```

在setting中设置为默认的过滤引擎

```
# drf_vue_blog/settings.py

...
REST_FRAMEWORK = {
    'DEFAULT_FILTER_BACKENDS': ['django_filters.rest_framework.DjangoFilterBackend']
    ...
}
```

以上为全局配置

也可以将其单独配置在特定的视图中：

```
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
```

如果要实现更常用的模糊匹配，就可以使用 `SearchFilter` 做搜索后端：

```
# article/views.py
#代码仅作示例，不能直接用
...
from rest_framework import filters

class ArticleViewSet(viewsets.ModelViewSet):
    queryset = Article.objects.all()
    serializer_class = ArticleSerializer
    permission_classes = [IsAdminUserOrReadOnly]

    filter_backends = [filters.SearchFilter]
    search_fields = ['title']

    # 这个属性不需要了
    # filterset_fields = ['author__username', 'title']
```

## VUE创建

 在项目文件夹中的终端

```bash
npm install -g vue-cli
```

初始化

```bash
vue init webpack front-end
```

建议别装ESLint 

安装element ui

```
npm i element-ui -S
```

### 引入 Element

完整引入

在 main.js 中写入以下内容：

```javascript
import Vue from 'vue';
import ElementUI from 'element-ui';
import 'element-ui/lib/theme-chalk/index.css';
import App from './App.vue';

Vue.use(ElementUI);

new Vue({
  el: '#app',
  render: h => h(App)
});
```

以上代码便完成了 Element 的引入。需要注意的是，样式文件需要单独引入。

安装axios

```
npm install axios
```

创建views文件夹

创建home.vue

```
<template>
    <div>

    </div>
</template>

<script>
    export default {
        name: 'Home',
    }
</script>

<style scoped>

</style>
```

同时设置路由

```
import Vue from 'vue'
import Router from 'vue-router'
import HelloWorld from '@/components/HelloWorld'
import Home from "@/views/Home.vue";
Vue.use(Router)

export default new Router({
  routes: [
    {
      path: '/',
      name: 'Home',
      component: Home
    }
  ]
})

```



## 解决跨域



跨域问题是由于浏览器的同源策略（域名，协议，端口均相同）造成的，是浏览器施加的安全限制。说简单点，Vue 服务器端口（8080）和 Django 服务器端口（8000）不一致，因此无法通过 Javascript 代码请求后端资源。

解决办法有两种。

**第一种方法**是创建 `frontend/vue.config.js` 文件并写入：

```
module.exports = {
    devServer: {
        proxy: {
            '/api': {
                target: `http://127.0.0.1:8000/api`,
                changeOrigin: true,
                pathRewrite: {
                    '^/api': ''
                }
            }
        }
    }
};
```

这个 Vue 的配置文件给前端服务器设置了代理，即将 `/api` 地址的前端请求转发到 8000 端口的后端服务器去，从而规避跨域问题。

**另一种方法**是在后端引入 `django-cors-middleware` 这个库，在后端解决此问题。

https://github.com/adamchainz/django-cors-headers

> Install from **pip**:
>
> ```
> python -m pip install django-cors-headers
> ```
>
> and then add it to your installed apps:
>
> ```
> INSTALLED_APPS = [
> ...,
> "corsheaders",
> ...,
> ]
> ```
>
> Make sure you add the trailing comma or you might get a `ModuleNotFoundError` (see [this blog post](https://adamj.eu/tech/2020/06/29/why-does-python-raise-modulenotfounderror-when-modifying-installed-apps/)).
>
> You will also need to add a middleware class to listen in on responses:
>
> ```
> MIDDLEWARE = [
> ...,
> "corsheaders.middleware.CorsMiddleware",
> "django.middleware.common.CommonMiddleware",
> ...,
> ]
> ```
>
> `CorsMiddleware` should be placed as high as possible, especially before any middleware that can generate responses such as Django's `CommonMiddleware` or Whitenoise's `WhiteNoiseMiddleware`. If it is not before, it will not be able to add the CORS headers to these responses.
>
> Also if you are using `CORS_REPLACE_HTTPS_REFERER` it should be placed before Django's `CsrfViewMiddleware` (see more below).



## 创建页面

### 创建容器

在home.vue中创建容器

```
<template>
    <div>


    <el-container>
      <el-header>Header</el-header>
      <el-container>
        <el-aside width="200px">Aside</el-aside>
        <el-main>Main</el-main>
      </el-container>
    </el-container>

    </div>
</template>

<script>
    export default {
        name: 'Home',
    }
</script>

<style scoped>

</style>
```

新建NavMenu.vue

```
<template>
  <el-row class="tac">
    <el-col :span="24">
      <el-menu default-active="2" class="el-menu-vertical-demo" @open="handleOpen" @close="handleClose"
      unique-opened
      router
      background-color="#545c64" text-color="#fff" active-text-color="#ffd04b">
        <el-submenu index="1">
          <template slot="title">
            <i class="el-icon-location"></i>
            <span>导航一</span>
          </template>
          <el-menu-item-group>
            <el-menu-item index="1-1">选项1</el-menu-item>
            <el-menu-item index="1-2">选项2</el-menu-item>
            <el-menu-item index="1-3">选项3</el-menu-item>
            <el-menu-item index="1-4">选项4</el-menu-item>
          </el-menu-item-group>
        </el-submenu>

        <el-submenu index="2">
          <template slot="title">
            <i class="el-icon-location"></i>
            <span>导航二</span>
          </template>
          <el-menu-item-group>
            <el-menu-item index="2-1">选项1</el-menu-item>
            <el-menu-item index="2-2">选项2</el-menu-item>
            <el-menu-item index="2-3">选项3</el-menu-item>
            <el-menu-item index="2-4">选项4</el-menu-item>
          </el-menu-item-group>
        </el-submenu>

      </el-menu>
    </el-col>
  </el-row>
</template>

<script>
  export default {
    methods: {
      handleOpen(key, keyPath) {
        console.log(key, keyPath)
      },
      handleClose(key, keyPath) {
        console.log(key, keyPath)
      }
    }
  }
</script>
```

然后将NavMenu组件导入到home.vue中, 修改

```
<template>
  <div id="app">

    <el-container>
      <el-header>Header</el-header>
      <el-container>
        <el-aside width="200px">
          <navmenu></navmenu>
        </el-aside>
        <el-main>Main</el-main>
      </el-container>
    </el-container>

  </div>
</template>

<script>
import NavMenu from '@/components/NavMenu'

export default {
  name: 'app',
  components: {
    'navmenu': NavMenu
  }
}

</script>

<style>

</style>

```

### 动态化导航栏

为了方便记忆理解过程，一步一步进行修改

首先静态加载数据，将导航栏数据写在NaVMennu2.vue中

```vue
<template>
  <el-row class="tac">
    <el-col :span="24">
      <el-menu default-active="2" class="el-menu-vertical-demo" @open="handleOpen" @close="handleClose"
      unique-opened
      router
      background-color="#545c64" text-color="#fff" active-text-color="#ffd04b">

      
        <el-submenu v-for="item in menu" v-bind:key="item.name" index="1">
          <template slot="title">
            <i class="el-icon-location"></i>
            <span>{{item.name}}</span>
          </template>
          <el-menu-item-group v-for="sub in item.sub" v-bind:key="sub.name">
            <el-menu-item :index="sub.path">{{sub.subname}}</el-menu-item>
          </el-menu-item-group>
        </el-submenu>

        <el-submenu index="2">
          <template slot="title">
            <i class="el-icon-location"></i>
            <span>导航二</span>
          </template>
          <el-menu-item-group>
            <el-menu-item index="2-1">选项1</el-menu-item>
            <el-menu-item index="2-2">选项2</el-menu-item>
            <el-menu-item index="2-3">选项3</el-menu-item>
            <el-menu-item index="2-4">选项4</el-menu-item>
          </el-menu-item-group>
        </el-submenu>

      </el-menu>
    </el-col>
  </el-row>
</template>

<script>
  export default {
      data() {
          return {
              menu: [
                  {
                  name: 'AAA',
                  sub:[{
                      subname:'1111',
                      path:'1'
                  },
                  {
                      subname:'2222',
                      path:'1'
                  },
                  {
                      subname:'3333',
                      path:'1'
                  }
                  ]
              }, {
                  name: 'BBB',
                  sub:[{
                      subname:'1111',
                      path:'1'
                  },
                  {
                      subname:'2222',
                      path:'1'
                  },
                  {
                      subname:'3333',
                      path:'1'
                  }
                  ]
              },
              ]
          }
      },
    methods: {
      handleOpen(key, keyPath) {
        console.log(key, keyPath)
      },
      handleClose(key, keyPath) {
        console.log(key, keyPath)
      }
    }
  }
</script>
```

目前导航已经能够通过menu中的数据动态加载导航栏了，接下来创建一个config文件，能够在config中进行设置，提高复用性

```
module.exports = [
                  {
                  name: 'AAA',
                  sub:[{
                      subname:'1111',
                      path:'1'
                  },
                  {
                      subname:'2222',
                      path:'1'
                  },
                  {
                      subname:'3333',
                      path:'1'
                  }
                  ]
              }, {
                  name: 'BBB',
                  sub:[{
                      subname:'1111',
                      path:'1'
                  },
                  {
                      subname:'2222',
                      path:'1'
                  },
                  {
                      subname:'3333',
                      path:'1'
                  }
                  ]
              }
]
```

在navmenu中引入

```
<script>
import menu from '@/config/menuconfig'
  export default {
      data() {
          return {
              menu: menu
          }
      },
    methods: {
      handleOpen(key, keyPath) {
        console.log(key, keyPath)
      },
      handleClose(key, keyPath) {
        console.log(key, keyPath)
      }
    }
  }
</script>
```



如果侧边框没有塞满

```
.el-row,.el-menu,.el-col{
    height: 100%;
}
```

### 创建header

```
<template>

  <el-row>
    <el-col :span="24">
      <div class="head-wrap">Element</div>
    </el-col>
  </el-row>
</template>

<style scoped>
.el-row{
height: 100%;
width: 100%;
  background-color: #409EFF;
  color: #fff;
}
.head-wrap{
    margin: 0;
    position: absolute;
    top: 50%;
    left: 4%;
    /* left: 50%; */
    transform: translate(0%, -50%);
    font-size: 30px;
}
</style>
```

然后在home.vue中引入

## 组件路由

先修改menuconfig

```
module.exports = [
                  {
                  name: '基础容器',
                  sub:[{
                      subname:'基础容器',
                      path:'BasicContainer'
                  },
                
                  ]
              }, {
                  name: '第二种容器',
                  sub:[{
                      subname:'基础布局',
                      path:'BasicLayout'
                  },
                 
                  ]
              }
]
```

然后修改index.js，动态挂载子组件

```
import Vue from 'vue'
import Router from 'vue-router'
import HelloWorld from '@/components/HelloWorld'
import Home from "@/views/Home.vue";
Vue.use(Router)
import menus from '@/config/menuconfig'


var routes = [
  {
    path: '/',
    name: 'Home',
    component: Home,
    children:[],
  }
]

menus.forEach((item) => {
  item.sub.forEach((sub) => {
    routes[0].children.push({
      path: `/${sub.path}`,
      name: sub.path,
      component: () => import(`@/views/${sub.path}`)
    })
  })
})

console.log(routes)
export default new Router({routes})

```

记得在home中加入route-view

```
 <el-main>
                <router-view></router-view>
                </el-main>
```



## 表格

创建表格如下

```
<template>
<div>
  <el-table
    :data="info"
    border
    style="width: 100%">
    <el-table-column
      fixed
      prop="Project_id"
      label="项目id"
      width="150">
    </el-table-column>
    <el-table-column
      prop="title"
      label="项目名称"
      width="120">
    </el-table-column>
    <el-table-column
      prop="body"
      label="内容"
      width="120">
    </el-table-column>
    <el-table-column
      prop="created"
      label="创建时间"
      width="120">
    </el-table-column>
    <el-table-column
      prop="updated"
      label="更新时间"
      width="300">
    </el-table-column>
    <el-table-column
      prop="status"
      label="状态"
      width="120">
    </el-table-column>
    <el-table-column
      fixed="right"
      label="操作"
      width="100">
      <template slot-scope="scope">
        <el-button @click="handleClick(scope.row)" type="text" size="small">查看</el-button>
        <el-button type="text" size="small">编辑</el-button>
      </template>
    </el-table-column>
  </el-table>
</div>
</template>

<script>
import axios from 'axios';
  export default {
    methods: {
      handleClick(row) {
        console.log(row);
      }
    },

    data() {
      return {
       
        info:[]
      }
    },
    mounted() {
            axios
                .get('http://127.0.0.1:8000/api/projectinfo/')
                .then(response => (this.info = response.data.results))
        console.log(this.info)
        }
        
  }
  
</script>
```

## 权限管理

创建center/permissions.py

```
from rest_framework import permissions

class IsAdminUserOrReadOnly(permissions.BasePermission):
    """
    仅管理员用户可进行修改
    其他用户仅可查看
    """
    def has_permission(self, request, view):
        # 对所有人允许 GET, HEAD, OPTIONS 请求
        if request.method in permissions.SAFE_METHODS:
            return True

        # 仅管理员可进行其他操作
        return request.user.is_superuser
```

自定义的权限类继承了 `BasePermission` 这个基础的父类，并实现了父类中的钩子方法 `def has_permission`。此方法在每次请求到来时被唤醒执行，里面简单判断了请求的种类是否安全（即不更改数据的请求），如果安全则直接通过，不安全则只允许管理员用户通过。

再次修改视图：

```
# center/views.py

...

# from rest_framework.permissions import IsAdminUser
from article.permissions import IsAdminUserOrReadOnly

class ProjectInfoViewSet(viewsets.ModelViewSet):
   
    permission_classes = [IsAdminUserOrReadOnly]

```



## 创建弹窗

## JWT身份验证

首先 pip 安装 `djangorestframework-simplejwt` 这个 jwt 库：

```
(venv) > pip install djangorestframework-simplejwt
```

修改配置文件，使 JWT 为默认的验证机制：

```
# drf_vue_blog/settings.py

...

REST_FRAMEWORK = {
    ...

    'DEFAULT_AUTHENTICATION_CLASSES': (
        'rest_framework_simplejwt.authentication.JWTAuthentication',
    )

}
```

在根路由中添加 Token 的获取和刷新地址：

```
# drf_vue_blog/urls.py

...

from rest_framework_simplejwt.views import (
    TokenObtainPairView,
    TokenRefreshView,
)

urlpatterns = [
    ...
    path('api/token/', TokenObtainPairView.as_view(), name='token_obtain_pair'),
    path('api/token/refresh/', TokenRefreshView.as_view(), name='token_refresh'),
]
```

这就完成了，毫无痛苦，这就是用一个优秀轮子的好处。

Token 默认有效期很短，只有 5 分钟。你可以通过修改 Django 的配置文件进行更改：

```
# drf_vue_blog/settings.py

...

from datetime import timedelta

SIMPLE_JWT = {
    'ACCESS_TOKEN_LIFETIME': timedelta(days=1),
    'REFRESH_TOKEN_LIFETIME': timedelta(days=10),
}
```

## ORM相关

| Project_id | creator | ...  | status |
| ---------- | ------- | ---- | ------ |
|            |         |      |        |

有这样一个表格，需要依据status进行分组

```
res = Project_info.objects.values('status').annotate(name=F('status'),value=Count("status")).values("name",'value')
```

再创造一个动作器

```
 def project_countbytimes(self, request, *args, **kwargs):
        res = Project_info.objects.annotate(a=Cast(('created'), output_field=DateField())).values("a").annotate(name=F("a"),values=Count("a")).values("name","values")
            # .annotate(name=Cast(('a'), output_field=DateField()),value=Count(Cast(('a'), output_field=DateField())))
            # .value("name").annotate(name=F("name"),value=Count("value"))

        return Response(data=res, status=status.HTTP_200_OK)
```

在此之中

### values

个人理解像是sql的select，其中的参数是选择的列名

### F（）

官方文档说F 动态获取对象字段的值，可以进行运算。

Django 支持 F() 对象之间以及 F() 对象和常数之间的加减乘除和取余的操作。

其实感觉上就是直接取值

在此案例中，annotate(name='status',value=Count("status"))会报错

### annotate

官方文档的说法是`annotate()` 的每个参数都是一个注解，将被添加到返回的 `QuerySet` 中的每个对象。

但其实感觉用起来像是起别名

## echarts图表

安装echarts依赖

```
npm install echarts -S
```

创建一个JS

```
import * as echarts from 'echarts/core';
import {
    TitleComponent,
    TooltipComponent,
    LegendComponent
} from 'echarts/components';
import { PieChart } from 'echarts/charts';
import { LabelLayout } from 'echarts/features';
import { CanvasRenderer } from 'echarts/renderers';

echarts.use([
    TitleComponent,
    TooltipComponent,
    LegendComponent,
    PieChart,
    CanvasRenderer,
    LabelLayout
]);

export default class pie_Chart {

data=[];
title="";
    constructor(echarts, id, title, rawdata) {		//echarts, id, xdata,seriesdata都是vue组件中传递过来的参数
        this.echarts = echarts;
        this.title=title;
        this.data=rawdata;
        let option = this.getOption()  	//把参数传递给方法
        var myChart = echarts.init(document.getElementById(id));	//获取dom
        myChart.setOption(option);     //暴露出去
        
    }

    //获取数据
    getData(rawdata) {
        this.data = rawdata;
    }

    getOption() {
        let option = {
            title: {
                text: this.title,
                subtext: 'Fake Data',
                left: 'center'
            },
            tooltip: {
                trigger: 'item'
            },
            legend: {
                orient: 'vertical',
                left: 'left'
            },
            series: [
                {
                    name: 'Access From',
                    type: 'pie',
                    radius: '50%',
                    data: this.data,
                    emphasis: {
                        itemStyle: {
                            shadowBlur: 10,
                            shadowOffsetX: 0,
                            shadowColor: 'rgba(0, 0, 0, 0.5)'
                        }
                    }
                }
            ]
        };
        console.log(option)
        return option;
    }
}
```

constructor（)是构造器，选择参数和要使用的方法

然后在页面中引用

```
<template>
<div>
    <div id="pie" style="width: 500px; height: 500px;">
    </div>

</div>
</template>

<script>
import axios from 'axios';

import * as echarts from 'echarts/core';
import {
    TitleComponent,
    TooltipComponent,
    LegendComponent
} from 'echarts/components';
import {
    PieChart
} from 'echarts/charts';
import {
    LabelLayout
} from 'echarts/features';
import {
    CanvasRenderer
} from 'echarts/renderers';
echarts.use([
    TitleComponent,
    TooltipComponent,
    LegendComponent,
    PieChart,
    CanvasRenderer,
    LabelLayout
]);
import pie_Chart from '@/utils/pie_config.js'
export default {
    name: 'projectcharts',
    components: {

    },
    mounted() {
        const that = this
        this.pie_getdata();
        that.test = "2222"
        console.log(this.test);
        //that.charts_init()
        //  this.$nextTick(() => { // 这里的 $nextTick() 方法是为了在下次 DOM 更新循环结束之后执行延迟回调。也就是延迟渲染图表避免一些渲染问题
        //    this.pie_getdata();
        //           this.charts_init();
        //       });

        console.log(this.rawdata)
    },
    methods: {
        pie_getdata() {
            let that = this
            axios
                .get('http://127.0.0.1:8000/api/projectinfo/project_count/')
                .then(response => (that.rawdata = response.data, that.charts_init(), console.log(that.rawdata)))

        },
        charts_init() {

            new pie_Chart(echarts, 'pie', "1111", this.rawdata)

        }
    },
    watch: {
        // rawdata: {
        //     //immediate: true,
        //     deep: true,
        //     handler(newValue, oldValue) {
        //         this.charts_init();
        //     }
        // }
    },
    data() {
        return {
            rawdata: [],
            test: '111'
        }
    },
}
</script>

<style  scoped>

</style>

```

直接new新的，这样就可以创造两个图表了

同时需要在django中增加新的actions

在views.py中

```
class ProjectInfoViewSet(viewsets.ModelViewSet):
    ...
    @action(
        methods=["GET"], detail=False, url_name="count"
    )
    def project_count(self, request, *args, **kwargs):
        res = Project_info.objects.values('status').annotate(name=F('status'),value=Count("status")).values("name",'value')

        return Response(data=res, status=status.HTTP_200_OK)
```

通过action的方式添加新的接口，设置url_name

### VUE渲染echarts问题

直接在mounted()中通过axios获取数据并且初始化图表会出现axio的数据出不来

比如

```
this.rawdata=getdata();//getdata中获取数据
```

此时console.log(this.rawdata)是没有数值，获取不到

推测原因为

axios异步获取，通过控制台看，会和写入操作不同步，因此有方法解决问题

#### 一、在axios里面初始化

```
 methods: {
        pie_getdata() {
            let that = this
            axios
                .get('http://127.0.0.1:8000/api/projectinfo/project_count/')
                .then(response => (that.rawdata = response.data, that.charts_init(), console.log(that.rawdata)))

        },
        charts_init() {

            new pie_Chart(echarts, 'pie', "1111", this.rawdata)

        }
    },
```

修改methods,在axios里用charts_init()进行初始化，这样一定是获取数据后的初始化了

#### 二、通过watch进行实时修改

```
watch: {
            rawdata: {
                //immediate: true,
                deep: true,
                handler(newValue, oldValue) {
                    this.charts_init();
                }
            }
        },
```

这样可以在rawdata改变的时候重新渲染，修改这个方法也可以做到实时渲染

#### 三、promise(未尝试)

```
// 方法1
function initEcharts () {
    // 新建一个promise对象
    let newPromise = new Promise((resolve) => {
        resolve()
    })
    //然后异步执行echarts的初始化函数
    newPromise.then(() => {
        //  此dom为echarts图标展示dom
        echarts.init(DOm)
    })
}

// 方法2
//这里不要用created（用mounted），created这时候还只是创建了实例，但模板还没挂载完成
mounted() {
   this.initData()
}

// 方法3
//用this.$nextTick(()=>{}) (这个回调函数会在数据挂载更新完之后执行，所以可行
this.$nextTick(() => {
        charts = this.$echarts.init(this.$refs.echart)
        charts.clear()
        charts.resize()
        charts.setOption(option)
        this.loading = false
 })
```



## VUE和echarts中的异步问题

https://segmentfault.com/a/1190000007227305

### 同步与异步

① 同步
  当用户使用 js 和浏览器发生交互时，执行到某一个模块时系统发现需要向服务器提供网络请求，这个时候，js 操作就会被阻塞，然后浏览器向服务器发送网络请求。
  我们都知道网络请求的速度会比较慢，在此期间，不管用户执行任何操作，浏览器都不会去执行，因为此时的浏览器正在向服务器发送请求，没有空去理会别的操作，这就是同步，简单可以理解成浏览器的执行是按照某中顺序执行的，只有等上一步完成之后才会继续执行下一步操作。
② 异步
  异步的含义和同步恰恰相反。当用户和浏览器发生交互，执行到某一模块的时候发现需要向服务器发送网络请求时，这个时候，浏览器向服务器发送请求之后，仍然可以执行别的操作。
  当浏览器向服务器发送的请求得到回应后，我们一般会声明一个函数，将请求的结果放到该函数中，用户执行完某些操作后再回调该函数就可以得到向服务器发送网络请求的数据。
  这就是异步，简单的可以理解成一心二用：一边向服务器发送请求，一边执行相关的操作，最后通过回调某个函数来得到向服务器发动请求的数据。

### 回调

**A "callback" is any function that is called by another function which takes the first function as a parameter. （在一个函数中调用另外一个函数就是callback）**

```text
function callback() {
    alert("I am in the callback!");
}

function work(func) {
    alert("I am calling the callback!");
    func(); 
}

work(callback);
```



这就是一个很简单的callback 

callback 作为一个变量传入函数work 中 在work 中被调用

然后来说一下callback 经常的使用场景

**A lot of the time, a "callback" is a function that is called when \*something\* happens. That \*something\* can be called an "event" in programmer-speak.（很多时候 callback 都是用来执行事件驱动的任务 比如有货了通知我 |** **你到家了再叫我做饭 等等之类的 ）**



**回调并不一定就是异步。他们自己并没有直接关系。**

#### 同步回调

**函数被作为参数传递到A函数里，在A函数执行完后再执行B**。

```arcade
function A(callback){
    console.log("I am A");
    callback();  //调用该函数
}

function B(){
   console.log("I am B");
}

A(B);
```

#### 异步回调

因为js是单线程的，但是有很多情况的执行步骤（ajax请求远程数据，IO等）是非常耗时的，如果一直单线程的堵塞下去会导致程序的等待时间过长页面失去响应，影响用户体验了。

如何去解决这个问题呢，我们可以这么想。耗时的我们都扔给异步去做，做好了再通知下我们做完了，我们拿到数据继续往下走。

```qml
var xhr = new XMLHttpRequest();
    xhr.open('POST', url, true);   //第三个参数决定是否采用异步的方式
    xhr.send(data);
    xhr.onreadystatechange = function(){
        if(xhr.readystate === 4 && xhr.status === 200){
                ///xxxx
        }
    }
```

上面是一个代码，浏览器在发起一个`ajax`请求，会单开一个线程去发起http请求，这样的话就能把这个耗时的过程单独去自己跑了，在这个线程的请求过程中，`readystate` 的值会有个变化的过程，每一次变化就触发一次`onreadystatechange` 函数，进行判断是否正确拿到返回结果。

#### 最基础的异步回调实现

就我目前知道两种 `回调函数` 和 `事件监听` ，其实看了阮神的 [异步编程的文章](https://link.segmentfault.com/?enc=szoeDag6RuhOWIWWTmy39Q%3D%3D.ruoY%2FERP697A0w64IpmJj%2BxRhh8%2FlrUxdQj0Bk3jv1boD%2BeD9dS2QeuSB6FJ4mHPNlpswFyOURphCyUB0liVT0eRWPhT%2FhgP18wEAjuyZbc%3D) 和下面的评论之后得出的理解。下面咱们就看看这两种异步编程的方式吧。

#### 回调函数

假定有三个函数

```stylus
f1()

f2()

f3()
```

但是，`f1`执行很耗时，而 `f2`需要在`f1`执行完之后执行。
为了不影响 `f3`的执行，我们可以把`f2`写成`f1`的回调函数。

```scss
//最原始的写法-同步写法

f1(); //耗时很长，严重堵塞
f2(); 
f3(); //导致f3执行受到影响


//改进版-异步写法
function f1(callback){
　　setTimeout(function () {
　　　　// f1的任务代码
　　　　callback();
　　}, 1000);
}

f1(f2); //

f3();
```

上面的写法是利用 `setTimeOut`把`f1`的逻辑包括起来，实现`javascript`中的异步编程。这样的话，f1异步了，不再堵塞`f3`的执行。
顺道说下，js是单线程的，这里所谓的异步也是伪异步，并不是开了多线程的异步。它是什么原理呢，其实是任务栈，`setTimeOut`方法的原理是根据后面的定时时间，过了这个定时时间后，将`f1`加入任务栈，**注意仅仅是加入任务栈，并不是放进去就执行，而是根据任务栈里的任务数量来确定的。**

#### 事件监听

这里我直接用阮神的例子，通过事件触发操作，就是类似于咱们点击事件里的处理逻辑。

同样` f1 , f2 `两个函数。

```stylus
f1()

f2()
```

`f1 `我们给它加一个事件,事件触发 `f2` 函数。

```actionscript
function f1(){
   setTimeOut(function(){
        f1.trigger('click');
    })
}

f1.on('click' , f2);
```

#### 回调地狱

什么是回调地狱，就是异步任务代码的回调函数不断嵌套

```
setTimeout(function() {
    console.log('first');
    setTimeout(function(){
        console.log('second');
        setTimeout(function(){
            console.log('three');
        }, 1000)
    }, 1000)
}, 1000)
// 输出
first
second
three
```

如果只是一个简单的网络请求，这种方案没有什么麻烦，但是当网络请求变得复杂的时候，就会出现回调地狱 。

正因为如此，所以i出现了Promise

### Promise

一般使用`Promise`的方式如下：

```js
const pms = new Promise((resolve, reject) => {
  // do sth.
  if(isMistake) {
    return reject(new Error('It`s a mistake'));
  } else {
    return resolve('You got it!');
  }
});

pms.then(result => {
  console.log(result);
}).catch(error => {
  console.error(error);
});
```

有没有发现？和上面一种对回调函数的使用方式出奇的像？

这里的`resolve`和`reject`正是两个回调函数，就如同前面一个例子里面的`handleSucceed`和`handleFailed`一样。而这两个回调函数的传入方式，从上一个例子的直接两个参数传入，变成了通过`then`方法和`catch`方法来进行传入。

相比而言，`Promise`的方式更加语义化，更容易理解——给主流程留下一个承诺，在之后可以通过该承诺获得子流程的执行结果。

同时，`Promise`还支持一种特殊的写法：

```js
new Promise(resolve => {
  resolve('Hello')
}).then(result => {
  return `${result} world!`;
}).then(result => {
  console.log(result);
});
```

上面这一段代码，将在控制台打印出`Hello world!`字符串。

`Promise`的`then`方法和`catch`方法本身也是返回一个`Promise`对象的，因此可以直接进行链式调用，并且后一次的`then`方法的回调函数的参数是前一次`then`方法返回的结果。

通过这种方式，你会惊喜地发现——回调地狱就这么被解决了。

所以，简而言之：`Promise`就是`callback`风格的一个语法糖（Grammar sugar），它通过实现链式调用的方式来将回调函数的嵌套扁平化来达到解决回调地狱的目的。

而`Promise`的诞生，也为后面更进一步的优化奠定了基础。

### async/await

async/await 是es7出来的， 是es6的promise的升级版，更好地处理 then链式调用，await顾名思义就是‘等一下’（等一下我这个promise异步执行完你下面的再执行）让异步编程做起来更有同步的感觉。简单理解就是，async 声明的函数内的await异步会按照同步执行顺序。

【特点】
 （1）async声明的函数的返回本质上是一个Promise，所以可以用.then
 （2）async必须声明的是一个function，那么await就必须是在当前这个async声明的函数内部使用(而且不能在其子函数内使用)，他两个是配合使用的。

（3）await顾名思义就是等待一会，当且仅当await后面声明的是一个promise还没有返回值，那么下面的程序是不会去执行的！！！让异步编程做起来更有同步的感觉。

常用的申明async的方法：
 // 函数声明
 async function foo() {}
 // 函数表达式
 const foo = async function () {};
 // 箭头函数
 const foo = async () => {};

举个例子：3秒后才执行打印，异步的代码但是同步的feel这正是async/await配合Promise要实现的效果



```jsx
const demo = async ()=>{
    //await申明的只有是一个Promise才可以实现异步的同步执行
    let result = await new Promise((resolve, reject) => {
      setTimeout(()=>{
        //do something
      }, 3000)
    });
    console.log('“我等一会”上面的程序执行完我在打印');
    return '我是返回值';
}
//async的返回值不管是什么类型本质是一个Promise所以可以用.then
demo().then(result=>{
    console.log('输出:',result); // 输出 我延迟了一秒
}).catch((err)=>{ 
    console.log(err);
})
```

和上面同样的代码只是await后面不是一个Promise，直接就执行了打印，3秒后才alert，所以await后面必须是一个Promise才可以异步代码同步执行



```jsx
const demo = async ()=>{
    //await申明的不是Promise实现不了异步的同步执行
    let result = await setTimeout(()=>{
       //do something
       // resolve('我延迟了三秒')
       alert(1)
    }, 3000)
    console.log('“我等一会”上面的程序执行完我在打印');
    return '我是返回值';
}
//async的返回值不管是什么类型本质是一个Promise所以可以用.then
demo().then(result=>{
    console.log('输出:',result); // 输出 我延迟了一秒
}).catch((err)=>{ 
    console.log(err);
})
```

前面介绍async/await说到，通常async/await是跟随Promise一起使用的，而axios又是基于promise封装，所以我们可以将 async/await和axios 结合一起使用。网上很多都是把axios外面又套一层promise那是不科学或者没有理解axios的本质的做法，要知道：axios是promise封装的，本质就是一个promise，所以没必要去套一层promise



```jsx
    const demo =async () => {
        //第一个异步promise（axios）接口请求数据
        const result1 = await this.$axios({
          method: 'post',
          dataType: 'json',
          url: '/customer/selectListByPage', 
          data:{}
        })
        console.log(result1)
        //第二个异步promise（axios）接口请求数据
        const result2 = await this.$axios({
          method: 'post',
          dataType: 'json',
          url: '/customer/selectListByPage', 
          data:{}
        })
        console.log(result2)
        //返回值实质上是一个promise
        return result1+result2
    }
    //调用
    demo().then(result=>{
      console.log('输出:',result); 
    }).catch((err)=>{ 
      console.log(err);
    })
```

还可以写成



```jsx
    const getData1 = (data) => {
        //需要return保证async里面await调用的是一个promise
        return this.$axios({
          method: 'post',
          dataType: 'json',
          url: '/customer/selectListByPage', 
          data:{}
        })
    }
    const getData2 = (data) => {
        //需要return保证async里面await调用的是一个promise
        return this.$axios({
          method: 'post',
          dataType: 'json',
          url: '/customer/selectListByPage', 
          data:{}
        })
    }
    //async/await实例
    const demo =async () => {
        //第一个异步promise（axios）接口请求数据
        const result1 = await getData1()
        console.log(result1)

        //第二个异步promise（axios）接口请求数据
        const result2 = await getData2()
        console.log(result2)

        //返回值实质上是一个promise
        return result1+result2
    }
    //调用
    demo().then(result=>{
      console.log('输出:',result); 
    }).catch((err)=>{ 
      console.log(err);
    })
```



## CSS

居中设置

```
 margin: 0;
    position: absolute;
    top: 50%;
    /* left: 50%; */
    transform: translate(0%, -50%);
```

## VUE

https://zhuanlan.zhihu.com/p/260523407