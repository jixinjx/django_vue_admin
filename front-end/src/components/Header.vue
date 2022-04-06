<template>
<el-row>
    <el-col :span="18">
        <div class="head-wrap">Element</div>
    </el-col>
    <el-col :span="5">
        <div v-if="hasLogin" class="login_info">
            <el-dropdown size="medium">
                <span class="el-dropdown-link">
                    {{username}}<i class="el-icon-arrow-down el-icon--right"></i>
                </span>
                <el-dropdown-menu slot="dropdown">
                    <el-dropdown-item v-on:click.native="signout">登出</el-dropdown-item>
                   
                </el-dropdown-menu>
            </el-dropdown>
        </div>
        <div v-else class="login_info">
            <router-link to="/login" class="login-link">
                <el-button>登录</el-button>
            </router-link>
        </div>
    </el-col>
</el-row>
</template>

<script>
import axios from 'axios';
import authorization from '@/utils/authorization';
export default {
    name: 'Pheader',
    data() {
        return {
            hasLogin: false,
            username: ''
        }
    },
    mounted() {
        // const that = this;
        //       const storage = localStorage;
        //       // 过期时间
        //       const expiredTime = Number(storage.getItem('expiredTime.center'));
        //       // 当前时间
        //       const current = (new Date()).getTime();
        //       // 刷新令牌
        //       const refreshToken = storage.getItem('refresh.center');
        //       // 用户名
        //       that.username = storage.getItem('username.center');

        //       // 初始 token 未过期
        //       if (expiredTime > current) {
        //           that.hasLogin = true;
        //       }
        //       // 初始 token 过期
        //       // 如果有刷新令牌则申请新的token
        //       else if (refreshToken !== null) {
        //           axios
        //               .post('http://127.0.0.1:8000/api/token/refresh/', {
        //                   refresh: refreshToken,
        //               })
        //               .then(function (response) {
        //                   const nextExpiredTime = Date.parse(response.headers.date) + 60000;

        //                   storage.setItem('access.center', response.data.access);
        //                   storage.setItem('expiredTime.center', nextExpiredTime);
        //                   storage.removeItem('refresh.center');

        //                   that.hasLogin = true;
        //               })
        //               .catch(function () {
        //                   // .clear() 清空当前域名下所有的值
        //                   // 慎用
        //                   storage.clear();
        //                   that.hasLogin = false;
        //               })
        //       }
        //       // 无任何有效 token
        //       else {
        //           storage.clear();
        //           that.hasLogin = false;
        //       }
        authorization().then((data) => [this.hasLogin, this.username] = data);

    },
    methods: {
      signout() {
         const storage = localStorage;
        const that = this;
          storage.clear();
          that.hasLogin = false;
          console.log(that.hasLogin)
      }
    },
}
</script>

<style scoped>
.login_info {
    float: right;
}

.el-row {
    height: 100%;
    width: 100%;
    background-color: #409EFF;
    color: #fff;
}

.el-col {
    height: 100%;
}

.head-wrap {
    margin: 0;
    position: absolute;
    top: 50%;
    left: 4%;
    /* left: 50%; */
    transform: translate(0%, -50%);
    font-size: 30px;
}
.el-dropdown{
  font-size: 25px;
}

 .el-dropdown-link {
    cursor: pointer;
    color: #409EFF;
  }
  .el-icon-arrow-down {
    font-size: 12px;
  }
  .el-dropdown-link{
    color: #fff;
  }
</style>
