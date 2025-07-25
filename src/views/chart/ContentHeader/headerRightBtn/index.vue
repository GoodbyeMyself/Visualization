<template>
    <n-space class="go-mt-0" :wrap="false">
        <n-button v-for="item in comBtnList" :key="item.title" :type="item.type" ghost @click="item.event">
            <template #icon>
                <component :is="item.icon"></component>
            </template>
            <span>{{ item.title }}</span>
        </n-button>
    </n-space>

    <!-- 发布管理弹窗 -->
    <n-modal v-model:show="modelShow" @afterLeave="closeHandle">
        <n-list bordered class="go-system-setting">
            <template #header>
                <n-space justify="space-between">
                    <n-h3 class="go-mb-0">发布管理</n-h3>
                    <n-icon size="20" class="go-cursor-pointer" @click="closeHandle">
                        <close-icon></close-icon>
                    </n-icon>
                </n-space>
            </template>

            <n-list-item>
                <n-space :size="10">
                    <n-alert :show-icon="false" title="预览地址：" type="success">
                        {{ previewPath() }}
                    </n-alert>
                    <n-space vertical>
                        <n-button tertiary type="primary" @click="copyPreviewPath()"> 复制地址 </n-button>
                        <n-button :type="release ? 'warning' : 'primary'" @click="sendHandle">
                            {{ release ? '取消发布' : '发布大屏' }}
                        </n-button>
                    </n-space>
                </n-space>
            </n-list-item>

            <n-list-item>
                <n-space :size="10">
                    <n-button @click="modelShowHandle">关闭弹窗</n-button>
                </n-space>
            </n-list-item>
        </n-list>
    </n-modal>
</template>

<script setup lang="ts">
import { ref, computed, watchEffect } from 'vue'
import {
    renderIcon,
    fetchPathByName,
    routerTurnByPath,
    setSessionStorage,
    getSessionStorage,
    previewPath,
    fetchRouteParamsLocation,
    httpErrorHandle
} from '@/utils'
// 枚举
import { PreviewEnum } from '@/enums/pageEnum'
import { StorageEnum } from '@/enums/storageEnum'
import { ResultEnum } from '@/enums/httpEnum'
import { ProjectInfoEnum } from '@/store/modules/chartEditStore/chartEditStore.d'
// 路由
import { useRoute } from 'vue-router'
// 状态
import { useChartEditStore } from '@/store/modules/chartEditStore/chartEditStore'
import { icon } from '@/plugins'
import { cloneDeep } from 'lodash'
import { useClipboard } from '@vueuse/core'
// 接口
import { changeProjectReleaseApi } from '@/api/path'

const { BrowsersOutlineIcon, SendIcon, AnalyticsIcon, CloseIcon } = icon.ionicons5

const chartEditStore = useChartEditStore()

const previewPathRef = ref(previewPath())
const { copy, isSupported } = useClipboard({ source: previewPathRef })

const routerParamsInfo = useRoute()

const modelShow = ref<boolean>(false)
const release = ref<boolean>(false)

watchEffect(() => {
    release.value = chartEditStore.getProjectInfo.release || false
})

// 预览
const previewHandle = () => {
    const path = fetchPathByName(PreviewEnum.CHART_PREVIEW_NAME, 'href')
    if (!path) return
    const { id } = routerParamsInfo.params
    // id 标识
    const previewId = typeof id === 'string' ? id : id[0]
    const storageInfo = chartEditStore.getStorageInfo()
    const sessionStorageInfo = getSessionStorage(StorageEnum.GO_CHART_STORAGE_LIST) || []

    if (sessionStorageInfo?.length) {
        const repeateIndex = sessionStorageInfo.findIndex((e: { id: string }) => e.id === previewId)
        // 重复替换
        if (repeateIndex !== -1) {
            sessionStorageInfo.splice(repeateIndex, 1, {
                id: previewId,
                ...storageInfo
            })
            setSessionStorage(StorageEnum.GO_CHART_STORAGE_LIST, sessionStorageInfo)
        } else {
            sessionStorageInfo.push({
                id: previewId,
                ...storageInfo
            })
            setSessionStorage(StorageEnum.GO_CHART_STORAGE_LIST, sessionStorageInfo)
        }
    } else {
        setSessionStorage(StorageEnum.GO_CHART_STORAGE_LIST, [{ id: previewId, ...storageInfo }])
    }
    // 跳转
    routerTurnByPath(path, [previewId], undefined, true)
}

// 关闭弹窗
const closeHandle = () => {
    modelShow.value = false
}

// 模态弹窗
const modelShowHandle = () => {
    modelShow.value = !modelShow.value
}

// 复制预览地址
const copyPreviewPath = (successText?: string, failureText?: string) => {
    if (isSupported) {
        copy()
        window['$message'].success(successText || '复制成功！')
    } else {
        window['$message'].error(failureText || '复制失败！')
    }
}

// 发布
const sendHandle = async () => {
    // const res = await changeProjectReleaseApi({
    //     id: fetchRouteParamsLocation(),
    //     // 反过来
    //     state: release.value ? -1 : 1
    // })

    // if (res && res.code === ResultEnum.SUCCESS) {
        modelShowHandle()
        if (!release.value) {
            copyPreviewPath('发布成功！已复制地址到剪贴板~', '发布成功！')
        } else {
            window['$message'].success(`已取消发布`)
        }
        chartEditStore.setProjectInfo(ProjectInfoEnum.RELEASE, !release.value)
    // } else {
    //     httpErrorHandle()
    // }
}

const btnList = [
    {
        select: true,
        title: '预览',
        icon: renderIcon(BrowsersOutlineIcon),
        event: previewHandle
    },
    {
        select: true,
        title: '发布',
        icon: renderIcon(SendIcon),
        event: sendHandle
    }
]

/**
 * @description: 画布顶部 右侧按钮
 * @author: M.yunlong
 * @date: 2025-07-21 16:22:31
 */
const comBtnList = computed(() => {
    // 代码编辑中，显示全部按钮
    if (chartEditStore.getEditCanvas.isCodeEdit) {
        return btnList
    }

    return btnList

    // const cloneList = cloneDeep(btnList)

    // cloneList.shift()

    // return cloneList
})
</script>

<style lang="scss" scoped>
.align-center {
    margin-top: -4px;
}
</style>
