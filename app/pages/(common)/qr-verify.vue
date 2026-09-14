<template>
  <!--
    인쇄물의 QR 이 닿는 곳. **대조 대상은 발급을 담은 표가 아니라 그 사실을 담은 행이다.**

    등급증은 등급 취득 1건에 한 장이라(1:1) 대조할 것이 등급이력 행 하나이고, 그 행은
    `endDate` 로 유효·만료까지 이미 들고 있다. 그래서 "언제 누구에게 발급했나"를 따로 적는
    표 없이 검증이 성립한다 — 링크가 회원이 아니라 그 행을 가리키기만 하면 된다(`qrVerify.ts`).

    한때 여기가 목업이었다(상태 탭 셋 + `mock` 상수). 그때 QR 이 회원 id 를 담고 있어서
    이 화면이 할 수 있는 말이 "이 사람이 있다"뿐이었고, 종이에 찍힌 등급·발급일·발급번호와
    맞대어 볼 상대가 없었다.
  -->
  <div class="mx-auto flex min-h-dvh max-w-xl flex-col gap-8 px-4 py-10">
    <mPageIntro
      eyebrow="DOCUMENT VERIFY"
      title="위변조 확인"
      description="QR로 조회된 증명서가 시스템에 등록된 공식 기록과 일치하는지 확인합니다."
    />

    <div
      v-if="상태 === 'loading'"
      class="flex items-center justify-center gap-2 py-10 text-sm text-muted"
    >
      <UIcon
        name="i-lucide-loader-circle"
        class="animate-spin"
      />
      기록을 조회하는 중입니다.
    </div>

    <template v-else-if="상태 === 'ok' || 상태 === 'expired'">
      <UAlert
        v-if="상태 === 'ok'"
        color="success"
        icon="i-lucide-shield-check"
        title="진본 증명서입니다."
        description="시스템에 등록된 공식 기록과 일치합니다. 아래 내용을 인쇄물과 대조해 주세요."
      />
      <!--
        종료된 행은 위조가 아니다 — 발급된 적이 있고 그 뒤에 갱신되거나 해제된 것이다.
        "위조"라고 말하면 진짜 증서를 든 사람을 위조범으로 만든다.
      -->
      <UAlert
        v-else
        color="warning"
        icon="i-lucide-shield-alert"
        title="현재 유효하지 않은 증명서입니다."
        :description="`발급 기록은 있으나 ${종료일}에 종료되었습니다. 상위 등급으로 갱신되었거나 해제된 기록입니다.`"
      />

      <div class="flex flex-col gap-5">
        <div class="flex items-center gap-4">
          <UAvatar
            :src="회원?.이미지 || undefined"
            icon="i-lucide-user"
            size="xl"
          />
          <div class="min-w-0 space-y-1">
            <div class="flex flex-wrap items-center gap-2">
              <p class="truncate text-xl font-semibold text-highlighted">
                {{ 회원?.이름 }}
              </p>
              <UBadge
                :color="상태 === 'ok' ? 'success' : 'warning'"
                :label="상태 === 'ok' ? '진본' : '종료됨'"
              />
            </div>
            <p class="text-sm text-muted">
              {{ 문서이름 }} 위변조 확인
            </p>
          </div>
        </div>

        <USeparator />

        <dl class="divide-y divide-default">
          <div
            v-for="row in 표시행s"
            :key="row.label"
            class="flex items-baseline justify-between gap-4 py-3"
          >
            <dt class="shrink-0 text-sm text-muted">
              {{ row.label }}
            </dt>
            <dd class="min-w-0 text-right text-sm font-medium text-highlighted">
              {{ row.value }}
            </dd>
          </div>
        </dl>

        <p class="text-xs leading-5 text-muted">
          확인 시각 {{ 확인시각 }} · {{ 조직.소속 }}
        </p>
      </div>
    </template>

    <!--
      기록이 없을 때. 링크가 깨졌을 수도 있으므로 위조라고 단정하기 전에 무엇이 없는지 말한다.
    -->
    <UAlert
      v-else
      color="error"
      icon="i-lucide-shield-x"
      title="등록된 발급 기록이 없습니다."
      description="이 QR이 가리키는 기록을 찾을 수 없습니다. 링크가 손상되었거나 위조 문서일 수 있습니다. 발급 기관에 문의해 주세요."
    />
  </div>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue'
import {
  model등급s,
  model역할s,
  model회원s,
  model회원관계이력s,
  model회원이력s,
  조직,
  type model회원,
  type model회원관계이력
} from '~models/test2'

definePageMeta({
  layout: 'layout-none'
})

/** `expired` 는 위조가 아니라 **종료된 진본**이다 — 셋을 한 축에 두면 그 구분이 사라진다 */
type i검증상태 = 'loading' | 'ok' | 'expired' | 'fake'

const route = useRoute()
const 종류 = computed(() => String(route.query.type ?? ''))
const 대상id = computed(() => String(route.query.id ?? '').trim())

const 상태 = ref<i검증상태>('loading')
const 이력 = ref<model회원관계이력 | null>(null)
const 회원 = ref<model회원 | null>(null)

const 문서이름 = computed(() => (종류.value === 'grade' ? '자격등급 인증서' : '회원 증명'))
const 종료일 = computed(() => 이력.value?.기간?.[1]?.format?.('YYYY-MM-DD') ?? '')

/**
 * 종이에 찍힌 것과 맞대어 볼 값들. **행에서 나온 것만 적는다** —
 * 여기서 계산해 만든 값은 대조의 근거가 못 된다.
 */
const 표시행s = computed(() => {
  const m = 회원.value
  if (종류.value === 'grade') {
    const h = 이력.value
    return [
      { label: '등급증번호', value: h?.발급번호 ?? '' },
      { label: '등급', value: h?.등급 ? `${h.등급.label} (${h.등급.sub})` : '' },
      { label: '발급일', value: h?.발급일?.format?.('YYYY-MM-DD') ?? '' },
      { label: '이름', value: m?.이름 ?? '' },
      { label: '생년월일', value: m?.생년월일?.format?.('YYYY-MM-DD') ?? '' },
      { label: '회원번호', value: String(m?.stateId ?? '') }
    ]
  }
  return [
    { label: '이름', value: m?.이름 ?? '' },
    { label: '회원번호', value: String(m?.stateId ?? '') },
    { label: '등급', value: m?.등급 ? `${m.등급.label} (${m.등급.sub})` : '' },
    { label: '역할', value: m?.역할표기 ?? '' },
    { label: '가입일', value: m?.가입일?.format?.('YYYY-MM-DD') ?? '' }
  ]
})

const 확인시각 = new Date().toLocaleString('ko-KR', {
  year: 'numeric',
  month: '2-digit',
  day: '2-digit',
  hour: '2-digit',
  minute: '2-digit'
})

onBeforeMount(async () => {
  if (!대상id.value) {
    상태.value = 'fake'
    return
  }

  try {
    // 이력 행 하나를 읽자고 표를 통째로 부르는 것이 아깝지만, `getById` 가 목록에서 집는
    // 구조라 지금은 이게 유일한 길이다. 공개 검증 엔드포인트가 생기면 그때 한 건만 받는다.
    await Promise.all([
      model회원s.getInstance().reads(),
      model회원이력s.getInstance().reads(),
      model등급s.getInstance().reads(),
      model역할s.getInstance().reads()
    ])
  } catch {
    // 읽기가 막히면 "기록 없음"으로 떨어진다. 없는 것과 못 읽는 것을 화면에서 가르지 않는 이유는
    // 종이를 든 사람에게 그 둘이 같은 일이기 때문이다 — 어느 쪽이든 발급 기관에 물어야 한다.
  }

  if (종류.value === 'grade') {
    const h = model회원관계이력s.getInstance().getById(대상id.value) ?? null
    // 역할 행 id 로 들어온 링크는 등급증이 아니다 — 있는 행이라도 이 문서의 근거는 못 된다
    if (!h || h.state?.gradeId == null) {
      상태.value = 'fake'
      return
    }
    이력.value = h
    회원.value = h.회원 ?? null
    상태.value = h.is현재 ? 'ok' : 'expired'
    return
  }

  const m = model회원s.getInstance().getById(대상id.value) ?? null
  회원.value = m
  상태.value = m ? 'ok' : 'fake'
})
</script>
