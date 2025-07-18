<template>
    <layout-header>
        <template #left>
            <slot name="left"></slot>
        </template>
        <template #center>
            <slot name="center"></slot>
        </template>
        <template #ri-left>
            <slot name="ri-left"></slot>
        </template>
        <template #ri-right>
            <template v-if="showHeaderComponents">
                <go-user-info></go-user-info>
            </template>
            <slot name="ri-right"></slot>
        </template>
    </layout-header>
</template>
<script setup lang="ts">
import { computed } from 'vue'
import { useRoute } from 'vue-router'
import { LayoutHeader } from '@/layout/components/LayoutHeader'
import { GoUserInfo } from '@/components/GoUserInfo'
import { PageEnum } from '@/enums/pageEnum'

const route = useRoute()

// 判断是否显示头部组件（只在 items 和 my-template 页面显示）
const showHeaderComponents = computed(() => {
    return route.fullPath === PageEnum.BASE_HOME_ITEMS || 
           route.fullPath === PageEnum.BASE_HOME_TEMPLATE
})
</script>
