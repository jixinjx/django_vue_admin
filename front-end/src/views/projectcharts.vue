<template>
<div>
<el-row>
  <el-col :span="12"><div id="pie" style="width: 500px; height: 500px;" ref="pie">   </div></el-col>
   <el-col :span="12"><div id="line" style="width: 500px; height: 500px;" ref="line">   </div></el-col>
</el-row>
<el-row>
  <el-col :span="12"><div class="grid-content bg-purple"></div></el-col>
  <el-col :span="12"><div class="grid-content bg-purple-light"></div></el-col>
</el-row>
<!-- 

    <div>
        <div id="pie" style="width: 500px; height: 500px;" ref="pie">
        </div>
        <div>
            <div id="line" style="width: 500px; height: 500px;" ref="line">
            </div>
        </div>
    </div> -->

</div>
</template>

<script>
import axios from 'axios';

import * as echarts from 'echarts/core';

import pie_Chart from '@/utils/pie_config.js'
import line_Chart from '@/utils/line_config.js'

export default {
    name: 'projectcharts',
    components: {

    },
    mounted() {
        const that = this
        axios
            .get('http://127.0.0.1:8000/api/projectinfo/project_count/')
            .then(response => (that.rawdata = response.data, this.pie_Chart_init(), console.log("Promise1")))
        axios
            .get('http://127.0.0.1:8000/api/projectinfo/project_countbytimes/')
            .then(response => (that.line_data = response.data, this.line_Chart_init(), console.log("Promise2")))
    },
    methods: {
        pie_Chart_init() {
            new pie_Chart(echarts, 'pie', "项目完成情况", this.rawdata)

        },
        line_Chart_init() {

            new line_Chart(echarts, 'line', "新增项目数", this.line_data)
        }
    },
    watch: {
        // rawdata: {
        //     //immediate: true,
        //     deep: true,
        //     handler(newValue, oldValue) {
        //         this.pie_Chart_init();
        //     }
        // },
        //  line_data: {
        //     //immediate: true,
        //     deep: true,
        //     handler(newValue, oldValue) {
        //         this.line_Chart_init();
        //     }
        // }
    },
    data() {
        return {
            rawdata: [],
            line_data: [],
            test: '111'
        }
    },
}
</script>

<style  scoped>

</style>
