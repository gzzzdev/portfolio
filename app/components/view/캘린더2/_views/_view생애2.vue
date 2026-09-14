<template>
  <div class="h-full rounded-lg border border-default/50 bg-default/40 p-3">
    <div class="h-[320px]">
      <mChart영역
        :data="props.data"
        :options="chartOptions"
        :current="3"
      />
    </div>
  </div>
</template>

<script setup lang="ts">
// import mChart영역 from '~/components/m/Chart/영역';
type 차트데이터셋 = {
  label: string
  data: number[]
  fill?: boolean
  color?: string
}

type 차트데이터 = {
  labels: string[]
  datasets: 차트데이터셋[]
}

const props = defineProps<{
  data: 차트데이터
}>()

const chartOptions = {
  ticks: {
    callback: (value: string | number) => `${value}%`
  }
}
</script>
