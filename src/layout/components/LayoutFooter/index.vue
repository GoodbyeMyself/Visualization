<template>
    <div class="go-footer">
        <slot>
            <n-space :size="50">
                <n-text depth="2"> xxxxxxxxxxx </n-text>
            </n-space>
        </slot>
    </div>
</template>

<style lang="scss" scoped>
@include go(footer) {
    display: flex;
    justify-content: center;
    align-items: center;
    width: 100%;
    padding: 0 40px;
    height: $--footer-height;
}
</style>
