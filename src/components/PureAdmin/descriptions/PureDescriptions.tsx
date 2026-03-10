import { ElDescriptions, ElDescriptionsItem } from 'element-plus';
import {
  computed,
  defineComponent,
  ref,
  type VNodeChild,
} from 'vue';

import props from './props';
import { Renderer } from '../shared';
import {
  delay,
  isArray,
  isBoolean,
  isFunction,
  useCopyToClipboard,
} from '../shared';
import type {
  DescriptionsColumn,
  DescriptionsRenderContext,
} from './types';

const copySvg = new URL('./copy.svg', import.meta.url).href;
const checkSvg = new URL('./check.svg', import.meta.url).href;

export default defineComponent({
  name: 'PureDescriptions',
  inheritAttrs: false,
  props,
  setup(props, { slots, attrs }) {
    const pureProps = props as {
      data: Array<Record<string, unknown>>;
      columns: DescriptionsColumn[];
      align: 'left' | 'center' | 'right';
      labelAlign: 'left' | 'center' | 'right' | '';
      loading: {
        load?: boolean;
        text?: string;
        svg?: string;
        spinner?: string;
        svgViewBox?: string;
        background?: string;
      };
    };
    const curCopyActive = ref(-1);
    const copied = ref(false);

    const data = computed(() => pureProps.data ?? []);
    const columns = computed(() => pureProps.columns ?? []);
    const align = computed(() => pureProps.align ?? 'left');
    const labelAlign = computed(() => pureProps.labelAlign ?? '');
    const loading = computed(() => pureProps.loading ?? {});

    const descriptionsProps = computed(() => {
      const {
        data: _data,
        columns: _columns,
        loading: _loading,
        align: _align,
        labelAlign: _labelAlign,
        ...rest
      } = props as Record<string, unknown>;
      return rest;
    });

    const titleSlot = {
      title: () => slots.title?.({ props, attrs }),
    };
    const extraSlot = {
      extra: () => slots.extra?.({ props, attrs }),
    };
    const descriptionsSlot =
      slots.title && slots.extra
        ? { ...titleSlot, ...extraSlot }
        : slots.title
        ? titleSlot
        : slots.extra
        ? extraSlot
        : undefined;

    const { update } = useCopyToClipboard();

    const onCopy = (value: string | number | unknown[], index: number) => {
      curCopyActive.value = index;
      copied.value = true;
      const source = isArray(value) ? value[0] : value;
      void update(String(source ?? ''));
      delay(600).then(() => {
        copied.value = false;
        curCopyActive.value = -1;
      });
    };

    const copyStyle = computed(() => ({
      cursor: 'pointer',
      marginLeft: '4px',
      verticalAlign: 'sub',
    }));

    const copySrc = computed(
      () => (index: number) =>
        curCopyActive.value === index && copied.value ? checkSvg : copySvg,
    );

    const getRenderContext = (
      index: number,
      value: unknown,
    ): DescriptionsRenderContext => ({
      props: props as unknown as Record<string, unknown>,
      attrs: attrs as Record<string, unknown>,
      index,
      value,
    });

    const renderCell = (
      column: DescriptionsColumn,
      index: number,
      value: unknown,
    ): VNodeChild => {
      if (column.cellRenderer) {
        return (
          <Renderer
            render={column.cellRenderer}
            params={getRenderContext(index, value)}
          />
        );
      }

      if (column.slot) {
        return slots?.[column.slot]?.(getRenderContext(index, value));
      }

      const columnValue = column.value ?? value;
      return (
        <>
          {columnValue as VNodeChild}
          {column.copy ? (
            <img
              src={copySrc.value(index)}
              style={copyStyle.value}
              onClick={() => onCopy(columnValue as string | number, index)}
            />
          ) : null}
        </>
      );
    };

    return () => (
      <ElDescriptions
        {...descriptionsProps.value}
        {...attrs}
        v-slots={descriptionsSlot}
        v-loading={loading.value.load}
        element-loading-text={loading.value.text ?? 'Loading...'}
        element-loading-svg={loading.value.svg}
        element-loading-spinner={loading.value.spinner}
        element-loading-svg-view-box={loading.value.svgViewBox}
        element-loading-background={loading.value.background}
      >
        {columns.value.map((column, index) => {
          const values = data.value.map(item => item[column.prop ?? '']);
          const value = values[0];
          const columnHide = column.hide;

          if (isFunction(columnHide) && columnHide(attrs as Record<string, unknown>)) {
            return null;
          }
          if (isBoolean(columnHide) && columnHide) {
            return null;
          }

          const labelRenderer = column.labelRenderer;
          const itemSlots = labelRenderer
            ? {
                label: () => (
                  <Renderer
                    render={labelRenderer}
                    params={getRenderContext(index, value)}
                  />
                ),
                default: () => renderCell(column, index, value),
              }
            : {
                default: () => renderCell(column, index, value),
              };

          return (
            <ElDescriptionsItem
              key={index}
              {...column}
              align={column.align ?? align.value}
              labelAlign={column.labelAlign ?? (labelAlign.value || undefined)}
            >
              {itemSlots}
            </ElDescriptionsItem>
          );
        })}
      </ElDescriptions>
    );
  },
});
