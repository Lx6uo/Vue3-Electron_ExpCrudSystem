<template>
    <div class="special-engine-container">
        <el-card class="module-header">
            <template #header>
                <div class="card-header">
                    <span>特殊发动机</span>
                </div>
            </template>

            <!-- 特殊发动机列表 -->
            <el-table :data="specialEngines" @row-click="handleRowClick" height="300px" border stripe
                highlight-current-row style="width: 100%">
                <el-table-column prop="engine_code" label="发动机代码" width="120" />
                <el-table-column prop="engine_name" label="发动机名称" width="150" />
                <el-table-column prop="gear" label="档位" width="120" />
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
                        <el-form-item label="发动机代码" prop="engine_code">
                            <el-input v-model="formData.engine_code" placeholder="请输入发动机代码"
                                @input="handleEngineCodeInput" />
                        </el-form-item>
                    </el-col>
                    <el-col :span="8">
                        <el-form-item label="发动机名称" prop="engine_name">
                            <el-input v-model="formData.engine_name" placeholder="请输入发动机名称" />
                        </el-form-item>
                    </el-col>
                    <el-col :span="8">
                        <el-form-item label="档位" prop="gear">
                            <el-input v-model="formData.gear" placeholder="请输入档位" />
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
const specialEngines = ref<any[]>([])

// 表单数据
const formData = reactive({
    id: null as number | null,
    engine_code: '',
    engine_name: '',
    gear: ''
})

// 表单验证规则
const formRules = {
    engine_code: [
        { required: true, message: '请输入发动机代码', trigger: 'blur' },
        { pattern: /^[A-Z0-9]{4,10}$/, message: '发动机代码必须为4-10位大写字母或数字', trigger: 'blur' }
    ],
    engine_name: [
        { required: true, message: '请输入发动机名称', trigger: 'blur' },
    ],
    gear: [
        { required: true, message: '请输入档位', trigger: 'blur' },
    ]
}

// 生命周期钩子
onMounted(async () => {
    await loadSpecialEngines()
})

// 加载特殊发动机数据
async function loadSpecialEngines() {
    try {
        const result = await window.api.getSpecialEngines()
        specialEngines.value = result || [] // 确保返回空数组而不是undefined
    } catch (error) {
        ElMessage.error('加载特殊发动机数据失败')
        console.error(error)
    }
}

// 处理发动机代码输入，自动转为大写
function handleEngineCodeInput(value: string) {
    formData.engine_code = value.toUpperCase()
}

// 处理行点击
function handleRowClick(row: any) {
    Object.assign(formData, {
        id: row.id,
        engine_code: row.engine_code,
        engine_name: row.engine_name,
        gear: row.gear
    })
}

// 处理编辑
function handleEdit(row: any) {
    Object.assign(formData, {
        id: row.id,
        engine_code: row.engine_code,
        engine_name: row.engine_name,
        gear: row.gear
    })
}

// 处理删除
async function handleDelete(id: number) {
    try {
        await ElMessageBox.confirm('确定要删除该特殊发动机吗？', '警告', {
            confirmButtonText: '确定',
            cancelButtonText: '取消',
            type: 'warning'
        })

        await window.api.deleteSpecialEngine(id)
        ElMessage.success('删除成功')
        await loadSpecialEngines()
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

    // 将发动机代码转为大写（在验证之前）
    formData.engine_code = formData.engine_code.toUpperCase()

    await formRef.value.validate(async (valid) => {
        if (valid) {
            try {
                // 创建普通对象副本，避免传递响应式对象
                const submitData = {
                    id: formData.id,
                    engine_code: formData.engine_code,
                    engine_name: formData.engine_name,
                    gear: formData.gear
                }

                if (formData.id) {
                    await window.api.updateSpecialEngine(submitData)
                    ElMessage.success('更新成功')
                } else {
                    await window.api.addSpecialEngine(submitData)
                    ElMessage.success('添加成功')
                }

                await loadSpecialEngines()
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
    formData.id = null
    formData.engine_code = ''
    formData.engine_name = ''
    formData.gear = ''
}
</script>

<style scoped>
.special-engine-container {
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
</style>