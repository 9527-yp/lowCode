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

        const onCancel = () => {
            state.isShow = false;
        }

        const onConfirm = () => {
            state.isShow = false;
            state.option.onConfirm && state.option.onConfirm(state.option.content)
        }
        return () => {
            return h(ElDialog, {
                title: state.option.title,
                modelValue: state.isShow,
                beforeClose: onCancel
            }, {
                default: () => h(ElInput, {
                    type: "textarea",
                    modelValue: state.option.content,
                    rows: 10,
                    'onUpdate:modelValue': (val) => state.option.content = val
                }),
                footer: () => state.option.footer && h('div', [
                    h(ElButton, { onClick: onCancel }, '取消'),
                    h(ElButton, { type: 'primary', onClick: onConfirm }, '确定')
                ])
            })
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