<template>
    <!-- <edit-rule></edit-rule> -->
    <content-box
        id="go-chart-edit-layout"
        :flex="true"
        :showTop="false"
        :showBottom="true"
        :depth="1"
        :xScroll="true"
        :disabledScroll="true"
        @mousedown="mousedownHandleUnStop"
        @drop="dragHandle"
        @dragover="dragoverHandle"
        @dragenter="dragoverHandle"
    >
        <edit-rule>
            <!-- 画布主体 -->
            <div id="go-chart-edit-content" @contextmenu="handleContextMenu">
                <!-- 展示 -->
                <edit-range>
                    <!-- 滤镜预览 -->
                    <div
                        :style="{
                            ...getFilterStyle(chartEditStore.getEditCanvasConfig),
                            ...rangeStyle
                        }"
                    >
                        <!-- 图表 -->
                        <div v-for="(item, index) in chartEditStore.getComponentList" :key="item.id">
                            <!-- 分组 -->
                            <edit-group
                                v-if="item.isGroup"
                                :groupData="(item as CreateComponentGroupType)"
                                :groupIndex="index"
                            ></edit-group>

                            <!-- 单组件 -->
                            <edit-shape-box
                                v-else
                                :data-id="item.id"
                                :index="index"
                                :style="{
                ...useComponentStyle(item.attr, index),
                ...getBlendModeStyle(item.styles) as any
              }"
                                :item="item"
                                @click="mouseClickHandle($event, item)"
                                @mousedown="mousedownHandle($event, item)"
                                @mouseenter="mouseenterHandle($event, item)"
                                @mouseleave="mouseleaveHandle($event, item)"
                                @contextmenu="handleContextMenu($event, item, optionsHandle)"
                            >
                                <component
                                    class="edit-content-chart"
                                    :class="animationsClass(item.styles.animations)"
                                    :is="item.chartConfig.chartKey"
                                    :chartConfig="item"
                                    :themeSetting="themeSetting"
                                    :themeColor="themeColor"
                                    :style="{
                                        ...useSizeStyle(item.attr),
                                        ...getFilterStyle(item.styles),
                                        ...getTransformStyle(item.styles)
                                    }"
                                ></component>
                            </edit-shape-box>
                        </div>
                    </div>
                </edit-range>
            </div>
        </edit-rule>

        <!-- 工具栏 -->
        <template #aside>
            <edit-tools></edit-tools>
        </template>

        <!-- 底部控制 -->
        <template #bottom>
            <EditBottom></EditBottom>
        </template>
    </content-box>
</template>

<script lang="ts" setup>
import { onMounted, computed, provide, watch } from 'vue'
import { chartColors } from '@/settings/chartThemes/index'
import { MenuEnum } from '@/enums/editPageEnum'
import { CreateComponentType, CreateComponentGroupType } from '@/packages/index.d'
import { animationsClass, getFilterStyle, getTransformStyle, getBlendModeStyle, colorCustomMerge } from '@/utils'
import { useContextMenu } from '@/views/chart/hooks/useContextMenu.hook'
import { MenuOptionsItemType } from '@/views/chart/hooks/useContextMenu.hook.d'
import { useChartEditStore } from '@/store/modules/chartEditStore/chartEditStore'
import { SCALE_KEY } from '@/views/preview/hooks/useScale.hook'
import { useLayout } from './hooks/useLayout.hook'
import { useAddKeyboard } from '../hooks/useKeyboard.hook'
import { dragHandle, dragoverHandle, mousedownHandleUnStop, useMouseHandle } from './hooks/useDrag.hook'
import { useComponentStyle, useSizeStyle } from './hooks/useStyle.hook'
import { useInitVChartsTheme } from '@/hooks'
// 回显数据
import { getSessionStorageInfo } from '@/views/preview/utils/storage'
import { useSync } from '@/views/chart/hooks/useSync.hook'

import { ContentBox } from '../ContentBox/index'
import { EditGroup } from './components/EditGroup'
import { EditRange } from './components/EditRange'
import { EditRule } from './components/EditRule'
import { EditBottom } from './components/EditBottom'
import { EditShapeBox } from './components/EditShapeBox'
import { EditTools } from './components/EditTools'

const chartEditStore = useChartEditStore()
const { handleContextMenu } = useContextMenu()

// 编辑时注入scale变量，消除警告
provide(SCALE_KEY, null)

// 布局处理
useLayout(async () => {
    // 回显本地缓存数据并注册组件
    const localStorageInfo = getSessionStorageInfo()
    // --
    if (localStorageInfo) {
        // 动态注册组件
        const { updateComponent } = useSync()
        // 数据更新上去
        await updateComponent(localStorageInfo, true)
    }
})

// 点击事件
const { mouseenterHandle, mouseleaveHandle, mousedownHandle, mouseClickHandle } = useMouseHandle()

// 右键事件
const optionsHandle = (
    targetList: MenuOptionsItemType[],
    allList: MenuOptionsItemType[],
    targetInstance: CreateComponentType
) => {
    // 多选处理
    if (chartEditStore.getTargetChart.selectId.length > 1) {
        return allList.filter(i => [MenuEnum.GROUP, MenuEnum.DELETE].includes(i.key as MenuEnum))
    }
    const statusMenuEnums: MenuEnum[] = []
    if (targetInstance.status.lock) {
        statusMenuEnums.push(MenuEnum.LOCK)
    } else {
        statusMenuEnums.push(MenuEnum.UNLOCK)
    }
    if (targetInstance.status.hide) {
        statusMenuEnums.push(MenuEnum.HIDE)
    } else {
        statusMenuEnums.push(MenuEnum.SHOW)
    }
    return targetList.filter(i => !statusMenuEnums.includes(i.key as MenuEnum))
}

// 主题色
const themeSetting = computed(() => {
    const chartThemeSetting = chartEditStore.getEditCanvasConfig.chartThemeSetting
    return chartThemeSetting
})

// 配置项
const themeColor = computed(() => {
    const colorCustomMergeData: any = colorCustomMerge(chartEditStore.getEditCanvasConfig.chartCustomThemeColorInfo)
    return colorCustomMergeData[chartEditStore.getEditCanvasConfig.chartThemeColor]
})

// 是否展示渲染
const filterShow = computed(() => {
    return chartEditStore.getEditCanvasConfig.filterShow
})

// 背景
const rangeStyle = computed(() => {
    // 设置背景色和图片背景
    const background = chartEditStore.getEditCanvasConfig.background
    const backgroundImage = chartEditStore.getEditCanvasConfig.backgroundImage
    const selectColor = chartEditStore.getEditCanvasConfig.selectColor
    const backgroundColor = background ? background : undefined

    const computedBackground = selectColor
        ? { background: backgroundColor }
        : { background: `url(${backgroundImage}) no-repeat center center / cover !important` }

    return {
        ...computedBackground,
        width: 'inherit',
        height: 'inherit'
    }
})

// 处理全局的 vChart 主题
useInitVChartsTheme(chartEditStore)

// 键盘事件
onMounted(() => {
    useAddKeyboard()
})
</script>

<style lang="scss" scoped>
@include goId('chart-edit-layout') {
    position: relative;
    width: 100%;
    overflow: hidden;
    @extend .go-point-bg;
    @include background-image('background-point');

    @include goId('chart-edit-content') {
        overflow: hidden;
        @extend .go-transition;
        @include fetch-theme('box-shadow');

        .edit-content-chart {
            position: absolute;
            overflow: hidden;
        }
    }
}
</style>
