<template>
    <div>
        <el-card class="box-card">
  <div id="user-center">
        <h3>用户登录</h3>


<el-form label-width="120px">
  <el-form-item label="用户名：">
     <el-input placeholder="输入用户名" v-model="username" ></el-input>
  </el-form-item>
  <el-form-item label="请输入密码">
 <el-input placeholder="请输入密码" v-model="password" show-password></el-input>  </el-form-item>
   <el-form-item >
 <el-button type="primary" v-on:click.prevent="sign_in" >登录</el-button>  </el-form-item>
</el-form>


    </div>
</el-card>

    </div>
</template>

<script>

  import axios from 'axios';
   import authorization from '@/utils/authorization';
      const storage = localStorage;
    export default {
        
          name: 'login',
          data() {
              return {
                  name: '',
                  username:'',
                  password:'',
              }
          },
          methods: {
              sign_in() {
                  const that=this
                  axios
                    .post('http://127.0.0.1:8000/api/token/', {
                        username: that.username,
                        password: that.password,
                    })
                    .then(function (response){
                        const storage = localStorage;
                        // Date.parse(...) 返回1970年1月1日UTC以来的毫秒数
                        // Token 被设置为1分钟，因此这里加上60000毫秒
                        const expiredTime = Date.parse(response.headers.date) + 60000;
                          // 设置 localStorage
                        storage.setItem('access.center', response.data.access);
                        storage.setItem('refresh.center', response.data.refresh);
                        storage.setItem('expiredTime.center', expiredTime);
                        storage.setItem('username.center', that.username);
                        // 路由跳转
                        // 登录成功后回到博客首页
                        that.name=that.username;
                        console.log("登录成功")
                        that.$router.push({name: 'Home'});
                    })
                  
              }
          },
    }
</script>

<style scoped>
 .box-card {
    width: 20%;
    height: 30%;
    margin: 0;
    position: absolute;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
  }
  .el-input{
    width: 120px;
  }
</style>