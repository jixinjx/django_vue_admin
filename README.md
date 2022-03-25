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
>  ...,
>  "corsheaders",
>  ...,
> ]
> ```
>
> Make sure you add the trailing comma or you might get a `ModuleNotFoundError` (see [this blog post](https://adamj.eu/tech/2020/06/29/why-does-python-raise-modulenotfounderror-when-modifying-installed-apps/)).
>
> You will also need to add a middleware class to listen in on responses:
>
> ```
> MIDDLEWARE = [
>  ...,
>  "corsheaders.middleware.CorsMiddleware",
>  "django.middleware.common.CommonMiddleware",
>  ...,
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

## CSS

居中设置

```
 margin: 0;
    position: absolute;
    top: 50%;
    /* left: 50%; */
    transform: translate(0%, -50%);
```

