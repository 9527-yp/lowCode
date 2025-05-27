import { createVNode, defineComponent, render, h, reactive } from "vue";
import { ElDialog, ElInput, ElButton } from 'element-plus';

const DialogComponent = defineComponent({
    props: {
        option: {type: Object}
    },
    setup(props, ctx) {

        const state = reactive({
            option: props.option,
            isShow: false,
        })

        ctx.expose({ // 让外界可以调用里面的方法
            showDialog(option) {
                state.option = option;
                state.isShow = true;
            }
        })
        return () => {


            return <ElDialog title={'测试'} v-model={state.isShow}>
                {{
                    default: () => <ElInput type="textarea" v-model={state.option.content} rows="10"></ElInput>,
                    footer: () => state.option.footer && <div>
                        <ElButton onClick={() =>{}}>取消</ElButton>
                        <ElButton type="primary" onClick={() =>{}}>确定</ElButton>
                    </div>
                }}
            </ElDialog>
        }
    }
})
let vm;
export function $dialog(option) {

    if(!vm){ // 节点存在就不用再创建节点
        let el = document.createElement('div');
        vm = createVNode(DialogComponent, {option}) // 将组件渲染成虚拟节点
        // console.log(vm, 'vm')
        document.body.appendChild((render(vm, el), el)) // 渲染成真实节点扔到页面中
    }
    

    // 将组件渲染到这个el元素上
    let { showDialog } = vm.component.exposed;
    showDialog(option);
}