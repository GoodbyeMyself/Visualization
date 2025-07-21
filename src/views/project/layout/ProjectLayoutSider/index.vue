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
                    <div class="logo-container" :class="{ 'collapsed': collapsed }">
                        <img src="@/assets/logo.png" alt="Logo" class="logo-image" />
                        <span class="project-name" v-show="!collapsed">
                            Visualization
                        </span>
                    </div>
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
            justify-content: space-between;
            flex-direction: column;
            height: 52px;
            overflow: hidden;

            .logo-container {
                display: flex;
                align-items: center;
                gap: 8px;
                padding: 20px 30px;
                width: 100%;

                .logo-image {
                    width: 24px;
                    height: 24px;
                    object-fit: contain;
                }

                .project-name {
                    font-size: 16px;
                    font-weight: 600;
                    color: var(--text-color);
                    white-space: nowrap;
                    overflow: hidden;
                    text-overflow: ellipsis;
                }

                &.collapsed {
                    justify-content: center;
                    padding: 8px;
                    
                    .logo-image {
                        width: 28px;
                        height: 28px;
                    }
                }
            }
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
