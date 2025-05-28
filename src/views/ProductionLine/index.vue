<template>
    <div class="production-line-container">
        <el-card class="module-header">
            <template #header>
                <div class="card-header">
                    <span>生产线信息</span>
                    <el-button type="primary" @click="resetForm">新增生产线</el-button>
                </div>
            </template>

            <!-- 生产线列表 -->
            <el-table :data="productionLines" @row-click="handleRowClick" height="300px" border stripe
                highlight-current-row style="width: 100%">
                <el-table-column prop="line_type" label="生产线类型" width="100" />
                <el-table-column prop="line_number" label="生产线编号" width="120" />
                <el-table-column prop="line_name" label="生产线名称" width="150" />
                <el-table-column prop="shift" label="生产线班次" width="100" />
                <el-table-column prop="speed" label="线速" width="100" />
                <el-table-column prop="efficiency" label="运行效率" width="100" />
                <el-table-column prop="group" label="生产线分组" width="100" />
                <el-table-column prop="flow_code" label="流向代码" width="100" />
                <el-table-column prop="abbreviation" label="生产线编号简称" width="150" />
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
            <el-tabs v-model="activeFormTab">
                <el-tab-pane label="生产线公共信息录入" name="common">
                    <el-form ref="formRef" :model="formData" :rules="formRules" label-width="120px" status-icon>
                        <el-row :gutter="20">
                            <el-col :span="8">
                                <el-form-item label="生产线编号" prop="line_number">
                                    <el-input v-model="formData.line_number" placeholder="请输入生产线编号"
                                        @input="handleLineNumberInput" />
                                </el-form-item>
                            </el-col>
                            <el-col :span="8">
                                <el-form-item label="生产线名称" prop="line_name">
                                    <el-input v-model="formData.line_name" placeholder="请输入生产线名称"
                                        @input="handleLineNameInput" />
                                </el-form-item>
                            </el-col>
                            <el-col :span="8">
                                <el-form-item label="生产线类型" prop="line_type">
                                    <el-select v-model="formData.line_type" placeholder="请选择生产线类型" style="width: 100%">
                                        <el-option label="车身" value="车身" />
                                        <el-option label="涂装" value="涂装" />
                                        <el-option label="总装" value="总装" />
                                    </el-select>
                                </el-form-item>
                            </el-col>
                        </el-row>

                        <el-row :gutter="20">
                            <el-col :span="8">
                                <el-form-item label="生产线班次" prop="shift">
                                    <el-input-number v-model="formData.shift" :min="0" :precision="0"
                                        style="width: 100%" />
                                </el-form-item>
                            </el-col>
                            <el-col :span="8">
                                <el-form-item label="线速" prop="speed">
                                    <el-input-number v-model="formData.speed" :min="0" :precision="2"
                                        style="width: 100%" />
                                </el-form-item>
                            </el-col>
                            <el-col :span="8">
                                <el-form-item label="运行效率" prop="efficiency">
                                    <el-input-number v-model="formData.efficiency" :min="0" :max="1" :precision="2"
                                        :step="0.01" style="width: 100%" />
                                </el-form-item>
                            </el-col>
                        </el-row>

                        <el-row :gutter="20">
                            <el-col :span="8">
                                <el-form-item label="生产线分组" prop="group">
                                    <el-input-number v-model="formData.group" :min="0" :precision="0"
                                        style="width: 100%" />
                                </el-form-item>
                            </el-col>
                            <el-col :span="8">
                                <el-form-item label="流向代码" prop="flow_code">
                                    <el-input v-model="formData.flow_code" placeholder="请输入流向代码" />
                                </el-form-item>
                            </el-col>
                            <el-col :span="8">
                                <el-form-item label="生产线简称" prop="abbreviation">
                                    <el-input v-model="formData.abbreviation" placeholder="请输入生产线简称" />
                                </el-form-item>
                            </el-col>
                        </el-row>

                        <el-form-item>
                            <el-button type="primary" @click="submitForm">{{ formData.id ? '更新' : '添加' }}</el-button>
                            <el-button @click="resetForm">重置</el-button>
                        </el-form-item>
                    </el-form>
                </el-tab-pane>

                <el-tab-pane label="生产线特殊信息录入" name="special">
                    <div v-if="!selectedLineId" class="empty-tip">
                        请先选择一条生产线
                    </div>
                    <template v-else>
                        <!-- 车身或总装线 -->
                        <div v-if="formData.line_type === '车身' || formData.line_type === '总装'">
                            <h3>白车身码管理</h3>
                            <el-row :gutter="20" style="margin-bottom: 20px;">
                                <el-col :span="6">
                                    <el-input v-model="specialCodeInput" placeholder="请输入白车身码 (3位)" maxlength="3"
                                        @input="handleWhiteBodyCodeInput" />
                                </el-col>
                                <el-col :span="4">
                                    <el-button type="primary" @click="addSpecialCode('WhiteBodyCode')"
                                        :disabled="!isValidWhiteBodyCode">添加</el-button>
                                </el-col>
                            </el-row>

                            <el-table :data="specialCodes" border style="width: 100%" max-height="300px">
                                <el-table-column prop="code_value" label="白车身码" />
                                <el-table-column label="操作" width="120">
                                    <template #default="scope">
                                        <el-button type="danger" size="small" @click="deleteSpecialCode(scope.row.id)">
                                            删除
                                        </el-button>
                                    </template>
                                </el-table-column>
                            </el-table>
                        </div>

                        <!-- 涂装线 -->
                        <div v-else-if="formData.line_type === '涂装'">
                            <h3>颜色码管理</h3>
                            <el-row :gutter="20" style="margin-bottom: 20px;">
                                <el-col :span="6">
                                    <el-input v-model="specialCodeInput" placeholder="请输入颜色码 (2位数字)" maxlength="2"
                                        @input="validateColorCode" />
                                </el-col>
                                <el-col :span="4">
                                    <el-button type="primary" @click="addSpecialCode('ColorCode')"
                                        :disabled="!isValidColorCode">添加</el-button>
                                </el-col>
                            </el-row>

                            <el-table :data="specialCodes" border style="width: 100%" max-height="300px">
                                <el-table-column prop="code_value" label="颜色码" />
                                <el-table-column label="操作" width="120">
                                    <template #default="scope">
                                        <el-button type="danger" size="small" @click="deleteSpecialCode(scope.row.id)">
                                            删除
                                        </el-button>
                                    </template>
                                </el-table-column>
                            </el-table>
                        </div>
                    </template>
                </el-tab-pane>
            </el-tabs>
        </el-card>
    </div>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted, watch, computed } from 'vue'
import { ElMessage, ElMessageBox, FormInstance } from 'element-plus'

// 表单引用
const formRef = ref<FormInstance>()

// 状态定义
const productionLines = ref<any[]>([])
const selectedLineId = ref<number | null>(null)
const activeFormTab = ref('common')
const specialCodes = ref<any[]>([])
const specialCodeInput = ref('')

// 表单数据
const formData = reactive({
    id: null as number | null,
    line_number: '',
    line_name: '',
    line_type: '车身',
    shift: 0,
    speed: 0,
    efficiency: 0,
    group: 0,
    flow_code: '',
    abbreviation: ''
})

// 表单验证规则
const formRules = {
    line_number: [
        { required: true, message: '请输入生产线编号', trigger: 'blur' },
    ],
    line_name: [
        { required: true, message: '请输入生产线名称', trigger: 'blur' },
    ],
    line_type: [
        { required: true, message: '请选择生产线类型', trigger: 'change' },
    ],
}

// 计算属性：验证白车身码是否有效（3位字母或数字）
const isValidWhiteBodyCode = computed(() => {
    return /^[A-Z0-9]{3}$/.test(specialCodeInput.value)
})

// 计算属性：验证颜色码是否有效（2位数字）
const isValidColorCode = computed(() => {
    return /^\d{2}$/.test(specialCodeInput.value)
})

// 生命周期钩子
onMounted(async () => {
    await loadProductionLines()
})

// 监听选中的生产线变化，加载特殊信息
watch([selectedLineId, formData, activeFormTab], async ([newLineId, newFormData, newTab]) => {
    if (newLineId && newTab === 'special') {
        await loadSpecialCodes()
    }
})

// 加载生产线数据
async function loadProductionLines() {
    try {
        const result = await window.api.getProductionLines()
        productionLines.value = result || [] // 确保返回空数组而不是undefined
    } catch (error) {
        ElMessage.error('加载生产线数据失败')
        console.error(error)
    }
}

// 加载特殊码数据
async function loadSpecialCodes() {
    if (!selectedLineId.value) return

    try {
        const codeType = formData.line_type === '涂装' ? 'ColorCode' : 'WhiteBodyCode'
        const result = await window.api.getProductionLineSpecialInfo(selectedLineId.value, codeType)
        specialCodes.value = result || [] // 确保返回空数组而不是undefined
    } catch (error) {
        ElMessage.error('加载特殊信息失败')
        console.error(error)
    }
}

// 处理生产线编号输入，自动转为大写
function handleLineNumberInput(value: string) {
    formData.line_number = value.toUpperCase()
}

// 处理生产线名称输入，自动转为大写
function handleLineNameInput(value: string) {
    formData.line_name = value.toUpperCase()
}

// 处理白车身码输入，自动转为大写
function handleWhiteBodyCodeInput(value: string) {
    specialCodeInput.value = value.toUpperCase()
}

// 处理行点击
function handleRowClick(row: any) {
    selectedLineId.value = row.id
    Object.assign(formData, row)
}

// 处理编辑
function handleEdit(row: any) {
    selectedLineId.value = row.id
    Object.assign(formData, row)
    activeFormTab.value = 'common'
}

// 处理删除
async function handleDelete(id: number) {
    try {
        await ElMessageBox.confirm('确定要删除该生产线吗？相关的特殊信息也将被删除。', '警告', {
            confirmButtonText: '确定',
            cancelButtonText: '取消',
            type: 'warning'
        })

        await window.api.deleteProductionLine(id)
        ElMessage.success('删除成功')
        await loadProductionLines()
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
                // 将生产线编号和名称转为大写
                formData.line_number = formData.line_number.toUpperCase()
                formData.line_name = formData.line_name.toUpperCase()

                if (formData.id) {
                    await window.api.updateProductionLine(formData)
                    ElMessage.success('更新成功')
                } else {
                    const result = await window.api.addProductionLine(formData)
                    selectedLineId.value = result.id
                    ElMessage.success('添加成功')
                }

                await loadProductionLines()
            } catch (error) {
                ElMessage.error('操作失败')
                console.error(error)
            }
        }
    })
}

// 重置表单
function resetForm() {
    selectedLineId.value = null
    formRef.value?.resetFields()
    Object.assign(formData, {
        id: null,
        line_number: '',
        line_name: '',
        line_type: '车身',
        shift: 0,
        speed: 0,
        efficiency: 0,
        group: 0,
        flow_code: '',
        abbreviation: ''
    })
    specialCodeInput.value = ''
}

// 验证颜色码（只能输入数字）
function validateColorCode(value: string) {
    specialCodeInput.value = value.replace(/[^0-9]/g, '')
}

// 添加特殊码
async function addSpecialCode(codeType: string) {
    if (!selectedLineId.value || !specialCodeInput.value) {
        ElMessage.warning('请先选择生产线并输入特殊码')
        return
    }

    // 验证特殊码格式
    if (codeType === 'WhiteBodyCode' && !isValidWhiteBodyCode.value) {
        ElMessage.warning('白车身码必须为3位字母或数字')
        return
    }

    if (codeType === 'ColorCode' && !isValidColorCode.value) {
        ElMessage.warning('颜色码必须为2位数字')
        return
    }

    try {
        await window.api.addProductionLineSpecialInfo({
            production_line_id: selectedLineId.value,
            code_type: codeType,
            code_value: specialCodeInput.value
        })

        ElMessage.success('添加成功')
        specialCodeInput.value = ''
        await loadSpecialCodes()
    } catch (error) {
        ElMessage.error('添加失败，可能是特殊码已存在')
        console.error(error)
    }
}

// 删除特殊码
async function deleteSpecialCode(id: number) {
    try {
        await ElMessageBox.confirm('确定要删除该特殊码吗？', '警告', {
            confirmButtonText: '确定',
            cancelButtonText: '取消',
            type: 'warning'
        })

        await window.api.deleteProductionLineSpecialInfo(id)
        ElMessage.success('删除成功')
        await loadSpecialCodes()
    } catch (error: any) {
        if (error !== 'cancel') {
            ElMessage.error('删除失败')
            console.error(error)
        }
    }
}
</script>

<style scoped>
.production-line-container {
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

.empty-tip {
    text-align: center;
    padding: 40px;
    color: #909399;
    font-size: 16px;
}
</style>