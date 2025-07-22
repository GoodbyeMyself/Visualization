<template>
    <div class="go-items-list">
        <!-- 有项目时显示项目列表 -->
        <template v-if="list.length > 0">
            <n-grid :x-gap="20" :y-gap="20" cols="2 s:2 m:3 l:4 xl:4 xxl:4" responsive="screen">
                <n-grid-item v-for="(item, index) in list" :key="item.id">
                    <project-items-card
                        :cardData="item"
                        @resize="resizeHandle"
                        @delete="deleteHandle($event, index)"
                        @edit="editHandle"
                    ></project-items-card>
                </n-grid-item>
            </n-grid>
            <div class="list-pagination">
                <n-pagination :item-count="10" :page-sizes="[10, 20, 30, 40]" show-size-picker />
            </div>
        </template>
        
        <!-- 空状态显示 -->
        <template v-else>
            <div class="empty-state">
                <div class="empty-state-content">
                    <n-icon size="120" :depth="3" class="empty-icon">
                        <component :is="EmptyIcon"></component>
                    </n-icon>
                    <n-text class="empty-title" :depth="2">
                        暂无项目
                    </n-text>
                    <n-text class="empty-description" :depth="3">
                        点击右上角"新建"按钮创建您的第一个项目
                    </n-text>
                </div>
            </div>
        </template>
    </div>
    
    <project-items-modal-card
        v-if="modalData"
        :modalShow="modalShow"
        :cardData="modalData"
        @close="closeModal"
        @edit="editHandle"
    ></project-items-modal-card>
</template>

<script setup lang="ts">
import { onMounted, onUnmounted } from 'vue'
import { ProjectItemsCard } from '../ProjectItemsCard/index'
import { ProjectItemsModalCard } from '../ProjectItemsModalCard/index'
import { icon } from '@/plugins'
import { useModalDataInit } from './hooks/useModal.hook'
import { useDataListInit } from './hooks/useData.hook'
import { SavePageEnum } from '@/enums/editPageEnum'
import { useRoute } from 'vue-router'

const { CopyIcon, EllipsisHorizontalCircleSharpIcon, FolderOpenIcon } = icon.ionicons5

const { list, deleteHandle, updateProjectList, refreshList } = useDataListInit()

const { modalData, modalShow, closeModal, resizeHandle, editHandle } = useModalDataInit()

const route = useRoute()

// 空状态图标
const EmptyIcon = FolderOpenIcon

// 监听项目保存事件
const handleProjectSave = (event: any) => {
    const projectData = event.detail
    const projectId = route.params.id
    
    if (projectId && projectData) {
        // 更新项目列表中的项目信息
        const currentList = [...list.value]
        const projectIndex = currentList.findIndex(item => item.id === projectId)
        
        if (projectIndex !== -1) {
            // 更新项目信息
            currentList[projectIndex] = {
                ...currentList[projectIndex],
                title: projectData.editCanvasConfig?.projectName || '新项目',
                release: false, // 可以根据需要设置发布状态
                label: '我的项目'
            }
            
            // 更新列表和本地缓存
            updateProjectList(currentList)
        }
    }
}

// 监听项目创建事件
const handleProjectCreated = (event: any) => {
    console.log('收到项目创建事件:', event.detail)
    // 刷新列表以显示新创建的项目
    refreshList()
}

// 组件挂载时添加事件监听和刷新列表
onMounted(() => {
    addEventListener(SavePageEnum.CHART, handleProjectSave)
    addEventListener('project-created', handleProjectCreated)
    // 刷新列表以确保数据是最新的
    refreshList()
})

// 组件卸载时移除事件监听
onUnmounted(() => {
    removeEventListener(SavePageEnum.CHART, handleProjectSave)
    removeEventListener('project-created', handleProjectCreated)
})
</script>

<style lang="scss" scoped>
$contentHeight: 250px;
@include go('items-list') {
    display: flex;
    flex-direction: column;
    justify-content: space-between;
    min-height: calc(100vh - #{$--header-height} * 2 - 36px);
    .list-content {
        position: relative;
        height: $contentHeight;
    }
    .list-pagination {
        display: flex;
        justify-content: flex-end;
        margin-top: 20px;
    }
}

.empty-state {
    display: flex;
    justify-content: center;
    align-items: center;
    min-height: calc(100vh - #{$--header-height} * 2 - 100px);
    
    .empty-state-content {
        text-align: center;
        padding: 40px;
        
        .empty-icon {
            margin-bottom: 20px;
            opacity: 0.6;
        }
        
        .empty-title {
            display: block;
            font-size: 18px;
            font-weight: 500;
            margin-bottom: 12px;
        }
        
        .empty-description {
            display: block;
            font-size: 14px;
            line-height: 1.5;
            max-width: 300px;
            margin: 0 auto;
        }
    }
}
</style>
