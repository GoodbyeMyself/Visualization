import { ref } from 'vue'
import { goDialog } from '@/utils'
import { DialogEnum } from '@/enums/pluginEnum'
import { ChartList } from '../../..'

// 本地存储键名
const LOCAL_STORAGE_KEY = 'GO_CHART_CARD_LIST'

// 获取本地缓存数据
const getLocalStorageData = (): ChartList => {
    try {
        const data = localStorage.getItem(LOCAL_STORAGE_KEY)
        return data ? JSON.parse(data) : []
    } catch (error) {
        console.error('获取本地缓存数据失败:', error)
        return []
    }
}

// 保存数据到本地缓存
const saveToLocalStorage = (data: ChartList) => {
    try {
        localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(data))
    } catch (error) {
        console.error('保存到本地缓存失败:', error)
    }
}

// 更新项目信息
const updateProjectInfo = (projectId: string | number, updates: Partial<any>) => {
    try {
        const data = localStorage.getItem(LOCAL_STORAGE_KEY)
        if (data) {
            const projectList = JSON.parse(data)
            const projectIndex = projectList.findIndex((item: any) => item.id === projectId)
            
            if (projectIndex !== -1) {
                projectList[projectIndex] = { ...projectList[projectIndex], ...updates }
                localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(projectList))
                return true
            }
        }
        return false
    } catch (error) {
        console.error('更新项目信息失败:', error)
        return false
    }
}

// 删除项目
const deleteProjectFromStorage = (projectId: string | number) => {
    try {
        const data = localStorage.getItem(LOCAL_STORAGE_KEY)
        if (data) {
            const projectList = JSON.parse(data)
            const projectIndex = projectList.findIndex((item: any) => item.id === projectId)
            
            if (projectIndex !== -1) {
                console.log('删除项目:', projectId, '索引:', projectIndex)
                projectList.splice(projectIndex, 1)
                localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(projectList))
                console.log('删除后项目列表长度:', projectList.length)
                return true
            } else {
                console.log('未找到要删除的项目:', projectId)
            }
        }
        return false
    } catch (error) {
        console.error('删除项目失败:', error)
        return false
    }
}

// 数据初始化
export const useDataListInit = () => {
    // 从本地缓存获取数据，如果没有则使用空数组
    const cachedData = getLocalStorageData()
    const initialData = cachedData
    
    const list = ref<ChartList>(initialData)

    // 删除
    const deleteHandle = (cardData: any, index: number) => {
        console.log('开始删除项目:', cardData, '索引:', index)
        goDialog({
            type: DialogEnum.DELETE,
            promise: true,
            onPositiveCallback: () =>
                new Promise(res => setTimeout(() => res(1), 1000)),
            promiseResCallback: (e: any) => {
                console.log('删除确认回调执行')
                window.$message.success('删除成功')
                // 从本地缓存中删除项目
                const deleteResult = deleteProjectFromStorage(cardData.id)
                console.log('删除结果:', deleteResult)
                // 刷新列表以确保数据同步
                refreshList()
                console.log('列表刷新完成，当前列表长度:', list.value.length)
            }
        })
    }

    // 添加新项目
    const addNewProject = (newProject: any) => {
        list.value.push(newProject)
        // 更新本地缓存
        saveToLocalStorage(list.value)
    }

    // 更新项目列表
    const updateProjectList = (newList: ChartList) => {
        list.value = newList
        // 更新本地缓存
        saveToLocalStorage(list.value)
    }

    // 刷新列表（从本地缓存重新加载）
    const refreshList = () => {
        console.log('开始刷新列表')
        const cachedData = getLocalStorageData()
        console.log('从缓存获取的数据:', cachedData)
        list.value = cachedData
        console.log('列表刷新完成，当前列表长度:', list.value.length)
    }

    return {
        list,
        deleteHandle,
        addNewProject,
        updateProjectList,
        refreshList
    }
}

// 导出工具函数供其他组件使用
export {
    getLocalStorageData,
    saveToLocalStorage,
    updateProjectInfo,
    deleteProjectFromStorage,
    LOCAL_STORAGE_KEY
}
