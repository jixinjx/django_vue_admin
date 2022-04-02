import * as echarts from 'echarts/core';
import { GridComponent } from 'echarts/components';
import { LineChart } from 'echarts/charts';
import { UniversalTransition } from 'echarts/features';
import { CanvasRenderer } from 'echarts/renderers';

echarts.use([GridComponent, LineChart, CanvasRenderer, UniversalTransition]);


export default class line_Chart {

    data=[];
    title="";
    data_name=[];
    data_value=[];
        constructor(echarts, id, title, rawdata) {		//echarts, id, xdata,seriesdata都是vue组件中传递过来的参数
            this.echarts = echarts;
            this.title=title;
            this.data=rawdata;
            this.process_data(rawdata)
            console.log(rawdata)
            let option = this.getOption()  	//把参数传递给方法
            var myChart = echarts.init(document.getElementById(id));	//获取dom
            myChart.setOption(option);     //暴露出去
            
        }
        //处理数据
        process_data(data){
          for (var i in data)
          {
            this.data_name.push(data[i].name);
            console.log(data[i].key)
            this.data_value.push(data[i].values)
          }
          console.log(this.data_name)
        }
        //获取数据
        getData(rawdata) {
            this.data = rawdata;
        }
    
        getOption() {
            let option = 
            option = {
                title: {
                    text: this.title,
                    subtext: 'Fake Data',
                    left: 'center'
                },
              xAxis: {
                data:  this.data_name
              },
              yAxis: {
                type: 'value'
              },
              series: [
                {
                  data:  this.data_value,
                  type: 'line',
                  label: {
                    show: true,
                    position: 'top'
                  },
                },
                
              ]
            };
            console.log(option)
            return option;
        }


}