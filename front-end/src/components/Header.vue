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