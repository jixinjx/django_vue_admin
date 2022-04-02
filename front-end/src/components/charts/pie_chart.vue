<template>
    <div>
<div id="pie" style="width: 500px; height: 500px;">
</div>

    </div>
</template>

<script>
import axios from 'axios';

import * as echarts from 'echarts/core';

import pie_Chart from '@/utils/pie_config.js'
import pie_Chart from '@/utils/pie_config.js'

    export default {
        name:'projectcharts',
        components:{

                
        },
        mounted() {

          this.pie_getdata();
        console.log(this.rawdata)
    //  this.$nextTick(() => { // 这里的 $nextTick() 方法是为了在下次 DOM 更新循环结束之后执行延迟回调。也就是延迟渲染图表避免一些渲染问题
    //    this.pie_getdata();
    //           this.charts_init();
    //       });
    },
        methods: {
           pie_getdata() {
            const that = this
             axios
                .get('http://127.0.0.1:8000/api/projectinfo/project_count/')
                .then(response => (that.rawdata = response.data))

        },
        charts_init(){
            new pie_Chart(echarts,'pie',"项目完成情况",this.rawdata)
        }
        },
        watch: {
            rawdata: {
                //immediate: true,
                deep: true,
                handler(newValue, oldValue) {
                    this.charts_init();
                }
            }
        },
    data() {
        return {
            rawdata: [
      ]
        }
    },
    }
</script>

<style  scoped>

</style>