<template>
    <n-layout-header bordered class="go-header">
        <header class="go-header-box" :class="{ 'is-project': isProject }">
            <div class="header-item left">
                <n-space>
                    <slot name="left"></slot>
                </n-space>
            </div>
            <div class="header-item center">
                <slot name="center"></slot>
            </div>
            <div class="header-item right">
                <n-space>
                    <slot name="ri-left"> </slot>
                    <template v-if="showHeaderComponents">
                        <go-lang-select></go-lang-select>
                        <theme-color-select></theme-color-select>
                        <go-theme-select></go-theme-select>
                    </template>
                    <slot name="ri-right"> </slot>
                </n-space>
            </div>
        </header>
    </n-layout-header>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useRoute } from 'vue-router'
import { GoThemeSelect } from '@/components/GoThemeSelect'
import { GoLangSelect } from '@/components/GoLangSelect'
import { ThemeColorSelect } from '@/components/Pages/ThemeColorSelect'
import { PageEnum } from '@/enums/pageEnum'

const route = useRoute()

const isProject = computed(() => {
    return route.fullPath === PageEnum.BASE_HOME_ITEMS
})

// 判断是否显示头部组件（只在 items 和 my-template 页面显示）
const showHeaderComponents = computed(() => {
    return route.fullPath === PageEnum.BASE_HOME_ITEMS || 
           route.fullPath === PageEnum.BASE_HOME_TEMPLATE
})
</script>

<style lang="scss" scoped>
@include go(header) {
    &-box {
        display: flex;
        justify-content: space-between;
        &.is-project {
            grid-template-columns: none;
        }
        .header-item {
            display: flex;
            align-items: center;
            &.left {
                justify-content: start;
            }
            &.center {
                justify-content: center;
            }
            &.right {
                justify-content: end;
            }
        }
        height: $--header-height;
        padding: 0 20px 0 60px;
    }
}
</style>
