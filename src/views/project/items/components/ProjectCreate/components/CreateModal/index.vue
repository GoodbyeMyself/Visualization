<template>
    <n-modal v-model:show="showRef" class="go-create-modal" @afterLeave="closeHandle">
        <n-space size="large">
            <n-card class="card-box" hoverable>
                <template #header>
                    <n-text class="card-box-tite">{{ $t('project.create_tip') }}</n-text>
                </template>
                <template #header-extra>
                    <n-text @click="closeHandle">
                        <n-icon size="20">
                            <component :is="CloseIcon"></component>
                        </n-icon>
                    </n-text>
                </template>
                <n-space class="card-box-content" justify="center">
                    <n-button
                        size="large"
                        :disabled="item.disabled"
                        v-for="item in typeList"
                        :key="item.key"
                        @click="btnHandle"
                    >
                        <component :is="item.title"></component>
                        <template #icon>
                            <n-icon size="18">
                                <component :is="item.icon"></component>
                            </n-icon>
                        </template>
                    </n-button>
                </n-space>
                <template #action></template>
            </n-card>
        </n-space>
    </n-modal>
</template>

<script lang="ts" setup>
import { ref, watch, shallowRef } from 'vue'
import { icon } from '@/plugins'
import { PageEnum, ChartEnum } from '@/enums/pageEnum'
import { fetchPathByName, routerTurnByPath, renderLang, getUUID } from '@/utils'
import { getLocalStorageData, saveToLocalStorage } from '@/views/project/items/components/ProjectItemsList/hooks/useData.hook'

const { FishIcon, CloseIcon } = icon.ionicons5
const { ObjectStorageIcon } = icon.carbon
const showRef = ref(false)

const emit = defineEmits(['close'])
const props = defineProps({
    show: Boolean
})

const typeList = shallowRef([
    {
        title: renderLang('project.new_project'),
        key: ChartEnum.CHART_HOME_NAME,
        icon: FishIcon,
        disabled: false
    },
    {
        title: renderLang('project.my_template'),
        key: PageEnum.BASE_HOME_TEMPLATE_NAME,
        icon: ObjectStorageIcon,
        disabled: true
    }
])

watch(props, newValue => {
    showRef.value = newValue.show
})

// 关闭对话框
const closeHandle = () => {
    emit('close', false)
}

// 处理按钮点击
const btnHandle = (key: string) => {
    closeHandle()
    const id = getUUID()
    const path = fetchPathByName(ChartEnum.CHART_HOME_NAME, 'href')
    
    // 创建新项目并添加到列表
    const newProject = {
        id: id,
        title: '新项目',
        release: false,
        label: '我的项目'
    }
    
    // 获取当前项目列表并添加新项目
    const currentList = getLocalStorageData()
    currentList.unshift(newProject)
    saveToLocalStorage(currentList)
    
    // 触发项目创建事件，通知列表刷新
    window.dispatchEvent(new CustomEvent('project-created', {
        detail: { newProject, projectList: currentList }
    }))
    
    routerTurnByPath(path, [id], undefined, true)
}
</script>
<style lang="scss" scoped>
$cardWidth: 570px;

@include go('create-modal') {
    position: fixed;
    top: 200px;
    left: 50%;
    transform: translateX(-50%);
    .card-box {
        width: $cardWidth;
        cursor: pointer;
        border: 1px solid rgba(0, 0, 0, 0);
        @extend .go-transition;
        &:hover {
            @include hover-border-color('hover-border-color');
        }
        &-tite {
            font-size: 14px;
        }
        &-content {
            padding: 0px 10px;
            width: 100%;
        }
    }
}
</style>
