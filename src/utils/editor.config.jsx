// 列表区可以显示所有的物料
// key对应的组件映射关系

import { ElButton, ElInput } from "element-plus";
import { h } from 'vue';


function createEditorConfig() {
    const componentList = [];
    const componentMap = {};

    return {
        componentList,
        componentMap,
        register: (component) => {
            componentList.push(component)
            componentMap[component.key] = component
        }
    }
}


export let registerConfig = createEditorConfig();
// console.log(registerConfig, 'registerConfig')

registerConfig.register({
    label: '文本',
    preview: () => '预览文本',
    render: () => '渲染文本',
    key: 'text'
})

registerConfig.register({
    label: '按钮',
    preview: () => <ElButton>预览按钮</ElButton>,
    render: () => <ElButton>渲染文本</ElButton>,
    key: 'button'
})

registerConfig.register({
    label: '输入框',
    preview: () => <ElInput placeholder="请输入文本"></ElInput>,
    render: () => <ElInput placeholder="请输入文本"></ElInput>,
    key: 'input'
})