<template>
    <div class="go-project-my-template">
        <n-space vertical>
            <n-image object-fit="contain" height="300" preview-disabled :src="requireErrorImg()"></n-image>
            <n-h3>暂时还没有东西呢</n-h3>
        </n-space>
    </div>
</template>

<script setup lang="ts">
import { requireErrorImg } from '@/utils'
</script>

<style lang="scss" scoped>
@include go('project-my-template') {
    min-height: calc(100vh - #{$--header-height});
    @extend .go-flex-center;
}
</style>
