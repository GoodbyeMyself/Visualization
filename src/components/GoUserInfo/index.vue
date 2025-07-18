<template>
    <n-dropdown trigger="hover" @select="handleSelect" :show-arrow="true" :options="options">
        <div class="user-info-box">
            <n-icon :component="PersonIcon" />
            <div class="user-name">
                admin
            </div>
        </div>
    </n-dropdown>
    <!-- 系统设置 model -->
    <go-system-set v-model:modelShow="modelShow"></go-system-set>
    <!-- 关于软件 model -->
    <go-system-info v-model:modelShow="modelShowInfo"></go-system-info>
</template>

<script lang="ts" setup>
import { ref } from 'vue';
import { renderIcon } from '@/utils';
import { logout, renderLang } from '@/utils';
import { GoSystemSet } from '@/components/GoSystemSet/index';
import { GoSystemInfo } from '@/components/GoSystemInfo/index';

import { icon } from '@/plugins';

const { ChatboxEllipsesIcon, PersonIcon, LogOutOutlineIcon, SettingsSharpIcon } = icon.ionicons5

const modelShowInfo = ref(false)

const modelShow = ref(false)

const options = ref([
    {
        label: renderLang('global.sys_set'),
        key: 'sysSet',
        icon: renderIcon(SettingsSharpIcon)
    },
    {
        label: '协议',
        key: 'contact',
        icon: renderIcon(ChatboxEllipsesIcon)
    },
    {
        type: 'divider',
        key: 'd3'
    },
    {
        label: renderLang('global.logout'),
        key: 'logout',
        icon: renderIcon(LogOutOutlineIcon)
    }
])

// 系统设置
const sysSetHandle = () => {
    modelShow.value = true
}

// 系统设置
const sysInfoHandle = () => {
    modelShowInfo.value = true
}

const handleSelect = (key: string) => {
    switch (key) {
        case 'contact':
            sysInfoHandle()
            break
        case 'sysSet':
            sysSetHandle()
            break
        case 'logout':
            logout()
            break
    }
}
</script>

<style lang="scss" scoped>
.user-info-box {
    cursor: pointer;
    transform: scale(0.7);
    display: flex;
    align-items: center;
    gap: 8px;
    font-size: 28px;
    padding-top: 4px;
}

.user-name {
    font-size: 18px;
    @include fetch-theme('color');
    font-weight: 500;
    margin-left: 4px;
}
</style>
