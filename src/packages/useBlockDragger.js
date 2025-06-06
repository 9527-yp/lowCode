import { reactive } from "vue";
import { events } from "./events";

export function useBlockDragger(focusData, lastSeleteBlock, data) {
    let dragState = {
        startX: 0,
        startY: 0,
        dragging: false, // 默认不是正在拖拽
    }

    let markLine = reactive({
        x: null,
        y: null,
    })
    const mousemove = (e) => {
        // 获取鼠标移动后的位置
        let { clientX: moveX, clientY: moveY } = e;

        if(!dragState.dragging) {
            dragState.dragging = true;
            events.emit('start'); // 触发事件就会记住拖拽前的位置
        }

        // 计算当前元素最新的left和top，去线里面找，找到后显示线
        // 如何计算：鼠标移动后 - 鼠标移动前 + 盒子的left
        let left = moveX - dragState.startX + dragState.startLeft
        let top = moveY - dragState.startY + dragState.startTop

        // 先计算横线，距离参照物元素还有5像素的时候，就显示这跟线
        let y = null;
        let x = null;

        for(let i = 0; i < dragState.lines.y.length; i++) {
            const {top: t, showTop: s} = dragState.lines.y[i] // 获取每一根线
            if(Math.abs(t - top) < 5) { // 如果小于5说明接近了
                y = s; // 线要显示的位置
                moveY = dragState.startY - dragState.startTop + t; // 容器距离顶部的距离 + 目标的高度，就是最新的 moveY
                // 实现快速贴边

                break; // 找到一根线后就跳出循环
            }
        }
        for(let i = 0; i < dragState.lines.x.length; i++) {
            const {left: l, showLeft: s} = dragState.lines.x[i] // 获取每一根线
            if(Math.abs(l - left) < 5) { // 如果小于5说明接近了
                x = s; // 线要显示的位置
                moveX = dragState.startX - dragState.startLeft + l;
                // 实现快速贴边

                break; // 找到一根线后就跳出循环
            }
        }
        markLine.x = x; // markLine 是一个响应式数据，x，y更新了会导致视图更新
        markLine.y = y;



        // 计算移动的距离
        let durX = moveX - dragState.startX;
        let durY = moveY - dragState.startY;

        focusData.value.focus.forEach((block, idx) => {
            block.top = dragState.focusPos[idx].top + durY;
            block.left = dragState.focusPos[idx].left + durX;
        })
    }
    
    const mouseup = (e) => {
        // 鼠标松开就移除事件
        document.removeEventListener('mousemove', mousemove);
        document.removeEventListener('mouseup', mouseup);

        markLine.x = null;
        markLine.y = null;

        if(dragState.dragging) { // 如果只是点击就不会触发
            events.emit('end');
        }
    }
    const mousedown = (e) => {

        // 获取最后一个选中拖拽元素的宽高
        // console.log(lastSeleteBlock.value , 'lastSeleteBlock')
        const {width: BWidth, height: BHeight} =  lastSeleteBlock.value

        dragState = {
            startX: e.clientX,
            startY: e.clientY,
            startLeft: lastSeleteBlock.value.left, // B盒子拖拽前的位置 left和top
            startTop: lastSeleteBlock.value.top,
            dragging: false,
            focusPos: focusData.value.focus.map(({top, left}) => ({top, left})), // 记录每一个选中的位置  
            lines: (() => {
                const {unFocused} = focusData.value; // 获取其他没选中的以他们的位置做辅助线

                let lines = {x: [], y: []}; // 计算横线的位置用y来存放，x存放纵向的位置
                [
                    ...unFocused,
                    {
                        top: 0,
                        left: 0,
                        width: data.value.container.width,
                        height: data.value.container.height,
                    }
                ].forEach((block) => {
                    const {top: ATop, left: ALeft, width: AWidth, height: AHeight} = block;

                    // 当此元素拖拽到和A元素top一致的时候，要显示这跟辅助线，辅助线的位置就是 ATop
                    /**
                     * showTop：辅助线显示位置
                     * top：拖拽盒子(B盒子)的top值
                     * 参考assets文件夹图片
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
                return lines;
            })()
        }

        document.addEventListener('mousemove', mousemove);
        document.addEventListener('mouseup', mouseup);
    }

    return {
        mousedown,
        markLine
    }
}