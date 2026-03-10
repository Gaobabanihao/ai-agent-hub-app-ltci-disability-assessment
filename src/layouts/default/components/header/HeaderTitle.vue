<script setup lang="ts">
import { useWindowSize } from '@vueuse/core';
import { computed } from 'vue';

defineOptions({
  name: 'HeaderTitle',
});

interface HeaderBreadcrumbItem {
  key: string;
  title: string;
}

interface RenderBreadcrumbItem extends HeaderBreadcrumbItem {
  isEllipsis?: boolean;
}

const props = defineProps<{
  items: HeaderBreadcrumbItem[];
}>();

const { width } = useWindowSize();

const maxVisibleCount = computed(() => {
  if (width.value < 768) {
    return 2;
  }

  if (width.value < 1200) {
    return 3;
  }

  if (width.value < 1600) {
    return 4;
  }

  return 6;
});

const normalizedItems = computed<HeaderBreadcrumbItem[]>(() => {
  const items = props.items.filter((item) => item?.title?.trim());
  if (items.length > 0) {
    return items;
  }

  return [{ key: 'fallback', title: '首页' }];
});

const displayItems = computed<RenderBreadcrumbItem[]>(() => {
  const items = normalizedItems.value;
  const maxCount = maxVisibleCount.value;

  if (items.length <= maxCount) {
    return items;
  }

  if (maxCount <= 2) {
    const first = items[0];
    const last = items[items.length - 1];
    if (!first || !last) {
      return items;
    }

    return [first, last];
  }

  const tailCount = maxCount - 2;
  const first = items[0];
  if (!first) {
    return items;
  }

  return [
    first,
    { key: 'breadcrumb-ellipsis', title: '...', isEllipsis: true },
    ...items.slice(-tailCount),
  ];
});

const fullPathTitle = computed(() => normalizedItems.value.map((item) => item.title).join(' > '));
</script>

<template>
  <div class="header-title" :title="fullPathTitle">
    <template v-for="(item, index) in displayItems" :key="item.key">
      <span v-if="index > 0" class="separator">&gt;</span>
      <span
        class="crumb"
        :class="{
          current: index === displayItems.length - 1,
          ellipsis: item.isEllipsis,
        }"
      >
        {{ item.title }}
      </span>
    </template>
  </div>
</template>

<style lang="scss" scoped>
.header-title {
  display: flex;
  align-items: center;
  min-width: 0;
  overflow: hidden;
  color: #5f6a7b;
  font-size: 14px;
  line-height: 1;
  white-space: nowrap;
}

.separator {
  flex: 0 0 auto;
  margin: 0 8px;
  color: #a4adbb;
}

.crumb {
  flex: 0 1 auto;
  min-width: 0;
  max-width: clamp(88px, 14vw, 220px);
  overflow: hidden;
  text-overflow: ellipsis;
}

.crumb.ellipsis {
  flex-shrink: 0;
  max-width: none;
}

.crumb.current {
  color: #30394b;
  font-weight: 600;
}

@media (max-width: 992px) {
  .header-title {
    font-size: 13px;
  }

  .separator {
    margin: 0 6px;
  }

  .crumb {
    max-width: 120px;
  }
}

@media (max-width: 768px) {
  .header-title {
    font-size: 12px;
  }

  .separator {
    margin: 0 4px;
  }

  .crumb {
    max-width: 92px;
  }
}
</style>
