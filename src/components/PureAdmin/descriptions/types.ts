import type { VNodeChild } from 'vue';

export type DescriptionsAlign = 'left' | 'center' | 'right';

export type DescriptionsRenderContext = {
  props: Record<string, unknown>;
  attrs: Record<string, unknown>;
  index: number;
  value: unknown;
};

export interface DescriptionsColumn extends Record<string, unknown> {
  prop?: string;
  value?: string | number;
  hide?: boolean | ((attrs: Record<string, unknown>) => boolean);
  slot?: string;
  copy?: boolean;
  labelRenderer?: (context: DescriptionsRenderContext) => VNodeChild;
  cellRenderer?: (context: DescriptionsRenderContext) => VNodeChild;
  align?: DescriptionsAlign;
  labelAlign?: DescriptionsAlign;
}

export interface DescriptionsLoading {
  load?: boolean;
  text?: string;
  svg?: string;
  spinner?: string;
  svgViewBox?: string;
  background?: string;
}

export interface PureDescriptionsProps extends Record<string, unknown> {
  data: Array<Record<string, unknown>>;
  columns: Array<DescriptionsColumn>;
  loading: DescriptionsLoading;
  align: DescriptionsAlign;
  labelAlign: DescriptionsAlign | '';
}
