import { defineComponent, type PropType, type VNodeChild } from 'vue';

type RenderFn = (params?: any) => VNodeChild;

export default defineComponent({
  name: 'PureRenderer',
  props: {
    render: {
      type: Function as PropType<RenderFn>,
      required: true,
    },
    params: {
      type: null as unknown as PropType<any>,
      default: undefined,
    },
  },
  setup(props) {
    return () => <>{props.render(props.params)}</>;
  },
});
