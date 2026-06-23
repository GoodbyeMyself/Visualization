import { toRaw, watch, computed, ComputedRef } from 'vue'
import { customizeHttp } from '@/api/http'
import { CreateComponentType } from '@/packages/index.d'
import { useChartEditStore } from '@/store/modules/chartEditStore/chartEditStore'
import { RequestGlobalConfigType, RequestDataPondItemType } from '@/store/modules/chartEditStore/chartEditStore.d'
import { newFunctionHandle, intervalUnitHandle } from '@/utils'

// 获取类型
type ChartEditStoreType = typeof useChartEditStore

// 数据池存储的数据类型
type DataPondMapType = {
  updateCallback: (...args: any) => any
  filter?: string | undefined
}

// 数据池 Map 中请求对应 callback
const mittDataPondMap = new Map<string, DataPondMapType[]>()

// 创建单个数据项轮询接口
const newPondItemInterval = (
  requestGlobalConfig: RequestGlobalConfigType,
  requestDataPondItem: ComputedRef<RequestDataPondItemType | undefined>,
  dataPondMapItem?: DataPondMapType[]
) => {
  if (!dataPondMapItem?.length || !requestDataPondItem.value?.dataPondRequestConfig) return
  let fetchInterval: any = 0

  clearInterval(fetchInterval)

  // 请求
  const fetchFn = async () => {
    const pondItem = requestDataPondItem.value
    if (!pondItem?.dataPondRequestConfig) return
    try {
      const res = await customizeHttp(toRaw(pondItem.dataPondRequestConfig), toRaw(requestGlobalConfig))
      if (res) {
        try {
          // 遍历更新回调函数
          dataPondMapItem.forEach(item => {
            item.updateCallback(newFunctionHandle(res?.data, res, item.filter))
          })
        } catch (error) {
          console.error(error)
          return error
        }
      }
    } catch (error) {
      return error
    }
  }

  watch(
    () => requestDataPondItem.value?.dataPondRequestConfig?.requestParams?.Params,
    () => {
      fetchFn()
    },
    {
      immediate: false,
      deep: true
    }
  )


  // 立即调用
  fetchFn()

  const pondConfig = requestDataPondItem.value.dataPondRequestConfig
  const targetInterval = pondConfig.requestInterval
  const targetUnit = pondConfig.requestIntervalUnit

  const globalRequestInterval = requestGlobalConfig.requestInterval
  const globalUnit = requestGlobalConfig.requestIntervalUnit

  // 定时时间
  const time = targetInterval ? targetInterval : globalRequestInterval
  // 单位
  const unit = targetInterval ? targetUnit : globalUnit
  // 开启轮询
  if (time) fetchInterval = setInterval(fetchFn, intervalUnitHandle(time, unit))
}

/**
 * 数据池接口处理
 */
export const useChartDataPondFetch = () => {
  // 新增全局接口
  const addGlobalDataInterface = (
    targetComponent: CreateComponentType,
    useChartEditStore: ChartEditStoreType,
    updateCallback: (...args: any) => any
  ) => {
    const chartEditStore = useChartEditStore()
    const { requestDataPond } = chartEditStore.getRequestGlobalConfig

    // 组件对应的数据池 Id
    const requestDataPondId = targetComponent.request.requestDataPondId as string
    // 新增数据项
    const mittPondIdArr = mittDataPondMap.get(requestDataPondId) || []
    mittPondIdArr.push({
      updateCallback: updateCallback,
      filter: targetComponent.filter
    })
    mittDataPondMap.set(requestDataPondId, mittPondIdArr)
  }

  // 清除旧数据
  const clearMittDataPondMap = () => {
    mittDataPondMap.clear()
  }

  // 初始化数据池
  const initDataPond = (useChartEditStore: ChartEditStoreType) => {
    const chartEditStore = useChartEditStore()
    const requestDataPond = chartEditStore.requestGlobalConfig?.requestDataPond || []
    // 根据 mapId 查找对应的数据池配置
    for (let pondKey of mittDataPondMap.keys()) {
      const requestDataPondItem = computed(() => {
        return requestDataPond.find(item => item.dataPondId === pondKey)
      })
      if (requestDataPondItem.value) {
        newPondItemInterval(chartEditStore.requestGlobalConfig, requestDataPondItem, mittDataPondMap.get(pondKey))
      }
    }
  }

  return {
    addGlobalDataInterface,
    clearMittDataPondMap,
    initDataPond
  }
}
