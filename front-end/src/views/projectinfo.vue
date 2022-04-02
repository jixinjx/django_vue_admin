<template>
<div>
    <el-row>
        <el-col :span="12">
            <el-button type="primary" @click="dialogFormVisible = true">新增</el-button>
        </el-col>
        <el-col :span="12">
            <div>
                <el-input v-model="search_text" placeholder="请输入内容"></el-input>
                <el-button type="primary" v-on:click.prevent="search_project">搜索</el-button>
            </div>
        </el-col>
    </el-row>
    <el-row>

        <el-col :span="24">
            <el-table :data="info" border style="width: 100%">
                <el-table-column fixed prop="Project_id" label="项目id" min-width="150">
                </el-table-column>
                <el-table-column prop="title" label="项目名称" min-width="120">
                </el-table-column>
                <el-table-column prop="body" label="内容" min-width="120">
                </el-table-column>
                <el-table-column prop="created" label="创建时间" min-width="120">
                </el-table-column>
                <el-table-column prop="updated" label="更新时间" min-width="300">
                </el-table-column>
                <el-table-column prop="status" label="状态" min-width="120">
                </el-table-column>
                <el-table-column fixed="right" label="操作" min-width="100">
                    <template >
                        <el-button @click="delete_project" type="text" size="small">删除</el-button>
                        <el-button type="text" size="small">编辑</el-button>
                    </template>
                </el-table-column>
            </el-table>
        </el-col>
    </el-row>

    <el-dialog title="新增项目" :visible.sync="dialogFormVisible">
        <el-form :model="form">
            <el-form-item label="项目id" :label-width="formLabelWidth">
                <el-input v-model="form.Project_id" autocomplete="off"></el-input>
            </el-form-item>
            <el-form-item label="项目名称" :label-width="formLabelWidth">
                <el-input v-model="form.title" autocomplete="off"></el-input>
            </el-form-item>
            <el-form-item label="内容" :label-width="formLabelWidth">
                <el-input v-model="form.body" autocomplete="off"></el-input>
            </el-form-item>
            <el-form-item label="状态" :label-width="formLabelWidth">
                <el-input v-model="form.status" autocomplete="off"></el-input>
            </el-form-item>
        </el-form>
        <div slot="footer" class="dialog-footer">
            <el-button @click="dialogFormVisible = false">取 消</el-button>
            <el-button type="primary" @click="add_new">确 定</el-button>
        </div>
    </el-dialog>
    
    <div class="block" v-if="mounted_status">
        <el-pagination layout="prev, pager, next" :page-count="page_count" :current-page="page_current" @current-change="page_switch" @prev-click="page_prev" @next-click="page_next">
        </el-pagination>
    </div>

</div>
</template>

<script>
import axios from 'axios';
export default {
    methods: {
        delete_project(){},
        handleClick(row) {
            console.log(row);
        },
        search_project() {
            const text = this.search_text.trim();
            let that=this;
            if (text.charAt(0) !== '') {
                axios
                    .get('http://127.0.0.1:8000/api/projectinfo/' + '?search=' + text)
                    .then(response => (this.info = response.data.results, that.page_count=response.data.total_pages,that.page_current=response.data.page_number))
                    that.project_info_url='http://127.0.0.1:8000/api/projectinfo/' + '?search=' + text
                    
                console.log(this.info)
            } else {
                axios
                    .get('http://127.0.0.1:8000/api/projectinfo/')
                    .then(response => (this.info = response.data.results, that.page_count=response.data.total_pages,that.page_current=response.data.page_number))
                     that.project_info_url='http://127.0.0.1:8000/api/projectinfo/'
            }
        },
        add_new() {
            const that = this;
            console.log(that.form)
            const token = localStorage.getItem('access.center');
            axios
                .post('http://127.0.0.1:8000/api/projectinfo/', {
                    Project_id: that.form.Project_id,
                    title: that.form.title,
                    body: that.form.body,
                    status: that.form.status,

                }, {
                        headers: {Authorization: 'Bearer ' + token}
                    })
                .then(function (response) {
                     that.search_project();
                    alert('增加成功');
                })
                .catch(function (error) {
                    alert(error.message);
                    // Handling Error here...
                    // https://github.com/axios/axios#handling-errors
                });
            console.log('11')
            that.dialogFormVisible = false

        },
        get_projectinfo_page_url(page) {
            let that=this;
            axios
                .get(that.project_info_url+'?&page='+page)
                .then(response => (this.info = response.data.results))
                console.log(that.project_info_url+'?&page='+page)
        },
        page_switch(val) {
            console.log(this.page_current)
            this.page_current=val;
           
        },
        page_prev(val){
            this.page_current=val;

        },
        page_next(val){
             this.page_current=val;
        },
        page_change(val){
            this.page_current=val;
        }

    },

    data() {
        return {
            project_info_url:"http://127.0.0.1:8000/api/projectinfo/",
            mounted_status:false,
            search_status:false,
            search_text: "",
            info: [],
            dialogFormVisible: false,
            form: {
                Project_id: '',
                title: '',
                body: '',
                created: '',
                updated: '',
                status: '',
                resource: '',
                desc: ''
            },
            formLabelWidth: '120px',
            page_current: 0,
            page_count: 10
        }
    },
    mounted() {
        let that=this;
        axios
            .get('http://127.0.0.1:8000/api/projectinfo/')
            .then(response => (that.info = response.data.results, that.page_count=response.data.total_pages),
            that.mounted_status=true)
        console.log(that.info)
        console.log(that.info.count)
    },
   watch: {
      page_current:function(val)
      {
          //console.log(val)
          this.get_projectinfo_page_url(val)
      }
   },

}
</script>

<style>
.el-input {
    width: 30%;
}
</style>
