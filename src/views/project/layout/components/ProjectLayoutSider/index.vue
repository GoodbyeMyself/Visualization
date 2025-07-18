<template>
    <n-layout-sider
        class="go-project-sider"
        collapse-mode="width"
        show-trigger="bar"
        :collapsed="collapsed"
        :native-scrollbar="false"
        :collapsed-width="getAsideCollapsedWidth"
        :width="asideWidth"
        @collapse="collapsed = true"
        @expand="collapsed = false"
    >
        <div class="go-project-sider-flex">
            <aside>
                <n-space vertical class="go-project-sider-top">
                    <!-- 新建项目功能已移动到 project/items 页面 -->
                </n-space>
                <n-divider class="go-project-sider-divider"></n-divider>
                <n-menu
                    :value="menuValue"
                    :options="menuOptions"
                    :collapsed-width="getAsideCollapsedWidth"
                    :collapsed-icon-size="22"
                    :default-expanded-keys="defaultExpandedKeys"
                ></n-menu>
            </aside>
        </div>
    </n-layout-sider>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted, toRefs } from 'vue'
import { asideWidth } from '@/settings/designSetting'
import { useRoute } from 'vue-router'
import { useSettingStore } from '@/store/modules/settingStore/settingStore'
import { menuOptionsInit, expandedKeys } from './menu'

const collapsed = ref<boolean>(false)

const { getAsideCollapsedWidth } = toRefs(useSettingStore())

const route = useRoute()
const menuValue = computed(() => route.name)

const menuOptions = menuOptionsInit()

const defaultExpandedKeys = expandedKeys()

const watchWidth = () => {
    const Width = document.body.clientWidth
    if (Width <= 950) {
        collapsed.value = true
    } else collapsed.value = false
}

onMounted(() => {
    window.addEventListener('resize', watchWidth)
})

onUnmounted(() => {
    window.removeEventListener('resize', watchWidth)
})
</script>

<style lang="scss" scoped>
$siderHeight: 100vh;

@include go(project) {
    &-sider {
        @include fetch-bg-color('aside-background-color');

        &-top {
            display: flex;
            align-items: center;
            justify-content: space-between;
            flex-direction: column;
            height: 52px;
        }

        &-flex {
            display: flex;
            flex-direction: column;
            justify-content: space-between;
            height: $siderHeight;
        }

        &-divider {
            margin: 8px 16px;
            opacity: 0.6;
        }
    }

    &-layout-sider {
        height: $siderHeight;
    }

    .content-top {
        top: $--header-height;
        margin-top: 1px;
    }
}
</style>
