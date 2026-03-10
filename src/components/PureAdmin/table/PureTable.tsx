import {
  computed,
  defineComponent,
  getCurrentInstance,
  inject,
  nextTick,
  onBeforeUnmount,
  onMounted,
  ref,
  toRef,
  unref,
  type CSSProperties,
  type VNodeChild,
} from 'vue';

import {
  ElConfigProvider,
  ElLoadingDirective,
  ElPagination,
  ElTable,
  ElTableColumn,
} from 'element-plus';

import props from './props';
import { Renderer } from '../shared';
import {
  debounce,
  isBoolean,
  isFunction,
  isString,
  useDark,
} from '../shared';
import type {
  Language,
  PaginationProps,
  PureTableInstallOptions,
  TableColumns,
  TableColumnScope,
} from './types';

type LocaleProvider = Pick<PureTableInstallOptions, 'locale' | 'i18n' | 'ssr'>;

const resolveLocaleValue = (
  value: string | { value: string } | null | undefined,
): string => {
  if (typeof value === 'string') return value;
  return value?.value ?? '';
};

const resolveLocaleMessage = (
  i18n: PureTableInstallOptions['i18n'],
): Language | null | undefined => {
  if (!i18n) return;
  const globalLocale = resolveLocaleValue(i18n.global?.locale);
  const globalMessage = i18n.global?.getLocaleMessage?.(globalLocale);
  const nuxtLocale = resolveLocaleValue(i18n.locale);
  const nuxtMessage = i18n.getLocaleMessage?.(nuxtLocale);
  const elLocale = globalMessage?.['el'] ?? nuxtMessage?.['el'];
  if (!elLocale || typeof elLocale !== 'object') return null;
  return { name: 'custom', el: elLocale as Language['el'] };
};

export default defineComponent({
  name: 'PureTable',
  inheritAttrs: false,
  props,
  directives: {
    Loading: ElLoadingDirective,
  },
  emits: ['page-size-change', 'page-current-change'],
  setup(props, { slots, attrs, emit, expose }) {
    const provider = inject<LocaleProvider>('locale', {
      locale: null,
      i18n: null,
      ssr: false,
    });

    const locale = toRef(props, 'locale');
    const columns = toRef(props, 'columns');
    const loading = toRef(props, 'loading');
    const tableKey = toRef(props, 'tableKey');
    const adaptive = toRef(props, 'adaptive');
    const pagination = toRef(props, 'pagination');
    const alignWhole = toRef(props, 'alignWhole');
    const headerAlign = toRef(props, 'headerAlign');
    const loadingConfig = toRef(props, 'loadingConfig');
    const adaptiveConfig = toRef(props, 'adaptiveConfig');
    const rowHoverBgColor = toRef(props, 'rowHoverBgColor');
    const showOverflowTooltip = toRef(props, 'showOverflowTooltip');

    const isClient = ref(false);
    const isDark = useDark();
    const instance = getCurrentInstance();

    const globalLocale = computed<Language | undefined>(() => {
      const injected = provider?.locale;
      if (!injected || isString(injected)) return undefined;
      return injected as Language;
    });

    const globalI18n = computed<Language | undefined>(() => {
      const localeMessage = resolveLocaleMessage(provider?.i18n);
      if (localeMessage === null) {
        console.warn(
          '@pureadmin/table: element-plus 国际化文件未正确配置到 i18n 中',
        );
        return undefined;
      }
      return localeMessage;
    });

    const localLocale = computed<Language | undefined>(() => {
      const value = unref(locale);
      if (!value || isString(value)) return undefined;
      return value as Language;
    });

    const convertLoadingConfig = computed(() => {
      const config = unref(loadingConfig);
      if (!config) return;
      return {
        'element-loading-text': config.text,
        'element-loading-spinner': config.spinner,
        'element-loading-svg': config.svg,
        'element-loading-svg-view-box': config.viewBox,
      };
    });

    const loadingBackground = computed(() => {
      if (!unref(loading)) return;
      const background = unref(loadingConfig)?.background;
      return {
        'element-loading-background':
          background ??
          (isDark.value
            ? 'rgba(0, 0, 0, 0.45)'
            : 'rgba(255, 255, 255, 0.45)'),
      };
    });

    const hasPagination = computed(() => {
      const pager = unref(pagination);
      return (
        !!pager &&
        pager.currentPage !== undefined &&
        pager.pageSize !== undefined
      );
    });

    const paginationStyle = computed((): CSSProperties => {
      const pager = unref(pagination);
      const pagerAlign = pager?.align ?? 'right';
      return {
        width: '100%',
        margin: '16px 0',
        display: 'flex',
        flexWrap: 'wrap',
        justifyContent:
          pagerAlign === 'left'
            ? 'flex-start'
            : pagerAlign === 'center'
            ? 'center'
            : 'flex-end',
        ...(pager?.style ?? {}),
      };
    });

    const handleSizeChange = (val: number) => {
      const pager = unref(pagination) as PaginationProps;
      pager.pageSize = val;
      emit('page-size-change', val);
    };

    const handleCurrentChange = (val: number) => {
      const pager = unref(pagination) as PaginationProps;
      pager.currentPage = val;
      emit('page-current-change', val);
    };

    const renderColumns = (column: TableColumns, index: number): VNodeChild => {
      const {
        cellRenderer,
        slot,
        headerRenderer,
        headerSlot,
        filterIconSlot,
        expandSlot,
        hide,
        children,
        prop,
        ...args
      } = column;

      const attrsData = attrs as Record<string, unknown>;
      if (isFunction(hide) && hide(attrsData)) return null;
      if (isBoolean(hide) && hide) return null;

      const defaultSlots = {
        default: (scope: TableColumnScope) => {
          const renderContext = {
            ...scope,
            index: scope.$index,
            props: props as unknown as Record<string, unknown>,
            attrs: attrsData,
          };
          if (cellRenderer) {
            return <Renderer render={cellRenderer} params={renderContext} />;
          }
          if (slot) return slots?.[slot]?.(renderContext);
          return null;
        },
      };

      const scopedSlots: Record<string, (scope: TableColumnScope) => VNodeChild> =
        { ...defaultSlots };

      if (headerRenderer) {
        scopedSlots.header = (scope: TableColumnScope) => {
          const renderContext = {
            ...scope,
            index: scope.$index,
            props: props as unknown as Record<string, unknown>,
            attrs: attrsData,
          };
          return <Renderer render={headerRenderer} params={renderContext} />;
        };
      } else if (headerSlot && slots?.[headerSlot]) {
        scopedSlots.header = (scope: TableColumnScope) =>
          slots[headerSlot]?.({
            ...scope,
            index: scope.$index,
            props: props as unknown as Record<string, unknown>,
            attrs: attrsData,
          });
      }

      if (filterIconSlot && slots?.[filterIconSlot]) {
        scopedSlots['filter-icon'] = (scope: TableColumnScope) =>
          slots[filterIconSlot]?.({
            ...scope,
            index: scope.$index,
            props: props as unknown as Record<string, unknown>,
            attrs: attrsData,
          });
      }

      if (expandSlot && slots?.[expandSlot]) {
        scopedSlots.expand = (scope: TableColumnScope) =>
          slots[expandSlot]?.({
            ...scope,
            index: scope.$index,
            props: props as unknown as Record<string, unknown>,
            attrs: attrsData,
          });
      }

      if (children?.length) {
        scopedSlots.default = () =>
          children.map((child, childIndex) => renderColumns(child, childIndex));
      }

      const columnProp = (
        isFunction(prop) ? String(prop(index)) : prop
      ) as string | undefined;

      return (
        <ElTableColumn
          key={index}
          {...(args as Record<string, unknown>)}
          prop={columnProp}
          align={column.align ?? unref(alignWhole)}
          headerAlign={column.headerAlign ?? unref(headerAlign)}
          showOverflowTooltip={
            column.showOverflowTooltip ?? unref(showOverflowTooltip)
          }
        >
          {scopedSlots}
        </ElTableColumn>
      );
    };

    const getTableRef = () =>
      instance?.proxy?.$refs[
        `TableRef${String(unref(tableKey))}`
      ] as { $refs?: Record<string, any> } | undefined;

    const getTableDoms = () => getTableRef()?.$refs;

    const setAdaptive = async () => {
      await nextTick();
      const tableWrapper = getTableDoms()?.tableWrapper as
        | HTMLElement
        | undefined;
      if (!tableWrapper) return;
      const offsetBottom = unref(adaptiveConfig)?.offsetBottom ?? 96;
      tableWrapper.style.height = `${
        window.innerHeight -
        tableWrapper.getBoundingClientRect().top -
        offsetBottom
      }px`;
    };

    const debounceSetAdaptive = debounce(
      setAdaptive,
      unref(adaptiveConfig)?.timeout ?? 60,
    );

    const setHeaderSticky = async (zIndex = 3) => {
      await nextTick();
      const tableHeaderRef = getTableDoms()?.tableHeaderRef?.$el as
        | HTMLElement
        | undefined;
      if (!tableHeaderRef) return;
      tableHeaderRef.style.position = 'sticky';
      tableHeaderRef.style.top = '0';
      tableHeaderRef.style.zIndex = String(zIndex);
    };

    onMounted(() => {
      isClient.value = true;
      nextTick(() => {
        const tableWrapper = getTableDoms()?.tableWrapper as
          | HTMLElement
          | undefined;
        if (tableWrapper && unref(rowHoverBgColor)) {
          tableWrapper.style.setProperty(
            '--el-table-row-hover-bg-color',
            unref(rowHoverBgColor),
            'important',
          );
        }

        if (unref(adaptive)) {
          setAdaptive();
          window.addEventListener('resize', debounceSetAdaptive);
          const adaptiveValue = unref(adaptiveConfig);
          if (adaptiveValue?.fixHeader === false) return;
          setHeaderSticky(adaptiveValue?.zIndex ?? 3);
        }
      });
    });

    onBeforeUnmount(() => {
      if (unref(adaptive)) {
        window.removeEventListener('resize', debounceSetAdaptive);
      }
    });

    expose({
      getTableRef,
      getTableDoms,
      setAdaptive,
      setHeaderSticky,
    });

    const renderTable = () => {
      const pager = (unref(pagination) ?? {
        total: 0,
        pageSize: 5,
        currentPage: 1,
      }) as PaginationProps;
      return (
        <>
          <ElTable {...attrs} ref={`TableRef${String(unref(tableKey))}`}>
            {{
              default: () => unref(columns).map(renderColumns),
              append: () => slots.append?.(),
              empty: () => slots.empty?.(),
            }}
          </ElTable>
          {unref(hasPagination) ? (
            <ElPagination
              {...attrs}
              class="pure-pagination"
              style={unref(paginationStyle)}
              {...(pager as Record<string, unknown>)}
              layout={pager.layout ?? 'total, sizes, prev, pager, next, jumper'}
              pageSizes={pager.pageSizes ?? [5, 10, 15, 20]}
              // Element Plus 类型定义仍用 kebab-case，但运行时已废弃，用 as any 绕过类型检查
              {...({ onSizeChange: handleSizeChange, onCurrentChange: handleCurrentChange } as any)}
            />
          ) : null}
        </>
      );
    };

    const renderPureTable = () => (
      <div
        class="pure-table"
        style="width:100%"
        v-loading={unref(loading)}
        {...unref(loadingBackground)}
        {...unref(convertLoadingConfig)}
      >
        {unref(localLocale) || unref(globalI18n) || unref(globalLocale) ? (
          <ElConfigProvider
            locale={unref(localLocale) ?? unref(globalI18n) ?? unref(globalLocale)}
          >
            {renderTable()}
          </ElConfigProvider>
        ) : (
          renderTable()
        )}
      </div>
    );

    return () => {
      if (provider?.ssr) {
        return isClient.value ? renderPureTable() : null;
      }
      return renderPureTable();
    };
  },
});
