<template>
  <el-row class="tac">
    <el-col :span="24">
      <el-menu default-active="2" class="el-menu-vertical-demo" @open="handleOpen" @close="handleClose"
      :unique-opened="true"
      router
      overflow-y: scroll
      
      background-color="#545c64" text-color="#fff" active-text-color="#ffd04b">

      
        <el-submenu  v-for="item in menu" v-bind:key="item.name" :index="item.name">
          <template slot="title">
            <i class="el-icon-location"></i>
            <span>{{item.name}}</span>
          </template>
          <el-menu-item-group v-for="sub in item.sub" v-bind:key="sub.name">
            <el-menu-item :index="sub.path">{{sub.subname}}</el-menu-item>
          </el-menu-item-group>
        </el-submenu>


      </el-menu>
    </el-col>
  </el-row>
</template>

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

<style scoped>

.el-row,.el-menu,.el-col{
    height: 100%;
}
</style>
