export function useBlockDragger(focusData, lastSeleteBlock) {
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

        // 获取最后一个选中元素的宽高
        console.log(lastSeleteBlock.value , 'lastSeleteBlock')
        const {width: BWidth, height: BHeight} =  lastSeleteBlock.value
        dragState = {
            startX: e.clientX,
            startY: e.clientY,
            focusPos: focusData.value.focus.map(({top, left}) => ({top, left})), // 记录每一个选中的位置
            lines: (() => {
                const {unFocused} = focusData.value; // 获取其他没选中的以他们的位置做辅助线

                let lines = {x: [], y: []}; // 计算横线的位置用y来存放，x存放纵向的位置
                unFocused.forEach((block) => {
                    const {top: ATop, left: ALeft, width: AWidth, height: AHeight} = block;

                    // 当此元素拖拽到和A元素top一致的时候，要显示这跟辅助线，辅助线的位置就是 ATop
                    /**
                     * showTop：辅助线显示位置
                     * top：拖拽盒子(B盒子)的top值
                     */
                    lines.y.push({showTop: ATop, top: ATop}); // 顶对顶
                    lines.y.push({showTop: ATop, top: ATop - BHeight}); // 顶对底
                    lines.y.push({showTop: ATop + AHeight/2, top: ATop + AHeight/2 - BHeight/2}); // 中对中
                    lines.y.push({showTop: ATop + AHeight, top: ATop + AHeight}); // 底对顶
                    lines.y.push({showTop: ATop + AHeight, top: ATop + AHeight - BHeight}); // 底对顶

                    lines.x.push({showLeft: ALeft, left: ALeft}); // 左对左
                    lines.x.push({showLeft: ALeft + AWidth, left: ALeft + AWidth}); // A盒子右边对拖拽盒子左边
                    lines.x.push({showLeft: ALeft + AWidth/2, left: ALeft + AWidth/2 - BWidth/2}); // 中对中
                    lines.x.push({showLeft: ALeft + AWidth, left: ALeft + AWidth - BWidth}); // 右对右
                    lines.x.push({showLeft: ALeft, left: ALeft - BWidth}); // 左对右
                })
            })()
        }

        document.addEventListener('mousemove', mousemove);
        document.addEventListener('mouseup', mouseup);
    }

    return {
        mousedown
    }
}