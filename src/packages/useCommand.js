import deepcopy from "deepcopy";
import { onUnmounted } from "vue";
import { events } from './events.js'

export function useCommand(data, focusData) {
    const state = { // 前进后退需要指针
        current: -1, // 前进后退的索引值
        queue: [], // 存放所有的操作命令
        commands: {}, // 制作命令和功能的一个映射表 undo:()=>{}   redo:() =>{}
        commandArray:[], // 存放所有的命令
        destroyArray: []
    }

    const registry = (command) => {
        state.commandArray.push(command);
        state.commands[command.name] = (...args) => {
            // 命令名字对应执行函数
            const { redo, undo } = command.execute(...args);
            redo();
            if(!command.pushQueue){
                // 不需要放到队列中直接跳过即可
                return;
            }
            let {queue, current} = state;

            if(queue.length > 0) {
                queue = queue.slice(0, current + 1); // 可能在放置过程中有撤销操作，所以根据当前最新的current值来计算新的队列
                state.queue = queue;
            }
            queue.push({redo, undo}) // 保存指令的前进后退
            state.current = current + 1;

            console.log(queue, 'queue')
        }
    }

    // 注册我们需要的命令
    registry({
        name: 'redo',
        keyboard: 'ctrl+y',
        execute() {
            return {
                redo() { // 重做
                    let item = state.queue[state.current+1]; // 找到当前的下一步， 还原操作
                    if(item) {
                        item.redo && item.redo();
                        state.current++;
                    }
                }
            }
        }
    })

    registry({
        name: 'undo',
        keyboard: 'ctrl+z',
        execute() {
            return {
                redo() { // 撤销
                    if(state.current == -1) {
                        // 没有可以撤销的了
                        return;
                    }
                    let item = state.queue[state.current];
                    if(item) {
                        item.undo && item.undo();
                        state.current--;
                    }
                }
            }
        }
    })

    registry({
        name: 'updateContainer',  // 导入更新整个容器
        pushQueue: true,
        execute(newValue) {
            let state = {
                before: data.value, // 旧的值
                after: newValue // 新的值
            }
            return {
                redo() {
                    // 默认一松手 就直接把当前事情做了
                    data.value = state.after
                },
                undo() {
                    // 前一步的
                    data.value = state.before
                }
            }
        }
    })

    registry({
        name: 'delete',  // 删除操作
        pushQueue: true,
        execute() {
            let state = {
                before: data.value.blocks, // 旧的值
                after: focusData.value.unFocused // 新的值
            }
            return {
                redo() {
                    // 默认一松手 就直接把当前事情做了
                    data.value = {...data.value, blocks: state.after}
                },
                undo() {
                    // 前一步的
                    data.value = {...data.value, blocks: state.before}
                }
            }
        }
    })

    registry({
        name: 'placeTop', // 置顶操作
        pushQueue: true,
        execute() {
            let before = deepcopy(data.value.blocks);
            let after = (() => {  // 置顶就是在所有的block中找到最大的
                let { focus, unFocused } = focusData.value;

                let maxZIndex = unFocused.reduce((prev, block) => {
                    return Math.max(prev, block.zIndex)
                }, -Infinity)

                focus.forEach(block => block.zIndex = maxZIndex + 1); // 让当前选中的比最大值+1

                return data.value.blocks
            })()

            return {
                redo() {
                    // 默认一松手 就直接把当前事情做了
                    data.value = {...data.value, blocks: after}
                },
                undo() {
                    // 前一步的
                    data.value = {...data.value, blocks: before}
                }
            }
        }
    })

    registry({
        name: 'placeBottom', // 置底操作
        pushQueue: true,
        execute() {
            let before = deepcopy(data.value.blocks);
            let after = (() => {  // 置顶就是在所有的block中找到最大的
                let { focus, unFocused } = focusData.value;

                let minZIndex = unFocused.reduce((prev, block) => {
                    return Math.min(prev, block.zIndex)
                }, Infinity) - 1

                // 不能直接 - 1，因为zindex不能出现负值，会在页面底部
                if(minZIndex < 0) { // 这里如果是负值，则让没选中的向上，自己变成0
                    const dur = Math.abs(minZIndex);
                    minZIndex = 0;
                    unFocused.forEach(block => block.zIndex += dur)
                }

                focus.forEach(block => block.zIndex = minZIndex);

                return data.value.blocks
            })()

            return {
                redo() {
                    // 默认一松手 就直接把当前事情做了
                    data.value = {...data.value, blocks: after}
                },
                undo() {
                    // 前一步的
                    data.value = {...data.value, blocks: before}
                }
            }
        }
    })

    registry({ // 如果希望将操作放到队列中可以增加一个属性，标识等会操作要放到队列中
        name: 'drag',
        pushQueue: true,
        init(){ // 初始化操作，默认就会执行
            this.before = null;
            // 监控拖拽开始事件，保存状态
            const start = () => this.before = deepcopy(data.value.blocks);
            // 拖拽之后需要触发对应的指令
            const end = () => state.commands.drag();
            events.on('start', start);
            events.on('end', end);

            return () => {
                events.off('start', start);
                events.off('end', end);
            }
        },
        execute() {
            let before = this.before; // 之前的数据
            let after = data.value.blocks; // 之后的数据
            return {
                redo() {
                    // 默认一松手 就直接把当前事情做了
                    data.value = {...data.value, blocks: after}
                },
                undo() {
                    // 前一步的
                    data.value = {...data.value, blocks: before}
                }
            }
        }
    });

    const keyboardEvent = (() => {
        const keyCodes = {
            90: 'z',
            89: 'y',
        }

        const onKeydown = (e) => {
            const { ctrlKey, keyCode }  = e;
            let keyString = [];
            if(ctrlKey) keyString.push('ctrl');
            keyString.push(keyCodes[keyCode]);
            keyString = keyString.join('+');

            state.commandArray.forEach(({keyboard, name}) => {
                if(!keyboard) return; // 没有键盘事件
                if(keyboard === keyString){
                    state.commands[name]();
                    e.preventDefault();
                }
            })
        }
        const init = () => { // 初始化事件
            window.addEventListener('keydown', onKeydown)

            return () => { // 销毁事件
                window.removeEventListener('keydown', onKeydown)
            }
        }

        return init
    })()

    ;(()=> {
        // 监听键盘事件
        state.destroyArray.push(keyboardEvent())

        state.commandArray.forEach(command => command.init && state.destroyArray.push(command.init()))
    })()

    onUnmounted(() => { // 清理绑定的事件
        state.destroyArray.forEach(fn => fn && fn());
    })
    return state;
}