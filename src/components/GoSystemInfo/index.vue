<template>
    <n-modal v-model:show="modelShowRef" @afterLeave="closeHandle">
        <n-list bordered class="go-system-info">
            <template #header>
                <n-space justify="space-between">
                    <n-h3 class="go-mb-0">协议</n-h3>
                    <n-icon size="20" class="go-cursor-pointer" @click="closeHandle">
                        <close-icon></close-icon>
                    </n-icon>
                </n-space>
            </template>
            <n-list-item>
                <n-space class="go-my-2" :size="20">
                    <n-text>
                        请遵守开源 MIT 协议，以上声明
                        <n-text type="error">不可删除</n-text>，否则视作侵权行为，后果自负！
                    </n-text>
                </n-space>
            </n-list-item>
        </n-list>
    </n-modal>
</template>

<script lang="ts" setup>
import { ref, watch } from 'vue'
import { icon } from '@/plugins'

const props = defineProps({
    modelShow: Boolean
})

const emit = defineEmits(['update:modelShow'])

const { CloseIcon } = icon.ionicons5

const modelShowRef = ref(false)

watch(
    () => props.modelShow,
    newValue => {
        modelShowRef.value = newValue
    }
)

const closeHandle = () => {
    emit('update:modelShow', false)
}
</script>

<style lang="scss" scoped>
@include go('system-info') {
    @extend .go-background-filter;
    min-width: 100px;
    max-width: 60vw;
    padding-bottom: 20px;
    .item-left {
        width: 200px;
    }
    @include deep() {
        .n-list-item:not(:last-child) {
            border-bottom: 0;
        }
    }
}
</style>
