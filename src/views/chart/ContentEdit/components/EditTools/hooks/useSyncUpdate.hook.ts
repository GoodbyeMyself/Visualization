import { watch } from 'vue'
import { useRoute } from 'vue-router'
import throttle from 'lodash/throttle'
import { useChartEditStore } from '@/store/modules/chartEditStore/chartEditStore'
import { EditCanvasTypeEnum } from '@/store/modules/chartEditStore/chartEditStore.d'
import { useSync } from '@/views/chart/hooks/useSync.hook'
import { ChartEnum } from '@/enums/pageEnum'
import { SavePageEnum } from '@/enums/editPageEnum'

import { fetchRouteParamsLocation, getSessionStorage, setSessionStorage, goDialog } from '@/utils'

import { editToJsonInterval } from '@/settings/designSetting'
import { StorageEnum } from '@/enums/storageEnum'

const { updateComponent } = useSync()

const chartEditStore = useChartEditStore()

export const syncData = () => {
    goDialog({
        message: '是否覆盖源视图内容，此操作不可撤回?',
        isMaskClosable: true,
        transformOrigin: 'center',
        onPositiveCallback: () => {
            // 获取 路由 id
            const id = fetchRouteParamsLocation();

            const storageInfo = chartEditStore.getStorageInfo()

            const sessionStorageInfo = getSessionStorage(StorageEnum.GO_CHART_STORAGE_LIST) || [];

            if (sessionStorageInfo?.length) {
                // 查询 是否存在索引
                const repeateIndex = sessionStorageInfo.findIndex((e: { id: string }) => e.id === id)
                // 重复替换
                if (repeateIndex !== -1) {
                    sessionStorageInfo.splice(repeateIndex, 1, {
                        id: id,
                        ...storageInfo
                    })
                    setSessionStorage(StorageEnum.GO_CHART_STORAGE_LIST, sessionStorageInfo)
                } else {
                    sessionStorageInfo.push({
                        id: id,
                        ...storageInfo
                    })
                    setSessionStorage(StorageEnum.GO_CHART_STORAGE_LIST, sessionStorageInfo)
                }
            } else {
                setSessionStorage(StorageEnum.GO_CHART_STORAGE_LIST, [{
                    id: id,
                    ...storageInfo
                }])
            }

            // --
            // dispatchEvent(new CustomEvent(SavePageEnum.CHART, {
            //     detail: chartEditStore.getStorageInfo()
            // }))

            // --
            window['$message'].success('保存成功')
        }
    })
}

// 同步数据到预览页
export const syncDataToPreview = () => {
    dispatchEvent(new CustomEvent(SavePageEnum.CHART_TO_PREVIEW, {
        detail: chartEditStore.getStorageInfo()
    }))
}

// 侦听器更新
const useSyncUpdateHandle = () => {
    // 定义侦听器变量
    let timer: any

    // 更新处理
    const updateFn = (e: any) => {
        window['$message'].success('正在进行更新...')
        updateComponent(e!.detail, true)
    }

    // 页面关闭处理
    const closeFn = () => {
        chartEditStore.setEditCanvas(EditCanvasTypeEnum.IS_CODE_EDIT, false)
    }

    // 开启侦听
    const use = () => {
        // 定时同步数据（暂不开启）
        // timer = setInterval(() => {
        //   // 窗口激活并且处于工作台
        //   document.hasFocus() && syncData()
        // }, editToJsonInterval)

        // 失焦同步数据
        addEventListener('blur', syncDataToPreview)

        // 监听编辑器保存事件 刷新工作台图表
        addEventListener(SavePageEnum.JSON, updateFn)

        // 监听编辑页关闭
        addEventListener(SavePageEnum.CLOSE, throttle(closeFn, 1000))
    }

    // 关闭侦听
    const unUse = () => {
        // clearInterval(timer)
        removeEventListener('blur', syncDataToPreview)
        removeEventListener(SavePageEnum.JSON, updateFn)
    }

    // 路由变更时处理
    const watchHandler = (toName: any, fromName: any) => {
        if (fromName == ChartEnum.CHART_HOME_NAME) {
            unUse()
        }
        if (toName == ChartEnum.CHART_HOME_NAME) {
            use()
        }
    }

    return watchHandler
}

export const useSyncUpdate = () => {
    const routerParamsInfo = useRoute()
    watch(() => routerParamsInfo.name, useSyncUpdateHandle(), { immediate: true })
}
