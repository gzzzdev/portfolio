<template>
  <!--
      상세4와 같은 껍데기(탭·상단 버튼바·저장/삭제)에, 필드 영역만 여러 열로 그리는 판.
      폭이 좁으면 상세4와 똑같이 한 열로 떨어진다 — 다른 점은 `view모델필드s2` 하나뿐이다.
      필드가 반 칸/한 줄/옆 열 중 어디로 갈지는 필드 스펙의 `폭`(없으면 타입에서 유도)이 정한다.
    -->

  <!-- is투명 -->
  <mBox유리 v-if="model !== undefined" :is중첩="is중첩" :is투명="is투명">
    <template #top>
      <slot name="top">
        <!--
                  좁은 화면의 시트 머리. **뒤로·수정·저장은 시트의 손잡이라 내용보다 위에 있다.**

                  이 셋은 원래 아래 탭 줄에 섞여 있었고, 거기서 둘 다 깨져 있었다.
                  - 뒤로는 정체성 머리글·요약 타일 **아래**(화면 250px 지점) 탭 왼쪽에 붙어서,
                    「나가기」가 아니라 「탭이 더 있음」으로 읽혔다.
                  - 수정 스위치는 **탭이 여럿인 가지에서 `v-if="false"` 로 죽어 있었다**(2026-09-03부터).
                    회원처럼 자동필드ss 가 여러 벌인 모델은 그 가지를 타므로, 모바일 상세에 수정으로
                    들어가는 길이 아예 없었다 — 목록 헤더의 스위치는 시트 뒤에 깔린다.

                  두 가지(탭 여럿 / 하나)가 각자 이 셋을 들고 있어서 한쪽만 고쳐지곤 했다. 이제 가지 밖
                  한 곳이다. 넓은 화면(`!is미니`)에는 안 뜬다 — 그쪽은 목록 헤더가 같은 일을 한다.
                -->
        <div v-if="is미니" class="w-full flex flex-row items-center gap-1 pb-1">
          <mButton class="p-1" 역할="조용" icon="i-material-symbols-light-arrow-back-ios-new-rounded" @click.stop.prevent="() => emit('onClose')" />
          <div class="grow" />
          <mSwitch2 v-if="can?.수정" v-model="is수정중" :label="is수정중 ? '읽기모드로' : '수정하기'" is반대 />
          <mButton v-if="model?.is수정됨" class="p-1" icon="i-material-symbols-light-save-outline-rounded" :loading="model?.is저장중" @click.stop.prevent="() => { model?.do저장(); emit('onDo') }" />
        </div>

        <!--
                  정체성 머리글. 그동안 이 판에는 "지금 누구를 보고 있는지"가 없었다 —
                  고유번호 입력칸 값으로 유추하는 게 전부였고, 왼쪽 목록에서 고른 카드와 오른쪽 폼이 서로 남남이었다.
                  라벨/부제/뱃지는 목록 카드가 쓰는 것과 같은 접근자(`label`·`sub`·`badges`)라 두 판이 저절로 맞는다.
                -->
        <div v-if="머리글.has" class="w-full flex flex-row items-center gap-3 px-1 pt-1 pb-2">
          <NuxtImg v-if="머리글.thumbnail" :src="머리글.thumbnail" :alt="머리글.label" class="size-11 shrink-0 rounded-full object-cover ring-1 ring-default bg-elevated" />
          <mIcon v-else-if="머리글.icon" :name="머리글.icon" class="size-11 shrink-0 rounded-full p-2.5 text-muted bg-elevated" />

          <div class="min-w-0 grow flex flex-col gap-0.5">
            <!--
                          제목 줄. **여긴 읽는 자리가 기본이다.**
                          제목은 입력 상자가 아니라 `m라벨`이다 — 평소엔 글자고, 옆의 작은 연필을 눌러야
                          고치는 칸이 된다(목록5 머리의 「인물 ✎」와 같은 손잡이). 폼처럼 상자를 깔면
                          읽으러 온 화면이 통째로 편집 폼처럼 보인다.
                          부제(`sub`)는 그대로 글자다 — 고칠 수 있는 값이 아니다.
                          모델이 `position:'top'`으로 올린 칸은 오른쪽에 붙는다.
                        -->
            <div class="flex flex-row flex-wrap items-center gap-x-2 gap-y-1 min-w-0">
              <m라벨 v-if="라벨칸" size="xl" :can수정="!is상단잠김(라벨칸)" :label="라벨칸.value" @update:label="(v: string) => 라벨칸.setter(v)" />
              <span v-else class="truncate text-xl leading-tight pl-2" :class="머리글.label ? 'text-highlighted' : 'text-dimmed italic'">
                {{ 머리글.label || '제목 없음' }}
              </span>

              <span
                v-if="머리글.sub"
                class="shrink-0 text-xs text-muted"
              >{{ 머리글.sub }}</span>

              <div class="grow" />

              <template v-for="(item, idx) in 상단필드s" :key="item.key">
                <div v-if="!item.is라벨 && toValue(item.show)" class="shrink-0 min-w-0">
                  <ClientOnly>
                    <component v-bind="toValue(item.props)" :is="item.comp" v-model:is-doing="get상단로딩Ref(idx).value" :model-value="item.value" :readonly="is상단잠김(item)" @update:model-value="(v) => item.setter(v)" />
                  </ClientOnly>
                </div>
              </template>
            </div>
            <div v-if="머리글.badges.length" class="flex flex-row flex-wrap items-center gap-1">
              <UBadge v-for="(badge, i) in 머리글.badges" :key="i" :label="badge.label" :color="badge.color" :icon="badge.icon" size="sm" />
            </div>
          </div>
        </div>

        <!--
                  요약 타일. 판단에 쓰는 값(언제부터 회원인지·회비는 됐는지)을 폼보다 위에 둔다 —
                  이게 없으면 이 판은 '관리'가 아니라 그냥 편집 폼이다. 모델이 `요약s`를 안 주면 통째로 안 뜬다.

                  타일은 스크롤 칸(`m/Box/유리.vue` 의 `overflow-y-auto`) **바깥** `#top` 이라
                  **접든 펴든 안 밀리고 계속 먹는 크롬**이다. 그래서 좁은 칸에서 자리를 어떻게든 줄여야 한다.

                  **걷지 않고 줄인다**(`is요약압축`). 한동안 「세로가 좁으면 통째로 안 그린다」였고
                  그 판단을 목록5 가 내려보냈다(`is좁은높이`). 둘 다 틀렸다 —
                  (1) 그 값은 「저장해 둔 **카드**가 3장 서나」라서 상세와 상관이 없고, 폰 세로 + 가로카드에서는
                  거짓이 나와 타일 넷이 두 줄로 감긴 채 190px 을 먹었다(2026-09-12 실측).
                  (2) 통째로 걷으면 **「회비 미납」이 사라진다** — 그 신호만은 폼에 칸이 없다
                  (`model회원.ts` 의 `is회비완납` 은 `show: !true`). 필터 조건줄이 접혀도 고른 칩과 개수를
                  남기는 것과 같은 이유다: **상태를 말하는 것은 걷는 것이 아니라 줄이는 것**이 답이다.

                  줄인 모양은 **라벨과 값을 한 줄에** 놓고 부제(원본 날짜)를 버린다 — 부제는 아래 폼에
                  칸이 있다(`가입일`). 세 줄 × 두 벌이 한 줄이 되면서 190 → 30px 이 된다.

                  **줄인 줄은 감기지 않는다**(`flex-nowrap`). 줄이는 목적이 한 줄이라, 감기면 줄여 놓고도
                  두 줄을 먹는다 — 폰 세로(411px)에서 넷이 11px 모자라 「이력」만 혼자 내려가고 「회비」 옆이
                  빈 채로 두 줄이 됐다(2026-09-13 실측). 그 11px 은 칩의 제 여백에서 돌려받는다(`px-2 gap-1.5`
                  → `px-1.5 gap-1`, 칩 사이도 8 → 6). 그래도 모자라면 **라벨이 먼저 줄고**(값은 `shrink-0`)
                  숫자는 끝까지 남는다 — 읽으러 온 것은 값이지 라벨이 아니다.

                  판단은 이 판이 **제 칸 폭으로** 한다(`is요약압축`) — 시트로 열리면 상세가 화면 전체를 쓰고
                  목록 칸과 무관해지므로, 목록5 가 내려보내는 값으로는 이 자리를 맞출 수 없다.
                -->
        <div v-if="요약s.length" ref="ref요약칸" class="w-full flex flex-row px-1 pb-2" :class="is요약압축 ? 'flex-nowrap gap-1.5' : 'flex-wrap gap-2'">
          <div v-for="(tile, i) in 요약s" :key="i" class="rounded-lg bg-muted ring-1 ring-default" :class="is요약압축 ? 'flex flex-row items-baseline gap-1 min-w-0 px-1.5 py-1' : 'min-w-22 grow basis-0 px-3 py-2'">
            <div class="flex flex-row items-center gap-1 text-[0.625rem] leading-none text-dimmed" :class="is요약압축 && 'min-w-0'">
              <mIcon v-if="tile.icon" :name="tile.icon" class="size-3 shrink-0" />
              <span class="truncate">{{ tile.label }}</span>
            </div>
            <div class="truncate leading-tight" :class="[타일색(tile.color), is요약압축 ? 'shrink-0 text-sm' : 'mt-1 text-base']">
              {{ tile.value }}
            </div>
            <div v-if="tile.sub && !is요약압축" class="truncate text-[0.625rem] leading-none text-dimmed">
              {{ tile.sub }}
            </div>
          </div>
        </div>

        <div class="w-full flex flex-row gap-2 mt-1">
          <mTabs v-if="has복수자동필드" v-model="tab자동필드" class="h-3 grow" :items="model?.자동필드ss?.filter(x => toValue(x.show ?? true)).map(x => ({ label: x.label, value: x.label })) ?? []">
            <template #top>
              <div class="flex flex-row gap-1">
                <template v-for="item in 버튼s.filter(x => x.position == 'top')">
                  <mButton v-if="toValue(item.show) && ((item.is수정할때만 && is수정중) || !item.is수정할때만)" :icon="item.icon" :label="is미니 ? undefined : item.label" @click="() => { item.onClick(); emit('onDo') }" />
                </template>

                <div class="grow h-8" />
                <!-- 빈칸이라도 있어야함. -->
                <!-- 수정·저장은 위 시트 머리로 갔다. -->
              </div>
            </template>
          </mTabs>
          <div v-else class="grow flex flex-row gap-1 justify-end">
            <template v-for="item in 버튼s.filter(x => x.position == 'top')">
              <mButton v-if="toValue(item.show) && ((item.is수정할때만 && is수정중) || !item.is수정할때만)" :icon="item.icon" :label="is미니 ? undefined : item.label" @click="() => { item.onClick(); emit('onDo') }" />
            </template>
            <!-- 수정·저장은 위 시트 머리로 갔다. -->
          </div>

          <!-- || true -->
        </div>

        <!-- 탭 밑줄. 구조선(border-default)이 아니라 **컨트롤선**이다 — 담는 선이 아니라
                     탭 컨트롤의 일부라, 바로 아래 입력칸 테두리(ring-accented)와 같은 층이어야 한다. -->
        <USeparator class="mt-2 mb-4" :ui="{ border: 'border-accented' }" />
      </slot>
    </template>

    <view모델필드s2 :items="표시필드s" :그룹라벨="선택자동그룹?.label ?? ''" :is한줄="true" :is수정중="is수정중" need-can수정 :can="can" :get로딩Ref="get로딩Ref">
      <template v-if="is수정중 && can?.삭제">
        <USeparator class="mt-6" />
        <div class="flex flex-wrap gap-2 justify-end mr-2 mt-3 mb-2">
          <mButton v-if="can?.삭제" :icon="!true ? 'i-material-symbols-light-close' : 'i-material-symbols-light-delete-outline-rounded'" color="error" label="삭제" :loading="model?.is삭제중" @click.stop.prevent="() => { model?.delete()?.then((is지웠다) => { if (!is지웠다) return; emit('onClose'); emit('onDo') }) }" />
        </div>
      </template>
    </view모델필드s2>

    <template #bot>
      <slot name="bot" />
    </template>
  </mBox유리>
</template>

<script setup lang="ts">
import { useElementSize } from '@vueuse/core'
import { computed, toValue, useTemplateRef } from 'vue'

interface i기타 {
  is한줄?: boolean
  is미니?: boolean
  is중첩?: boolean
  is투명?: boolean
  // can.수정?: boolean;
  can?: {
    생성?: boolean
    수정?: boolean
    삭제?: boolean
    // 저장?: boolean;

    // update?: boolean;
  }
}
interface Emits {
  'onDo'?: () => void
  'onClose'?: () => void
  'update:isDoing'?: (isDoing: boolean) => void
}
const props = withDefaults(defineProps<i기타>(), {
  is한줄: false,
  is미니: false,
  is중첩: false,
  is투명: false,
  can: () => ({
    생성: false,
    수정: false,
    삭제: false
  })
})
const model = defineModel<any>({ required: false, default: () => ({}) })

const is수정중 = defineModel<boolean>('is수정중', { default: false })

const emit = defineEmits<Emits>()

const tab자동필드 = defineModel<string>('tab자동필드', { required: true, default: '' })
const ratio = defineModel<number>('ratio', { required: !true })

const { 버튼s, 선택자동그룹, 상단필드s, 표시필드s, get로딩Ref, get상단로딩Ref } = useModelForm(model, {
  tab자동필드,
  ratio,
  emit
})

/** 머리글의 제목 자리. `get상단필드s`가 `label`과 값이 같은 칸을 찾아 표시해 둔다. */
const 라벨칸 = computed(() => 상단필드s.value.find((x: any) => x?.is라벨))

/**
 * 머리글 칸이 잠겼나. `view모델필드s2`의 `isItemReadonly`(needCan수정 켠 쪽)와 **같은 규칙이다** —
 * 같은 필드가 위에 있느냐 아래 있느냐로 고칠 수 있고 없고가 갈리면 안 된다.
 */
const is상단잠김 = (item: any) =>
  !(toValue(is수정중) && props.can?.수정 && toValue(item.canEdit))

useKeysShortcut('esc', () => {
  if (props.is미니)
    emit('onClose')
    // props.repository?.do모두저장();
    // console.log('saveData');
})

const has복수자동필드 = computed(() => (model.value?.자동필드ss?.length ?? 0) > 1)

/**
 * 머리글에 쓸 값. 뱃지 정규화 규칙은 목록5의 `getBadges`와 같다 —
 * 문자열도 받아주고 라벨 없는 건 버린다. (두 판이 다른 규칙을 쓰면 같은 행이 다르게 보인다.)
 *
 * ## `sub`은 그대로 그린다
 *
 * `label`은 값이 같은 칸을 찾아 아래에서 뺐다. `sub`에는 그 수를 못 쓴다 — 여러 칸을 이어붙인
 * 값이라(`[나이, 지역, 직업].join(' · ')`) 어느 글자가 어느 칸인지 모델이 안 알려준다.
 *
 * 그렇다고 `sub` 쪽을 지우지도 않는다. 아래 칸을 빼는 근거는 **「위에서 고칠 수 있으니까」**이지
 * 「위에 글자가 있으니까」가 아니다. `sub`은 setter가 없어서(리포의 `get sub()` 41개 중 값을 쓰는
 * 것이 없고 `BaseModel2`의 것은 빈 setter다) 애초에 위에서 고칠 수가 없다. 그러니 아래 칸도 두고,
 * 부제는 부제대로 둔다 — 한눈에 누구/무엇인지 읽히는 줄이 머리글의 일이다.
 */
const 머리글 = computed(() => {
  const m = model.value
  const label = String(m?.label ?? '')
  const badges = (Array.isArray(m?.badges) ? m.badges : [])
    .map((b: any) => (typeof b === 'string' ? { label: b } : b))
    .filter((b: any) => typeof b?.label === 'string' && b.label.length > 0)

  const sub = String(m?.sub ?? '')
  const thumbnail = m?.thumbnail ?? ''
  const icon = m?.icon ?? ''
  return {
    /*
         * **파생 라벨 말고 다른 게 하나라도 있을 때만** 머리글을 세운다.
         *
         * 머리글이 하는 일은 정체성(얼굴·상태)이지 제목 반복이 아니다.
         * 라벨뿐인 모델(v2 `model채소` 등)은 그 라벨이 바로 아래 `이름` 필드에 또 있어서,
         * 켜봐야 같은 글자가 2cm 간격으로 두 번 나올 뿐이다.
         *
         * 켜지는 길은 둘이다: 사진·아이콘·뱃지가 붙는 모델, 또는 **올라온 칸이 있는 경우**
         * (`label` 칸은 늘 올라오므로 사실상 대부분이다). 둘 다 중복이 아니다 —
         * 올라간 칸은 아래 폼에서 빠지므로 같은 글자가 두 번 나올 수가 없고,
         * 사진은 꾸밈이라 아래 칸과 겹쳐도 둔다.
         */
    has: !!(thumbnail || icon || sub || badges.length || 상단필드s.value.length),
    label,
    sub,
    icon,
    thumbnail,
    badges
  }
})

const 요약s = computed(() => (Array.isArray(model.value?.요약s) ? model.value.요약s : []))

/**
 * 타일 한 장이 **제 모양(라벨·값·부제 세 줄)으로** 서는 최소 폭과 사이 간격 — 위 마크업의
 * `min-w-22`(88px)·`gap-2`(8px)와 **같은 수**다. 클래스로만 두면 「감기는가」를 JS 가 알 수 없어
 * 여기 적는다(`m/List/_/useGridCols` 의 `MIN_W` 와 같은 갈래: 부품 제 치수라 화면 크기와 무관하다).
 */
const 타일최소폭 = 88
const 타일간격 = 8

const ref요약칸 = useTemplateRef<HTMLElement>('ref요약칸')
const { width: 요약칸폭 } = useElementSize(ref요약칸)

/**
 * **타일이 한 줄에 안 서나** — 서면 제 모양으로, 안 서면 한 줄 띠로 줄인다(위 주석).
 *
 * 문턱이 임의의 수가 아니다: 「넷이 제 최소 폭으로 나란히 설 폭」을 그대로 묻는다.
 * 재는 것은 **칸 폭**이고 비교값은 **타일 제 치수**라, 둘 다 압축 여부에 안 움직인다 —
 * 줄이면 타일이 좁아지지만 판단의 입력은 그대로여서 「줄였다 → 이제 서네 → 늘렸다」가 안 생긴다.
 *
 * 아직 안 재어 봤으면(`0`) **안 줄인다** — 첫 그림에서 크롬이 깜빡이지 않게(목록5 의 같은 규율).
 */
const is요약압축 = computed(() => {
  const n = 요약s.value.length
  if (!n || 요약칸폭.value <= 0) return false
  return 요약칸폭.value < n * 타일최소폭 + (n - 1) * 타일간격
})

/** 색은 정적 표로. 동적 클래스는 Tailwind가 못 훑는다. */
const 타일색 = (color?: string) => ({
  primary: 'text-primary',
  success: 'text-success',
  warning: 'text-warning',
  error: 'text-error',
  info: 'text-info'
}[color ?? ''] ?? 'text-highlighted')

const do수정중 = () => { }
defineExpose({
  do수정중
})
</script>
