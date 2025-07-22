<template>
    <preview :key="key"></preview>
</template>

<script setup lang="ts">
import { getSessionStorageInfo } from './utils'
import type { ChartEditStorageType } from './index.d'
import { SavePageEnum } from '@/enums/editPageEnum'
import { setSessionStorage } from '@/utils'
import { getSessionStorage } from '@/utils'
import { StorageEnum } from '@/enums/storageEnum'
import { ref } from 'vue'
import Preview from './index.vue'

let key = ref(Date.now())

// 数据变更 -> 组件销毁重建
try {
    const listenerArr = [SavePageEnum.JSON, SavePageEnum.CHART_TO_PREVIEW]

    listenerArr.forEach((saveEvent: string) => {
        if (!window.opener || !window.opener.addEventListener) return

        window.opener.addEventListener(saveEvent, async (e: any) => {
            const localStorageInfo: ChartEditStorageType = (await getSessionStorageInfo()) as unknown as ChartEditStorageType

            // 先读取 sessionStorage
            const sessionStorageInfo = getSessionStorage(StorageEnum.GO_CHART_STORAGE_LIST) || []

            const previewId = localStorageInfo.id

            const newData = { ...e.detail, id: previewId }
            
            if (sessionStorageInfo.length) {
                const repeateIndex = sessionStorageInfo.findIndex((item: { id: string }) => item.id === previewId)
                if (repeateIndex !== -1) {
                    sessionStorageInfo.splice(repeateIndex, 1, newData)
                } else {
                    sessionStorageInfo.push(newData)
                }
                setSessionStorage(StorageEnum.GO_CHART_STORAGE_LIST, sessionStorageInfo)
            } else {
                setSessionStorage(StorageEnum.GO_CHART_STORAGE_LIST, [newData])
            }
            
            key.value = Date.now()
        })
    })
} catch (error) {
    console.log(error)
}
</script>
