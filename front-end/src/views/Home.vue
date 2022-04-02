<template>
<div id="app_div">
    <el-container>
        <el-header><Header /></el-header>
        <div id="app_div">
        <el-container>
            <el-aside width="200px" >
                <navmenu></navmenu>
            </el-aside>
            <el-main>
                <router-view></router-view>
                </el-main>
        </el-container>
        </div>
    </el-container>
</div>
</template>

<script>
import NavMenu from '@/components/NavMenu'
import Header from '@/components/Header'
export default {
    name: 'Home',
     components: {'navmenu': NavMenu,
                'Header':Header,
  }
}
</script>

<style scoped>
html,body,.el-container{
  width:100%;
 height: 100%;
}
#app_div{
     height: 100%;
}
.el-header{
    padding: 0;
}
/* .el-aside{
    height: 100%;
} */
</style>
