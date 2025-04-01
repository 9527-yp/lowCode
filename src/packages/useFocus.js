import { computed, ref } from 'vue';


export function useFocus(data, callback) {
    const focusData = computed(() => {
        let focus = [];
        let unFocused = [];
        data.value.blocks.forEach(item => (item.focus ? focus : unFocused).push(item));
        return {
            focus,
            unFocused
        }
    })

    const selectIndex = ref(-1);

    // 最后选择的那一个元素
    const lastSeleteBlock = computed(() => data.value.blocks[selectIndex.value])

    const clearBlockFocus = () => {
        data.value.blocks.forEach(item => item.focus = false)
    }

    // 3, 实现拖拽多个元素功能
    const containerMousedown = () => {
        // 点击容器让选中的失去焦点
        selectIndex.value = -1;
        clearBlockFocus();
    }
    const blockMousedown = (e, block, index) => {
        e.preventDefault();
        e.stopPropagation();
        if(e.shiftKey) {
            // 按住 shift键 多选
            if(focusData.value.focus.length <= 1) {
                block.focus = true; // 当前只有一个节点被选中时，摁住shift键也不会切换focus状态
            }else{
                block.focus = !block.focus;
            }
        }else{
            // 单选
            // block上我们规划一个属性 focus 获取焦点后就将 focus 变为true
            if(!block.focus) {
                clearBlockFocus(); // 要清空其他人的 focus 属性
                block.focus = true
                // 当自己已经被选中了，再次点击时还是选中状态
            }
        }
        selectIndex.value = index;
        callback(e)
    }

    return {
        focusData,
        lastSeleteBlock,
        blockMousedown,
        containerMousedown
    }
}