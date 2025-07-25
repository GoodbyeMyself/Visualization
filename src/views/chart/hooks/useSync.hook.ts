import html2canvas from 'html2canvas'
import { useChartEditStore } from '@/store/modules/chartEditStore/chartEditStore'
import { EditCanvasTypeEnum,ChartEditStoreEnum, ChartEditStorage, ProjectInfoEnum } from '@/store/modules/chartEditStore/chartEditStore.d'
import { useChartHistoryStore } from '@/store/modules/chartHistoryStore/chartHistoryStore'
import { useChartLayoutStore } from '@/store/modules/chartLayoutStore/chartLayoutStore'
import { useSystemStore } from '@/store/modules/systemStore/systemStore'
import { ChartLayoutStoreEnum } from '@/store/modules/chartLayoutStore/chartLayoutStore.d'
import { fetchChartComponent, fetchConfigComponent, createComponent } from '@/packages/index'
import { CreateComponentType, CreateComponentGroupType } from '@/packages/index.d'
import { BaseEvent, EventLife } from '@/enums/eventEnum'
import { PublicGroupConfigClass } from '@/packages/public/publicConfig'
import merge from 'lodash/merge'
// 防抖
import throttle from 'lodash/throttle'
// utils
import { getUUID, fetchRouteParamsLocation, base64toFile, JSONStringify } from '@/utils'
// 画布枚举
import { SyncEnum } from '@/enums/editPageEnum'
// 接口
import { uploadFile, updateProjectApi, saveProjectApi } from '@/api/path'
// 接口状态
import { ResultEnum } from '@/enums/httpEnum'

/**
 * * 画布-版本升级对旧数据无法兼容的补丁
 * @param object
 */
const canvasVersionUpdatePolyfill = (object: any) => {
    return object
}

/**
 * * 组件-版本升级对旧数据无法兼容的补丁
 * @param newObject
 * @param sources
 */
const componentVersionUpdatePolyfill = (newObject: any, sources: any) => {
    try {
        // 判断是否是组件
        if (sources.id) {
            // 处理事件补丁
            const hasVnodeBeforeMount = 'vnodeBeforeMount' in sources.events
            const hasVnodeMounted = 'vnodeMounted' in sources.events

            if (hasVnodeBeforeMount) {
                newObject.events.advancedEvents.vnodeBeforeMount = sources?.events.vnodeBeforeMount
            }
            if (hasVnodeMounted) {
                newObject.events.advancedEvents.vnodeMounted = sources?.events.vnodeMounted
            }
            if (hasVnodeBeforeMount || hasVnodeMounted) {
                sources.events = {
                    baseEvent: {
                        [BaseEvent.ON_CLICK]: undefined,
                        [BaseEvent.ON_DBL_CLICK]: undefined,
                        [BaseEvent.ON_MOUSE_ENTER]: undefined,
                        [BaseEvent.ON_MOUSE_LEAVE]: undefined
                    },
                    advancedEvents: {
                        [EventLife.VNODE_MOUNTED]: undefined,
                        [EventLife.VNODE_BEFORE_MOUNT]: undefined
                    },
                    interactEvents: []
                }
            }
            return newObject
        }
    } catch (error) {
        return newObject
    }
}

/**
 * * 合并处理
 * @param newObject 新的模板数据
 * @param sources 新拿到的数据
 * @returns object
 */
const componentMerge = (newObject: any, sources: any, notComponent = false) => {
    // 处理组件补丁
    componentVersionUpdatePolyfill(newObject, sources)

    // 非组件不处理
    if (notComponent) return merge(newObject, sources)
    // 组件排除 newObject
    const option = sources.option
    if (!option) return merge(newObject, sources)

    // 为 undefined 的 sources 来源对象属性将被跳过详见 https://www.lodashjs.com/docs/lodash.merge
    sources.option = undefined
    if (option) {
        return {
            ...merge(newObject, sources),
            option: option
        }
    }
}

// 请求处理
export const useSync = () => {
    const chartEditStore = useChartEditStore()
    const chartHistoryStore = useChartHistoryStore()
    const chartLayoutStore = useChartLayoutStore()

    const systemStore = useSystemStore()

    /**
     * * 组件动态注册
     * @param projectData 项目数据
     * @param isReplace 是否替换数据
     * @returns
     */
    const updateComponent = async (projectData: ChartEditStorage, isReplace = false, changeId = false) => {
        if (isReplace) {
            // 清除列表
            chartEditStore.componentList = []
            // 清除历史记录
            chartHistoryStore.clearBackStack()
            chartHistoryStore.clearForwardStack()
        }
        // 画布补丁处理
        projectData.editCanvasConfig = canvasVersionUpdatePolyfill(projectData.editCanvasConfig)

        // 列表组件注册
        projectData.componentList.forEach(async (e: CreateComponentType | CreateComponentGroupType) => {
            const intComponent = (target: CreateComponentType) => {
                if (!window['$vue'].component(target.chartConfig.chartKey)) {
                    window['$vue'].component(target.chartConfig.chartKey, fetchChartComponent(target.chartConfig))
                    window['$vue'].component(target.chartConfig.conKey, fetchConfigComponent(target.chartConfig))
                }
            }

            if (e.isGroup) {
                (e as CreateComponentGroupType).groupList.forEach(groupItem => {
                    intComponent(groupItem)
                })
            } else {
                intComponent(e as CreateComponentType)
            }
        })

        // 创建函数-重新创建是为了处理类种方法消失的问题
        const create = async (
            _componentInstance: CreateComponentType,
            callBack?: (componentInstance: CreateComponentType) => void
        ) => {
            // 补充 class 上的方法
            let newComponent: CreateComponentType = await createComponent(_componentInstance.chartConfig)
            if (_componentInstance.chartConfig.redirectComponent) {
                _componentInstance.chartConfig.dataset && (newComponent.option.dataset = _componentInstance.chartConfig.dataset)
                newComponent.chartConfig.title = _componentInstance.chartConfig.title
                newComponent.chartConfig.chartFrame = _componentInstance.chartConfig.chartFrame
            }
            if (callBack) {
                if (changeId) {
                    callBack(componentMerge(newComponent, { ..._componentInstance, id: getUUID() }))
                } else {
                    callBack(componentMerge(newComponent, _componentInstance))
                }
            } else {
                if (changeId) {
                    chartEditStore.addComponentList(
                        componentMerge(newComponent, { ..._componentInstance, id: getUUID() }),
                        false,
                        true
                    )
                } else {
                    chartEditStore.addComponentList(componentMerge(newComponent, _componentInstance), false, true)
                }
            }
        }

        // 数据赋值
        for (const key in projectData) {
            // 组件
            if (key === ChartEditStoreEnum.COMPONENT_LIST) {
                let loadIndex = 0
                const listLength = projectData[key].length
                for (const comItem of projectData[key]) {
                    // 设置加载数量
                    let percentage = parseInt((parseFloat(`${++loadIndex / listLength}`) * 100).toString())
                    chartLayoutStore.setItemUnHandle(ChartLayoutStoreEnum.PERCENTAGE, percentage)
                    // 判断类型
                    if (comItem.isGroup) {
                        // 创建分组
                        let groupClass = new PublicGroupConfigClass()
                        if (changeId) {
                            groupClass = componentMerge(groupClass, { ...comItem, id: getUUID() })
                        } else {
                            groupClass = componentMerge(groupClass, comItem)
                        }

                        // 异步注册子应用
                        const targetList: CreateComponentType[] = []

                        for (const groupItem of (comItem as CreateComponentGroupType).groupList) {
                            await create(groupItem, e => {
                                targetList.push(e)
                            })
                        }
                        groupClass.groupList = targetList

                        // 分组插入到列表
                        chartEditStore.addComponentList(groupClass, false, true)
                    } else {
                        await create(comItem as CreateComponentType)
                    }
                    if (percentage === 100) {
                        // 清除历史记录
                        chartHistoryStore.clearBackStack()
                        chartHistoryStore.clearForwardStack()
                    }
                }
            } else if (key === ChartEditStoreEnum.EDIT_CANVAS_CONFIG || key === ChartEditStoreEnum.REQUEST_GLOBAL_CONFIG) {
                componentMerge(chartEditStore[key], projectData[key], true)
            }
        }

        // 清除数量
        chartLayoutStore.setItemUnHandle(ChartLayoutStoreEnum.PERCENTAGE, 0)
    }

    /**
   * * 赋值全局数据
   * @param projectData 项目数据
   * @returns
   */
    const updateStoreInfo = (projectData: {
        id: string,
        projectName: string,
        indexImage: string,
        remarks: string,
        state: number
    }) => {
        const { id, projectName, remarks, indexImage, state } = projectData
        // ID
        chartEditStore.setProjectInfo(ProjectInfoEnum.PROJECT_ID, id)
        // 名称
        chartEditStore.setProjectInfo(ProjectInfoEnum.PROJECT_NAME, projectName)
        // 描述
        chartEditStore.setProjectInfo(ProjectInfoEnum.REMARKS, remarks)
        // 缩略图
        chartEditStore.setProjectInfo(ProjectInfoEnum.THUMBNAIL, indexImage)
        // 发布
        chartEditStore.setProjectInfo(ProjectInfoEnum.RELEASE, state === 1)
    }

    /**
     * @description: 数据保存： 1、上传缩略图功能完整，但是未对接后端， 暂时置为 false
     * @author: M.yunlong
     * @date: 2025-07-22 15:03:41
    */
    const dataSyncUpdate = throttle(async (updateImg = false) => {
        // 获取 url 参数
        if(!fetchRouteParamsLocation()) return;

        let projectId = chartEditStore.getProjectInfo[ProjectInfoEnum.PROJECT_ID] || fetchRouteParamsLocation();

        if(projectId === null || projectId === ''){
            // 数据未初始化成功
            window['$message'].error('数据初未始化成功,请刷新页面！')
            return
        }

        chartEditStore.setEditCanvas(EditCanvasTypeEnum.SAVE_STATUS, SyncEnum.START)

        // 异常处理：缩略图上传失败不影响 JSON 的保存
        try {
            if (updateImg) {
                // 获取缩略图片
                const range = document.querySelector('.go-edit-range') as HTMLElement
                // 生成图片
                const canvasImage: HTMLCanvasElement = await html2canvas(range, {
                    backgroundColor: null,
                    allowTaint: true,
                    useCORS: true
                })
                // 上传预览图
                let uploadParams = new FormData()

                uploadParams.append('object', base64toFile(canvasImage.toDataURL(), `${fetchRouteParamsLocation()}_index_preview.png`))

                const uploadRes = await uploadFile(uploadParams)

                // 保存预览图
                if(uploadRes && uploadRes.code === ResultEnum.SUCCESS) {
                    if (uploadRes.data.fileurl) {
                        await updateProjectApi({
                            id: fetchRouteParamsLocation(),
                            indexImage: `${uploadRes.data.fileurl}`
                        })
                    } else {
                        await updateProjectApi({
                            id: fetchRouteParamsLocation(),
                            indexImage: `${systemStore.getFetchInfo.OSSUrl}${uploadRes.data.fileName}`
                        })
                    }
                }
            }
        } catch (e) {
            console.log(e)
        }

        // 保存数据
        let params = new FormData()
        params.append('projectId', projectId)
        params.append('content', JSONStringify(chartEditStore.getStorageInfo() || {}))

        console.log(chartEditStore.getStorageInfo(), '<- 保存的画布数据');

        const res = await saveProjectApi(params)

        if (res && res.code === ResultEnum.SUCCESS) {
            // 成功状态
            setTimeout(() => {
                chartEditStore.setEditCanvas(EditCanvasTypeEnum.SAVE_STATUS, SyncEnum.SUCCESS)
            }, 1000)
            return
        }
        // 失败状态
        chartEditStore.setEditCanvas(EditCanvasTypeEnum.SAVE_STATUS, SyncEnum.FAILURE)

    }, 3000)

    return {
        updateComponent,
        updateStoreInfo,
        dataSyncUpdate
    }
}
