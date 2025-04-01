export function useBlockDragger(focusData) {
    let dragState = {
        startX: 0,
        startY: 0,
    }
    const mousemove = (e) => {
        // 获取鼠标移动后的位置
        let { clientX: moveX, clientY: moveY } = e;
        // 计算移动的距离
        let durX = moveX - dragState.startX;
        let durY = moveY - dragState.startY;

        focusData.value.focus.forEach((block, idx) => {
            block.top = dragState.focusPos[idx].top + durY;
            block.left = dragState.focusPos[idx].left + durX;
        })
    }
    
    const mouseup = (e) => {
        document.removeEventListener('mousemove', mousemove);
        document.removeEventListener('mouseup', mouseup);
    }
    const mousedown = (e) => {
        dragState = {
            startX: e.clientX,
            startY: e.clientY,
            focusPos: focusData.value.focus.map(({top, left}) => ({top, left})) // 记录每一个选中的位置
        }


        document.addEventListener('mousemove', mousemove);
        document.addEventListener('mouseup', mouseup);
    }

    return {
        mousedown
    }
}