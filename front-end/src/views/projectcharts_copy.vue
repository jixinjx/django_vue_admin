<template>
<div>
    <div>
    <div id="pie" style="width: 500px; height: 500px;" ref="pie">
    </div>
    <div>
    <div id="line" style="width: 500px; height: 500px;" ref="line">
  </div>
    </div>
    </div>

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
        this.promise1();
                this.promise2();

        // this.pie_getdata();
        // this.line_getdata()
        // that.test = "2222"
        // console.log(this.test);
        // //that.charts_init()
        // //  this.$nextTick(() => { // 这里的 $nextTick() 方法是为了在下次 DOM 更新循环结束之后执行延迟回调。也就是延迟渲染图表避免一些渲染问题
        // //    this.pie_getdata();
        // //           this.charts_init();
        // //       });

        // console.log(this.rawdata)
    },
    methods: {
      async  pie_getdata() {
            let that = this
            axios.all([ axios
                .get('http://127.0.0.1:8000/api/projectinfo/project_count/')
                .then(response => (that.rawdata = response.data,  console.log(that.rawdata))),
            axios
                .get('http://127.0.0.1:8000/api/projectinfo/project_countbytimes/')
                .then(response => (that.line_data = response.data, console.log(that.line_data)))])
           .then(axios.spread((val1,val2) =>{console.log("axios")}))

        },
        promise1() {
return new Promise((resolve, reject) => {
     let that = this
    //这里模拟异步动作，一般来说可以放置Ajax请求, 'promise1-result'为请求成功后的返回结果
    //注：Promise实例只能通过resolve 或 reject 函数来返回，并用then()或者catch()获取
    //不能在里面直接return ... 这样是获取不到Promise返回值的
    axios
                .get('http://127.0.0.1:8000/api/projectinfo/project_count/')
                .then(response => (that.rawdata = response.data, this.pie_Chart_init(), console.log("Promise1")))
                
    setTimeout(() => resolve('promise1-result'), 1000)
})
},
  promise2() {
return new Promise((resolve, reject) => {
     let that = this
    //这里模拟异步动作，一般来说可以放置Ajax请求, 'promise1-result'为请求成功后的返回结果
    //注：Promise实例只能通过resolve 或 reject 函数来返回，并用then()或者catch()获取
    //不能在里面直接return ... 这样是获取不到Promise返回值的
    axios
                .get('http://127.0.0.1:8000/api/projectinfo/project_countbytimes/')
                .then(response => (that.line_data = response.data,  this.line_Chart_init(),console.log("Promise2")))
               
    setTimeout(() => resolve('promise1-result'), 1000)
})
},

         line_getdata() {
            // let that = this
            // axios
            //     .get('http://127.0.0.1:8000/api/projectinfo/project_countbytimes/')
            //     .then(response => (that.line_data = response.data, console.log(that.line_data)))

        },

        pie_Chart_init() {
            new pie_Chart(echarts, 'pie', "1111", this.rawdata)
        
        },
        line_Chart_init() {
      
            new line_Chart(echarts,'line', "1111", this.line_data)
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
            line_data:[],
            test: '111'
        }
    },
}
</script>

<style  scoped>

</style>
