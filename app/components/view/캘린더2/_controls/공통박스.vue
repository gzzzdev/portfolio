<template>
  <section :class="rootClass">
    <div class="flex items-center justify-between px-1">
      <p class="text-md font-semibold text-highlighted">
        {{ title }}
      </p>
      <slot name="header-right" />
    </div>

    <div :class="bodyClass">
      <slot name="sub">
        <p
          v-if="sub"
          class="text-sm text-muted"
        >
          {{ sub }}
        </p>
      </slot>

      <slot name="content">
        <p
          v-if="content"
          class="text-sm leading-relaxed text-default"
        >
          {{ content }}
        </p>
      </slot>

      <slot />

      <slot name="bottom">
        <p
          v-if="bottom"
          class="text-sm text-muted"
        >
          {{ bottom }}
        </p>
      </slot>
    </div>

    <div
      v-if="$slots.footer"
      class="flex flex-wrap gap-1 px-1"
    >
      <slot name="footer" />
    </div>
  </section>
</template>

<script setup lang="ts">
interface Props {
  title: string
  sub?: string
  content?: string
  bottom?: string
  rootClass?: string
  bodyClass?: string
}

withDefaults(defineProps<Props>(), {
  sub: '',
  content: '',
  bottom: '',
  rootClass: 'flex w-full max-w-56 flex-col gap-1 rounded-md bg-transparent p-0.5',
  bodyClass: 'flex flex-col gap-1 rounded-md border border-default/50 bg-muted/10 p-1'
})
</script>
