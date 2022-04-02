import * as echarts from 'echarts/core';
import {
    TitleComponent,
    TooltipComponent,
    LegendComponent
} from 'echarts/components';
import { PieChart } from 'echarts/charts';
import { LabelLayout } from 'echarts/features';
import { CanvasRenderer } from 'echarts/renderers';

echarts.use([
    TitleComponent,
    TooltipComponent,
    LegendComponent,
    PieChart,
    CanvasRenderer,
    LabelLayout
]);

export default class pie_Chart {

data=[];
title="";
    constructor(echarts, id, title, rawdata) {		//echarts, id, xdata,seriesdata都是vue组件中传递过来的参数
        this.echarts = echarts;
        this.title=title;
        this.data=rawdata;
        let option = this.getOption()  	//把参数传递给方法
        var myChart = echarts.init(document.getElementById(id));	//获取dom
        myChart.setOption(option);     //暴露出去
        
    }

    //获取数据
    getData(rawdata) {
        this.data = rawdata;
    }

    getOption() {
        let option = {
            title: {
                text: this.title,
                subtext: 'Fake Data',
                left: 'center'
            },
            tooltip: {
                trigger: 'item'
            },
            legend: {
                orient: 'vertical',
                left: 'left'
            },
            series: [
                {
                    name: 'Access From',
                    type: 'pie',
                    radius: '50%',
                    data: this.data,
                    emphasis: {
                        itemStyle: {
                            shadowBlur: 10,
                            shadowOffsetX: 0,
                            shadowColor: 'rgba(0, 0, 0, 0.5)'
                        }
                    },
                    label: {
                        formatter: '{b}: {c} '}
                }
            ]
        };
        console.log(option)
        return option;
    }
}