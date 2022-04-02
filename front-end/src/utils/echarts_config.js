export default class Chart { 
    constructor(echarts, id, xdata,seriesdata) {		//echarts, id, xdata,seriesdata都是vue组件中传递过来的参数
    this.echarts = echarts;
    let option = this.getOption(xdata,seriesdata)  	//把参数传递给方法
    var myChart = echarts.init(document.getElementById(id));	//获取dom
    myChart.setOption(option);     //暴露出去
}}