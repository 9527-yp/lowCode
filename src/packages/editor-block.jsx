import { computed, defineComponent, h, inject, ref, onMounted } from "vue";

export default defineComponent({
    props: {
        block:{type: Object}
    },
    setup(props) {
        // console.log(props.block, 'props.block')
        const blockStyles = computed(() => ({
            top: `${props.block.top}px`,
            left: `${props.block.left}px`,
            zIndex: `${props.block.zIndex}`,
        }))

        const config = inject('config')

        const blockRef = ref(null);
        onMounted(() => {
            let {offsetWidth, offsetHeight} = blockRef.value
            // console.log(blockRef.value, 'blockRef.value')
            if(props.block.alignCenter) {
                // 说明是拖拽松手的时候才渲染的，其他的默认渲染到页面上的内容不需要居中
                props.block.left = props.block.left - offsetWidth/2
                props.block.top = props.block.top - offsetHeight/2
                props.block.alignCenter = false;
            }
            props.block.width = offsetWidth;
            props.block.height = offsetHeight;
            
        })
        return () => {
            // 通过block的key属性直接获取对应的组件
            const component = config.componentMap[props.block.key]
            
            // 获取render函数
            const RenderComponent = component.render()
            return <div class="editor-block" ref={blockRef} style={blockStyles.value}>
                {RenderComponent}
            </div>
        }
    }
})