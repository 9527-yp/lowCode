import { defineComponent, h, computed, inject, ref } from "vue";

import { ArrowLeft, ArrowRight, Upload, Download, Top, Bottom, Delete, View, Edit, Close } from '@element-plus/icons-vue'

import EditorBlock from './editor-block.jsx';
import "./editor.scss";
import deepcopy from "deepcopy";
import { $dialog } from "../components/Dialog.jsx";
import { useMenuDragger } from './useMenuDragger.js';
import { useFocus } from './useFocus.js';
import { useBlockDragger } from "./useBlockDragger.js";
import { useCommand } from './useCommand.js';


export default defineComponent({
    props: {
        state: {type: Object}
    },
    emits: ['update:state'],
    setup(props, ctx){
        // 预览的时候，内容不能再操作了，可以点击输入内容，方便看效果
        const previewRef = ref(false);
        const editorRef = ref(true);

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
        const { focusData, lastSeleteBlock, blockMousedown, containerMousedown, clearBlockFocus } = useFocus(data, previewRef, (e) => {
            // 获取焦点后进行拖拽
            mousedown(e)
        });

        // 实现组件拖拽
        let { mousedown, markLine } = useBlockDragger(focusData, lastSeleteBlock, data)
    

        const { commands } = useCommand(data, focusData);
        const buttons = [
            {
                label: '撤销',
                icon: <ArrowLeft />,
                handler: () => commands.undo()
            },
            {
                label: '重做',
                icon: <ArrowRight />,
                handler: () => commands.redo()
            },
            {
                label: '导出',
                icon: <Download />,
                handler: () => {
                    $dialog({
                        title: '导出JSON数据',
                        content: JSON.stringify(data.value),
                        footer: false,
                    })
                }
            },
            {
                label: '导入',
                icon: <Upload />,
                handler: () => {
                    $dialog({
                        title: '导入JSON数据',
                        content: '',
                        footer: true,
                        onConfirm(text){

                            commands.updateContainer(JSON.parse(text))
                        }
                    })
                }
            },
            {
                label: '置顶',
                icon: <Top />,
                handler: () => commands.placeTop()
            },
            {
                label: '置底',
                icon: <Bottom />,
                handler: () => commands.placeBottom()
            },
            {
                label: '删除',
                icon: <Delete />,
                handler: () => commands.delete()
            },
            {
                label: previewRef.value ? '编辑' : '预览',
                icon: previewRef.value ? <Edit/> : <View/>,
                handler: () => {
                    previewRef.value = !previewRef.value
                    clearBlockFocus();
                }
            },
            {
                label: '关闭',
                icon: <Close/>,
                handler: () => {
                    editorRef.value = false
                    clearBlockFocus();
                }
            },
        ]

        const onContextMenuBlock = (e, block) => {
            e.preventDefault(); // 关闭默认事件
        }


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
            <div class="editor-top">
                {buttons.map((btn) => {
                    const icon = typeof btn.icon === 'function' ? btn.icon() : btn.icon
                    const label = typeof btn.label === 'function' ? btn.label() : btn.label
                    return <div onClick={btn.handler} class="editor-top-button">
                        <el-icon class="editor-top-button-icon">{icon}</el-icon>
                        <span>{label}</span>
                    </div>
                })}
            </div>
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
                                     class={[block.focus ? 'editor-block-focus' : '', previewRef.value ? 'editor-block-preview' : '']}
                                     block={block} 
                                     onMousedown={(e) => blockMousedown(e, block, index)}
                                     onContextmenu = {(e) => onContextMenuBlock(e, block)}
                                    ></EditorBlock>
                                )
                            )
                        }
                        {markLine.x !== null && <div class="line-x" style={{left: markLine.x + 'px'}}></div>}
                        {markLine.y !== null && <div class="line-y" style={{top: markLine.y + 'px'}}></div>}
                    </div>
                </div>
            </div>
        </div>
    }
})