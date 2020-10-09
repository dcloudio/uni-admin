<template>
    <view>
        <view>
            <text style="font-size: 25px;color: #333;">
                500 Server Error
            </text>
        </view>
    </view>
</template>

<script>
    export default {
        data() {
            return {

            }
        },
        onLoad(query) {
            this.errMsg = query.errMsg || ''
        },
        methods: {

        }
    }
</script>

<style>

</style>
