<template>
    <n-space>
        <n-icon size="20" :depth="3">
            <fish-icon></fish-icon>
        </n-icon>
        <n-text @click="handleFocus">
            工作空间 -
            <n-button v-show="!focus" secondary size="tiny">
                <span class="title">
                    {{ comTitle }}
                </span>
            </n-button>
        </n-text>

        <n-input
            v-show="focus"
            ref="inputInstRef"
            size="small"
            type="text"
            maxlength="16"
            show-count
            placeholder="请输入项目名称"
            v-model:value.trim="title"
            @keyup.enter="handleBlur"
            @blur="handleBlur"
        ></n-input>
    </n-space>
</template>

<script setup lang="ts">
import { ref, nextTick, computed, watch, onMounted } from 'vue'
import { fetchRouteParamsLocation, setTitle } from '@/utils'
import { useChartEditStore } from '@/store/modules/chartEditStore/chartEditStore'
import { EditCanvasConfigEnum } from '@/store/modules/chartEditStore/chartEditStore.d'
import { icon } from '@/plugins'
import {
    updateProjectInfo,
    getLocalStorageData
} from '@/views/project/items/components/ProjectItemsList/hooks/useData.hook'
import { useRoute } from 'vue-router'

const { FishIcon } = icon.ionicons5
const chartEditStore = useChartEditStore()
const route = useRoute()

const focus = ref<boolean>(false)
const inputInstRef = ref(null)

// 根据路由 id 参数获取项目信息
const fetchProhectInfoById = () => {
    // 获取 路由 id
    const id = fetchRouteParamsLocation();

    return id || '';
}

// 根据项目ID获取项目信息
const getProjectInfoById = (projectId: string) => {
    try {
        const projectList = getLocalStorageData()
        const project = projectList.find((item: any) => {
            // 确保ID类型匹配
            const itemId = String(item.id)
            const searchId = String(projectId)
            return itemId === searchId
        })
        return project ? project.title : ''
    } catch (error) {
        console.error('获取项目信息失败:', error)
        return ''
    }
}

const title = ref<string>('')

// 初始化项目名称
const initProjectTitle = () => {
    const projectId = fetchProhectInfoById()
    if (projectId) {
        const projectTitle = getProjectInfoById(projectId)
        if (projectTitle && projectTitle.trim() !== '') {
            title.value = projectTitle
        } else {
            title.value = '新项目 - 1'
        }
    } else {
        title.value = '新项目 - 1'
    }
}

const comTitle = computed(() => {
    // 获取当前项目ID
    const projectId = fetchProhectInfoById()

    // 如果title为空，从本地存储中获取项目信息
    let newTitle = title.value

    if (!newTitle || newTitle.trim() === '') {
        if (projectId) {
            // 获取项目信息
            const projectTitle = getProjectInfoById(projectId);
            // 如果项目信息存在，则使用项目信息，否则使用默认项目名称
            newTitle = projectTitle || '新项目 - 1'
        } else {
            newTitle = '新项目 - 1'
        }
    } else {
        // 如果title不为空，使用当前title，但去除首尾空格
        newTitle = newTitle.trim()
    }

    setTitle(`工作空间-${newTitle}`)

    chartEditStore.setEditCanvasConfig(EditCanvasConfigEnum.PROJECT_NAME, newTitle)

    return newTitle
})

// 监听项目名称变化
watch(
    () => comTitle.value,
    newTitle => {
        if (newTitle && newTitle !== '新项目 - 1') {
            // 获取项目ID
            const projectId = fetchProhectInfoById();
            // 如果项目ID存在，则更新项目信息
            if (projectId) {
                // 更新项目信息
                updateProjectInfo(projectId, {
                    title: newTitle
                })
            }
        }
    }
)

// 监听路由变化，重新初始化项目名称
watch(
    () => route.params.id,
    () => {
        initProjectTitle()
    }
)

const handleFocus = () => {
    focus.value = true
    nextTick(() => {
        inputInstRef.value && (inputInstRef.value as any).focus()
    })
}

const handleBlur = () => {
    focus.value = false
    // 在失焦时也更新本地缓存
    if (title.value && title.value.trim()) {
        const projectId = fetchProhectInfoById()
        updateProjectInfo(projectId, { title: title.value.trim() })
    }
}

// 组件挂载时初始化项目名称
onMounted(() => {
    initProjectTitle()
})
</script>
<style lang="scss" scoped>
.title {
    padding-left: 5px;
    padding-right: 5px;
    font-size: 15px;
}
</style>
