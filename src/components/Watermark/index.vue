<template>
  <div ref="containerRef" class="watermark-container">
    <slot />
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted, watch } from 'vue';

defineOptions({ name: 'Watermark' });

const props = withDefaults(defineProps<{
  /** 水印文字 */
  text?: string | string[];
  /** 字体大小 */
  fontSize?: number;
  /** 字体颜色 */
  fontColor?: string;
  /** 旋转角度 */
  rotate?: number;
  /** 水印宽度 */
  width?: number;
  /** 水印高度 */
  height?: number;
  /** 水平间距 */
  gapX?: number;
  /** 垂直间距 */
  gapY?: number;
  /** 层级 */
  zIndex?: number;
}>(), {
  text: '',
  fontSize: 16,
  fontColor: 'rgba(0, 0, 0, 0.15)',
  rotate: -22,
  width: 120,
  height: 64,
  gapX: 100,
  gapY: 100,
  zIndex: 9,
});

const containerRef = ref<HTMLDivElement>();
let watermarkDiv: HTMLDivElement | null = null;
let observer: MutationObserver | null = null;

function createWatermark() {
  if (!containerRef.value) return;

  // 移除旧水印
  if (watermarkDiv) {
    watermarkDiv.remove();
  }

  const canvas = document.createElement('canvas');
  const ctx = canvas.getContext('2d');
  if (!ctx) return;

  const ratio = window.devicePixelRatio || 1;
  const canvasWidth = (props.width + props.gapX) * ratio;
  const canvasHeight = (props.height + props.gapY) * ratio;

  canvas.width = canvasWidth;
  canvas.height = canvasHeight;

  ctx.translate(canvasWidth / 2, canvasHeight / 2);
  ctx.rotate((props.rotate * Math.PI) / 180);
  ctx.font = `${props.fontSize * ratio}px sans-serif`;
  ctx.fillStyle = props.fontColor;
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';

  const texts = Array.isArray(props.text) ? props.text : [props.text];
  const lineHeight = props.fontSize * ratio * 1.5;
  const startY = -((texts.length - 1) * lineHeight) / 2;

  texts.forEach((line, index) => {
    ctx.fillText(line, 0, startY + index * lineHeight);
  });

  const base64Url = canvas.toDataURL('image/png');

  watermarkDiv = document.createElement('div');
  watermarkDiv.style.cssText = `
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    pointer-events: none;
    background-repeat: repeat;
    background-image: url(${base64Url});
    background-size: ${props.width + props.gapX}px ${props.height + props.gapY}px;
    z-index: ${props.zIndex};
  `;

  containerRef.value.appendChild(watermarkDiv);

  // 监听水印被删除或修改
  observer = new MutationObserver((mutations) => {
    for (const mutation of mutations) {
      if (mutation.type === 'childList') {
        const removed = Array.from(mutation.removedNodes).includes(watermarkDiv!);
        if (removed) {
          createWatermark();
          return;
        }
      }
      if (mutation.type === 'attributes' && mutation.target === watermarkDiv) {
        createWatermark();
        return;
      }
    }
  });

  observer.observe(containerRef.value, {
    childList: true,
    subtree: true,
    attributes: true,
    attributeFilter: ['style'],
  });
}

onMounted(() => {
  createWatermark();
});

onUnmounted(() => {
  observer?.disconnect();
  watermarkDiv?.remove();
});

watch(
  () => [props.text, props.fontSize, props.fontColor, props.rotate],
  () => {
    createWatermark();
  }
);
</script>

<style scoped lang="scss">
.watermark-container {
  position: relative;
  width: 100%;
  height: 100%;
}
</style>
