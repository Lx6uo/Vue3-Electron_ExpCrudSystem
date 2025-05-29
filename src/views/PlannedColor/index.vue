<template>
    <div class="planned-color-container">
        <el-card class="module-header">
            <template #header>
                <div class="card-header">
                    <span>计划用颜色配置</span>
                </div>
            </template>

            <!-- 颜色配置列表 -->
            <el-table :data="plannedColors" @row-click="handleRowClick" height="300px" border stripe
                highlight-current-row style="width: 100%">
                <el-table-column prop="color_code" label="颜色代码" width="120" />
                <el-table-column prop="color_name" label="颜色名称" width="150" />
                <el-table-column label="计划用颜色" width="120">
                    <template #default="scope">
                        <div class="color-preview" :style="{ backgroundColor: scope.row.top_coat_color || '#FFFFFF' }">
                        </div>
                        <span>{{ scope.row.top_coat_color || '' }}</span>
                    </template>
                </el-table-column>
                <el-table-column label="操作" width="150" fixed="right">
                    <template #default="scope">
                        <el-button type="primary" size="small" @click.stop="handleEdit(scope.row)">
                            编辑
                        </el-button>
                        <el-button type="danger" size="small" @click.stop="handleDelete(scope.row.id)">
                            删除
                        </el-button>
                    </template>
                </el-table-column>
            </el-table>
        </el-card>

        <!-- 表单区域 -->
        <el-card class="form-section">
            <el-form ref="formRef" :model="formData" :rules="formRules" label-width="120px" status-icon>
                <el-row :gutter="20">
                    <el-col :span="8">
                        <el-form-item label="颜色代码" prop="color_code">
                            <el-input v-model="formData.color_code" placeholder="请输入颜色代码" />
                        </el-form-item>
                    </el-col>
                    <el-col :span="8">
                        <el-form-item label="颜色名称" prop="color_name">
                            <el-input v-model="formData.color_name" placeholder="请输入颜色名称" />
                        </el-form-item>
                    </el-col>
                    <el-col :span="8">
                        <el-form-item label="计划用颜色" prop="top_coat_color">
                            <el-color-picker v-model="formData.top_coat_color" show-alpha />
                        </el-form-item>
                    </el-col>
                </el-row>

                <div style="margin-top: 30px;">
                    <el-form-item>
                        <el-button type="primary" @click="submitForm">{{ formData.id ? '更新' : '添加' }}</el-button>
                        <el-button @click="resetForm">重置</el-button>
                    </el-form-item>
                </div>
            </el-form>
        </el-card>
    </div>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted } from 'vue'
import { ElMessage, ElMessageBox, FormInstance } from 'element-plus'

// 表单引用
const formRef = ref<FormInstance>()

// 状态定义
const plannedColors = ref<any[]>([])

// 表单数据
const formData = reactive({
    id: null as number | null,
    color_code: '',
    color_name: '',
    top_coat_color: ''
})

// 表单验证规则
const formRules = {
    color_code: [
        { required: true, message: '请输入颜色代码', trigger: 'blur' },
    ],
    color_name: [
        { required: true, message: '请输入颜色名称', trigger: 'blur' },
    ],
    top_coat_color: [
        { required: true, message: '请选择计划用颜色', trigger: 'change' },
    ],
}

// 生命周期钩子
onMounted(async () => {
    await loadPlannedColors()
})

// 加载计划用颜色数据
async function loadPlannedColors() {
    try {
        const result = await window.api.getPlannedColors()
        plannedColors.value = result || [] // 确保返回空数组而不是undefined
    } catch (error) {
        ElMessage.error('加载计划用颜色数据失败')
        console.error(error)
    }
}

// 处理行点击
function handleRowClick(row: any) {
    Object.assign(formData, row)
}

// 处理编辑
function handleEdit(row: any) {
    Object.assign(formData, row)
}

// 处理删除
async function handleDelete(id: number) {
    try {
        await ElMessageBox.confirm('确定要删除该颜色配置吗？', '警告', {
            confirmButtonText: '确定',
            cancelButtonText: '取消',
            type: 'warning'
        })

        await window.api.deletePlannedColor(id)
        ElMessage.success('删除成功')
        await loadPlannedColors()
        resetForm()
    } catch (error: any) {
        if (error !== 'cancel') {
            ElMessage.error('删除失败')
            console.error(error)
        }
    }
}

// 提交表单
async function submitForm() {
    if (!formRef.value) return

    await formRef.value.validate(async (valid) => {
        if (valid) {
            try {
                // 创建普通对象副本，避免传递响应式对象
                const submitData = {
                    id: formData.id,
                    color_code: formData.color_code,
                    color_name: formData.color_name,
                    top_coat_color: formData.top_coat_color
                }

                if (formData.id) {
                    await window.api.updatePlannedColor(submitData)
                    ElMessage.success('更新成功')
                } else {
                    await window.api.addPlannedColor(submitData)
                    ElMessage.success('添加成功')
                }

                await loadPlannedColors()
                resetForm()
            } catch (error) {
                ElMessage.error('操作失败')
                console.error(error)
            }
        }
    })
}

// 重置表单
function resetForm() {
    formRef.value?.resetFields()
    Object.assign(formData, {
        id: null,
        color_code: '',
        color_name: '',
        top_coat_color: ''
    })
}
</script>

<style scoped>
.planned-color-container {
    display: flex;
    flex-direction: column;
    gap: 20px;
    height: 100%;
}

.module-header {
    flex: 1;
    overflow: auto;
}

.card-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
}

.form-section {
    flex: 0 0 auto;
}

.color-preview {
    display: inline-block;
    width: 20px;
    height: 20px;
    border: 1px solid #ddd;
    margin-right: 8px;
    vertical-align: middle;
}
</style>