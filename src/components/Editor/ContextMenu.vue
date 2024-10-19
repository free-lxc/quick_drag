<template>
        <div v-show="menuShow" class="contextmenu" :style="{ top: rightMenu.menuTop + 'px', left: rightMenu.menuLeft + 'px' }">
            <ul>
                        <li >复制</li>
                        <li >粘贴</li>
                        <li >剪切</li>
                        <li >删除</li>
                        <li >锁定</li>
                        <li >置顶</li>
                        <li >置底</li>
                        <li >上移</li>
                        <li >下移</li>
                    <!-- <li v-else>解锁</li> -->
                <!-- <li v-else >粘贴</li> -->
            </ul>
        </div>
</template>

<script lang="ts" setup>
// const rightMenu = ref({
//     menuTop: 0,
//     menuLeft: 0
// })
// const menuShow = ref(true)
 defineProps({
     menuShow:{
        type:Boolean,
        default:false
     },
     rightMenu: {
        type:Object,
        default:()=>{
            return {
                menuTop: 0,
                menuLeft: 0
            }
        }
     }
})
</script>

<style lang="scss" scoped>
.contextmenu {
    position: absolute;
    z-index: 1000;

    ul {
        border: 1px solid #e4e7ed;
        border-radius: 4px;
        background-color: #fff;
        box-shadow: 0 2px 12px 0 rgba(0, 0, 0, .1);
        box-sizing: border-box;
        margin: 5px 0;
        padding: 6px 0;

        li {
            font-size: 14px;
            padding: 0 20px;
            position: relative;
            white-space: nowrap;
            overflow: hidden;
            text-overflow: ellipsis;
            color: #606266;
            height: 34px;
            line-height: 34px;
            box-sizing: border-box;
            cursor: pointer;

            &:hover {
                background-color: #f5f7fa;
            }
        }
    }
}
</style>
