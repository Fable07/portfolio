<!--
  HoverVideo — a still picture that comes alive while hovered (like a moving portrait).

  <HoverVideo :src="clip.url" :poster="clip.thumbnail_url" alt="Me waving" class="size-40" />
  <HoverVideo … :active="cardHovered" />   parent decides when to play (e.g. hovering a whole card)

  • Muted, looping, inline — browsers allow that without a click.
  • When hovering stops it pauses and rewinds, so the first frame is the still picture again.
  • Touch screens have no hover: a tap toggles playback. Keyboard focus plays it too.
  • Cloudinary URLs are optimised (quality + width) via cdnUrl().
-->
<template>
  <video
    ref="video"
    :src="videoSrc"
    :poster="posterSrc || undefined"
    :aria-label="alt"
    role="img"
    muted
    loop
    playsinline
    disablepictureinpicture
    :preload="preload"
    :tabindex="active == null ? 0 : undefined"
    @pointerenter="onPointer($event, true)"
    @pointerleave="onPointer($event, false)"
    @focus="hovering = true"
    @blur="hovering = false"
    @click="onTap"
  ></video>
</template>

<script setup>
import { computed, ref, watch } from 'vue'
import { cdnUrl } from '@/utils/media'

const props = defineProps({
  src: { type: String, required: true },
  poster: { type: String, default: '' },
  alt: { type: String, default: '' },
  /** Largest width to request from Cloudinary (px) */
  width: { type: Number, default: 720 },
  /** Controlled mode: true/false from the parent. null = play while this element is hovered. */
  active: { type: Boolean, default: null },
  preload: { type: String, default: 'metadata' },
})

const video = ref(null)
const hovering = ref(false)
const tapped = ref(false)

const videoSrc = computed(() => {
  const url = cdnUrl(props.src, { width: props.width, video: true })
  // Without a poster, jump to the first frame so the browser paints a still picture
  return props.poster ? url : `${url}#t=0.001`
})
const posterSrc = computed(() => cdnUrl(props.poster, { width: props.width }))
const playing = computed(() => props.active ?? (hovering.value || tapped.value))

// Hover = mouse or pen only; a finger's pointerenter would fight with the tap toggle
function onPointer(event, entering) {
  if (event.pointerType === 'mouse' || event.pointerType === 'pen') hovering.value = entering
}

// Touch-only devices (no hover): a tap starts / stops the clip
const noHover = window.matchMedia?.('(hover: none)').matches ?? false

function onTap() {
  if (props.active == null && noHover) tapped.value = !tapped.value
}

watch(playing, (play) => {
  const el = video.value
  if (!el) return
  if (play) {
    el.play().catch(() => {}) // autoplay refused or source missing: stay still
  } else {
    el.pause()
    el.currentTime = 0
  }
})
</script>
