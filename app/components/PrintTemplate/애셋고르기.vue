<template>
  <!--
    보관해 둔 그림을 고르는 자리. **만드는 일은 여기 없다** — `+` 는 부모가 자기 생성기를
    펴게 하는 스위치일 뿐이다(`v-model:만들기`).

    생성기를 이 안으로 끌어들이지 않은 이유: 배경과 표식의 생성기는 어휘가 다르다.
    한쪽은 지질과 문양을 말하고(원형 칩·규격 배너), 한쪽은 인주와 획을 말한다.
    합치면 둘 다 흐려지고, 그러면서도 실제로 공유되는 건 "그리드에서 하나 고르기"뿐이다.
    그 하나만 여기 둔다.
  -->
  <section class="flex flex-col gap-1.5">
    <div class="grid grid-cols-3 gap-1.5">
      <button
        v-for="a in 목록"
        :key="a.rowKey"
        type="button"
        class="group relative aspect-square overflow-hidden rounded-md border transition"
        :class="model === a.링크
          ? 'border-primary ring-2 ring-primary/30'
          : 'border-accented hover:border-primary/60'"
        :title="a.묘사 || '(묘사 없음)'"
        @click="고르기(a)"
      >
        <img
          :src="a.링크"
          alt=""
          class="h-full w-full object-cover"
          loading="lazy"
        >
        <!--
          지우기는 hover 에만 뜬다. 고르는 동작(칸 전체)과 지우는 동작이 같은 칸에 있으므로
          평소엔 숨겨 두지 않으면 고르려다 지운다.
        -->
        <span
          role="button"
          tabindex="-1"
          class="absolute right-0.5 top-0.5 hidden rounded bg-black/55 px-1 text-[0.625rem] leading-4 text-white group-hover:block hover:bg-error"
          title="보관 목록에서 지웁니다 (문서에 이미 얹은 그림은 그대로 남습니다)"
          @click.stop="지우기(a)"
        >×</span>
      </button>

      <!-- 만들기 스위치. 목록이 비어 있어도 이 칸은 늘 있다 — 여기가 유일한 입구다 -->
      <button
        type="button"
        class="flex aspect-square flex-col items-center justify-center gap-0.5 rounded-md border border-dashed transition"
        :class="만들기
          ? 'border-primary bg-primary/10 text-primary'
          : 'border-accented text-muted hover:border-primary/60 hover:text-default'"
        @click="만들기 = !만들기"
      >
        <UIcon
          :name="만들기 ? 'i-lucide-x' : 'i-lucide-plus'"
          class="size-4"
        />
        <span class="text-[0.625rem]">{{ 만들기 ? '닫기' : '만들기' }}</span>
      </button>
    </div>

    <p
      v-if="!목록.length"
      class="px-1 text-xs text-dimmed"
    >
      {{ 빈안내 }}
    </p>
    <p
      v-else-if="종류 === '배경' && 가려진수"
      class="px-1 text-xs text-dimmed"
    >
      다른 규격으로 만든 배경 {{ 가려진수 }}장은 숨겼습니다.
    </p>
  </section>
</template>

<script setup lang="ts">
import { model애셋s, type i애셋종류, type model애셋 } from '~models/test2'

const props = withDefaults(defineProps<{
  종류: i애셋종류
  /**
   * 문서의 폭/높이. 배경일 때만 쓴다 — 비율이 안 맞는 배경은 목록에서 뺀다.
   * 표식은 사각형으로 놓이므로 규격과 무관해 이 값을 보지 않는다.
   */
  문서비율?: number
  빈안내?: string
}>(), {
  문서비율: 0,
  빈안내: '보관된 그림이 없습니다. + 로 하나 만들어 보세요.'
})

/** 고른 그림의 링크. 부모가 이걸 문서에 얹는다 */
const model = defineModel<string | null>({ required: false, default: null })
/** 부모의 생성기를 펴는 스위치 */
const 만들기 = defineModel<boolean>('만들기', { required: false, default: false })

/**
 * 고른 행 전체를 알린다. 링크만으로는 **묘사와 비율이 못 따라온다** —
 * 그 둘이 없으면 "같은 결로 다시 뽑기"의 근거와 규격 판정이 문서에서 사라진다.
 */
const emit = defineEmits<{ 고름: [model애셋] }>()

function 고르기(a: model애셋) {
  model.value = a.링크
  emit('고름', a)
}

const repo = model애셋s.getInstance()

/**
 * 목록은 한 번 읽어 두면 인스턴스가 들고 있다(`BaseModels2.list`).
 * 보관·삭제도 그 안에서 일어나므로 여기서 다시 읽을 일이 없다.
 */
onMounted(() => {
  repo.reads()
})

const 전체 = computed(() => repo.listBy종류(props.종류))
const 목록 = computed(() =>
  props.종류 === '배경' ? repo.list배경(props.문서비율) : repo.list표식())
const 가려진수 = computed(() => 전체.value.length - 목록.value.length)

/**
 * 보관 목록에서만 뺀다. 문서에 이미 얹은 그림은 건드리지 않는다 —
 * 문서는 링크만 들고 있고 그 파일은 그대로 있으므로 화면이 깨지지 않는다.
 */
async function 지우기(a: model애셋) {
  const 지운다 = a.링크 === model.value
    ? window.confirm('지금 쓰고 있는 그림입니다. 보관 목록에서 뺄까요? (문서에는 그대로 남습니다)')
    : true
  if (!지운다) return
  // 물을 자리는 위에서 정했다 — 쓰고 있는 그림일 때만. `delete(true)`면 BaseModel2가 나머지
  // 경우에도 확인창을 띄워, "안 물어도 되는 것"으로 정한 판단이 뒤집힌다.
  await a.delete(false)
}
</script>
