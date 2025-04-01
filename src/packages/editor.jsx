import { defineComponent, h, computed, inject, ref } from "vue";
import EditorBlock from './editor-block.jsx';
import "./editor.scss";
import deepcopy from "deepcopy";
import { useMenuDragger } from './useMenuDragger.js';
import { useFocus } from './useFocus.js';
import { useBlockDragger } from "./useBlockDragger.js";


export default defineComponent({
    props: {
        state: {type: Object}
    },
    emits: ['update:state'],
    setup(props, ctx){
        const data = computed({
            get: () => props.state,
            set: (newValue) => ctx.emit("update:state", deepcopy(newValue))
        })

        const containerStyles = computed(() =>({
            width: data.value.container.width + 'px',
            height: data.value.container.height + 'px',
        }))

        const config = inject('config')
        // console.log(config, 'config')

        const containerRef = ref(null);
        // 1, 实现菜单的拖拽功能
        const { dragstart, dragend } = useMenuDragger(containerRef, data);

        // 2, 实现获取焦点，选中后可能直接就进行拖拽了
        const { focusData, lastSeleteBlock, blockMousedown, containerMousedown } = useFocus(data, (e) => {
            // 获取焦点后进行拖拽
            mousedown(e)
        });

        // 实现组件拖拽
        let { mousedown } = useBlockDragger(focusData)
    

        return () => <div class="editor">
            <div class="editor-left">
                {/* 根据注册列表渲染内容 可以实现h5的拖拽*/}
                {
                    config.componentList.map(component => {
                        return <div 
                          class="editor-left-item"
                          draggable
                          onDragstart={(e) => dragstart(e, component)}
                          onDragend={dragend}
                        >
                            <span>{component.label}</span>
                            <div>{component.preview()}</div>
                        </div>
                    })
                }
            </div>
            <div class="editor-top">菜单栏</div>
            <div class="editor-right">属性控制栏目</div>
            <div class="editor-container">
                {/* 负责产生滚动条 */}
                <div class="editor-container-eanvas">
                    {/* 产生内容区域 */}
                    <div
                      class="editor-container-eanvas-content"
                      ref={containerRef}
                      style={containerStyles.value}
                      onMousedown={containerMousedown}
                      >
                        {
                            (
                                data.value.blocks.map((block, index) => 
                                    <EditorBlock
                                     class={block.focus ? 'editor-block-focus' : ''}
                                     block={block} 
                                     onMousedown={(e) => blockMousedown(e, block, index)} 
                                    ></EditorBlock>
                                )
                            )
                        }
                    </div>
                </div>
            </div>
        </div>
    }
})