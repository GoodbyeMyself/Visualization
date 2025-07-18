<template>
    <div class="go-project-items">
        <!-- 新增功能 -->
        <div class="go-project-items-create">
            <project-layout-create></project-layout-create>
         </div>
        <!-- 列表 -->
        <project-items-list></project-items-list>
    </div>
</template>

<script setup lang="ts">
import { ProjectLayoutCreate } from './components/ProjectCreate/index'
import { ProjectItemsList } from './components/ProjectItemsList'
</script>

<style lang="scss" scoped>
@include go(project-items) {
    padding: 24px 20px;
}
.go-project-items-create {
    margin-bottom: 12px;
    text-align: right;
}
</style>
