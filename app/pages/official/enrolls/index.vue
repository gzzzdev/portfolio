<template>
  <div class="mx-auto w-full max-w-(--ui-container) p-3 sm:p-6">
    <view신청받기목록
      제목="신청"
      설명="열려 있는 행사·수업·설문·퀴즈에 신청합니다."
      :is-ready="isReady"
      :카드s="카드s"
      :전체수="공개신청받기s.length"
      :filter-groups="filterGroups"
      :selected-filters="selectedFilters"
      :활성필터수="활성필터수"
      :search="search"
      :sort-value="정렬"
      :sort-options="정렬options"
      :뷰="뷰"
      :갈래="갈래"
      :is로그인="is신원"
      :내신청줄s="내신청줄s"
      @update:search="(v: string) => (search = v)"
      @update:sort-value="do정렬바꾸기"
      @update:뷰="do뷰바꾸기"
      @update:갈래="do갈래바꾸기"
      @set-filter="do필터바꾸기"
      @reset="do조건지우기"
      @select="do열기"
    />
  </div>
</template>

<script setup lang="ts">
/**
 * 방문자가 보는 신청받기 목록.
 *
 * ## 축은 이 화면이 안 갖는다
 *
 * 거를 것·정렬할 것·검색할 칸은 전부 **모델**(`model신청받기s`)이 든다 —
 * `필터조건ss` · `정렬조건s` · `검색필드s`. 여기가 하는 일은 「무엇으로 거를까」가 아니라
 * **「지금 무엇이 걸려 있나」**뿐이고, 그 답은 주소가 갖는다.
 *
 * 한 번 적으면 셋이 산다. 관리자 신청 목록(`/admin/enrolls` = 목록5)이 같은 축을 그리고,
 * 도우미가 같은 축을 어휘로 읽고, 이 화면이 같은 축을 칩으로 그린다.
 *
 * ## 주소 규약도 공유한다
 *
 * 쿼리 키는 `필터축쿼리키`(도우미·목록5와 같은 함수)가 만든다 — `?f_종류=classes`.
 * 키가 한글이라 주소창에서 퍼센트 인코딩으로 뭉개지는 건 **알고 받는 값**이다.
 * 대신 도우미가 건 주소가 이 화면에서도 그대로 열린다. 어휘가 두 벌인 것보다 낫다.
 *
 * ## 갈래와 뷰도 주소가 든다 (2026-09-05)
 *
 * - **「내 신청」 갈래는 새 축이 아니다.** 모델이 이미 든 `내신청필터그룹` 을 레일 칩에서
 *   갈래로 세운 것이라, 주소가 `?f_내신청=신청함` 그대로다 — **도우미가 그 축을 걸면
 *   이 화면이 그 갈래로 열린다.** 그래서 이 축만 `축s` 에서 빼고(칩으로 두 번 그리지 않는다)
 *   갈래가 대신 읽는다.
 * - **뷰(목록형·카드형)는 `?view=card`.** 사람마다 다른 취향값이라 저장소에 두고 싶어지는데,
 *   그러면 도우미가 「카드로 보여줘」를 못 몬다(`l/AI_CopilotV2.vue` — 도우미의 채널은 페이지 라우터다).
 *
 * 고른 이유와 진 안은 `/decisions` 의 `신청-목록`, 판은 `/decisions/enrolls/list`.
 */
import { computed, ref, toValue, watch } from 'vue'
import { storeToRefs } from 'pinia'
import { useMyAuthStore } from '~/stores/useMyAuthStore'
import { mDayjs, toCompactDates, 행검색매칭 } from '~utils'
import { 필터축쿼리키 } from '~utils/models'
import {
  model신청받기s, model신청s, model회원s, 신청받기대상표, do신청세트읽기, is숨긴대상,
  type model신청받기, type model신청
} from '~models/test2'
import type { i내신청줄, i신청받기뷰, i신청받기카드, i신청받기필터그룹 } from '~base-comps/view/신청받기목록.types'

const route = useRoute()
const router = useRouter()
const { isLoggedIn: is로그인, 회원Id } = storeToRefs(useMyAuthStore())
/**
 * 「내 신청」이 답을 갖나. 회원만이 아니다 — 비회원으로 신청한 사람도 익명 세션의 `회원Id` 가 있어
 * 자기 신청을 찾는다. 그래서 갈래는 `is로그인`(회원)이 아니라 이걸 본다.
 */
const is신원 = computed(() => !!회원Id.value)
const isReady = ref(false)

const 신청받기s = model신청받기s.getInstance()

// 비회원은 이 세트의 일부(문항·응답·결제)를 읽을 권한이 없다. 그건 목록에 안 쓰이는 것들이라
// 여기서 던지게 두면 볼 수 있는 목록까지 같이 죽는다 — 받은 만큼으로 그린다.
try { await do신청세트읽기(is로그인.value) } catch { /* 권한 밖 목록은 비어 있는 채로 둔다 */ } finally { isReady.value = true }

/**
 * 학습자에게 보이는 건 **공개된 지금 회차**뿐이다. 준비중·비공개는 걸러지고, 회차가 여럿인
 * 콘텐츠는 가장 최근 회차 한 줄만 선다(`is현재회차`) — 콘텐츠 하나에 줄 하나다.
 * 판정은 모델이 갖고 화면은 안 갖는다.
 *
 * 이건 축이 아니라 **바닥**이라 `필터조건ss`에 없다. 사람이 끌 수 있으면 축이고, 못 끄면 바닥이다.
 */
const 공개신청받기s = computed(() => toValue(신청받기s.list).filter(신청받기 => 신청받기.is공개 && 신청받기.is현재회차 && !is숨긴대상(신청받기.대상표)))

// ─────────────────────────────────────────────────────────────────────────────
// 축 — 모델에서 그대로 가져온다
// ─────────────────────────────────────────────────────────────────────────────

/**
 * 칩으로 그릴 축들. **내신청 축은 뺀다** — 그 축은 칩이 아니라 갈래로 서고(아래 `갈래`),
 * 둘 다 그리면 같은 축이 화면에 두 번 뜬다.
 */
const 축s = computed(() => 신청받기s.필터조건ss.filter(g => g !== 신청받기s.내신청필터그룹))

/**
 * 칩 목록. 모델의 「전체」 옵션은 뺀다 — 목록 컴포넌트가 자기 「전체」 버튼을 따로 그리고,
 * 그 버튼이 뜻하는 것이 정확히 축의 `기본선택`(= 이 축을 안 건다)이다.
 */
const filterGroups = computed((): i신청받기필터그룹[] =>
  축s.value.map(g => ({
    key: g.key,
    title: g.title ?? g.key,
    options: g.options
      .filter(o => o.value !== g.기본선택)
      .map(o => ({ label: o.label, value: o.value, icon: o.icon }))
  }))
)

const 정렬options = computed(() => 신청받기s.정렬조건s.map(x => ({ label: x.label, value: x.value })))
const 기본정렬 = 신청받기s.정렬조건s[0]?.value ?? ''

// ─────────────────────────────────────────────────────────────────────────────
// 조건은 URL이 갖는다. 로컬 ref면 새로고침·뒤로가기에 날아가고 링크로 못 넘긴다.
// ─────────────────────────────────────────────────────────────────────────────

/** 쿼리를 통째로 갈아끼우지 않고 준 것만 고친다 — 다른 페이지가 얹어둔 쿼리를 지우면 안 된다. */
const do쿼리반영 = (patch: Record<string, string | null>) => {
  const query: Record<string, unknown> = { ...route.query }
  for (const [key, value] of Object.entries(patch)) {
    if (value == null || value === '') delete query[key]
    else query[key] = value
  }
  void router.replace({ query })
}

const get쿼리 = (key: string) => {
  const raw = route.query[key]
  const value = Array.isArray(raw) ? raw[0] : raw
  return typeof value === 'string' && value ? value : null
}

/**
 * 주소로 들어온 값이 그 축이 아는 값일 때만 필터로 인정한다.
 * 옛 링크·오타가 남아 있으면 조용히 빈 목록이 되고, 화면만 봐선 이유를 알 수 없다.
 */
const selectedFilters = computed((): Record<string, string | null> =>
  Object.fromEntries(축s.value.map((g) => {
    const value = get쿼리(필터축쿼리키(g))
    const is유효 = !!value && value !== g.기본선택 && g.options.some(o => o.value === value)
    return [g.key, is유효 ? value : null]
  }))
)

const 활성필터수 = computed(() => Object.values(selectedFilters.value).filter(Boolean).length)

const 정렬 = computed(() => {
  const value = get쿼리('sort')
  return 신청받기s.정렬조건s.some(x => x.value === value) ? value! : 기본정렬
})

/** 갈래는 내신청 축의 값이다. 축 하나를 화면 두 군데가 아니라 **한 군데**서 읽는다. */
const 내신청키 = 필터축쿼리키(신청받기s.내신청필터그룹)
const 갈래 = computed((): '전체' | '내 신청' =>
  (is신원.value && get쿼리(내신청키) === '신청함' ? '내 신청' : '전체'))

const 뷰 = computed((): i신청받기뷰 => (get쿼리('view') === 'card' ? '카드형' : '목록형'))

const do필터바꾸기 = (key: string, value: string | null) => {
  const g = 축s.value.find(x => x.key === key)
  if (g) do쿼리반영({ [필터축쿼리키(g)]: value })
}
const do정렬바꾸기 = (value: string) => do쿼리반영({ sort: value === 기본정렬 ? null : value })
const do뷰바꾸기 = (value: i신청받기뷰) => do쿼리반영({ view: value === '카드형' ? 'card' : null })
const do갈래바꾸기 = (value: '전체' | '내 신청') =>
  do쿼리반영({ [내신청키]: value === '내 신청' ? '신청함' : null })

// 검색어는 타이핑마다 주소를 바꾸면 낭비라 잠깐 모아서 반영한다. 입력 자체는 로컬이 갖고,
// 주소가 바깥에서 바뀐 경우(뒤로가기·링크 진입)에만 되받는다.
const search = ref(get쿼리('q') ?? '')
watchDebounced(search, v => do쿼리반영({ q: v.trim() || null }), { debounce: 300 })
watch(() => get쿼리('q'), (v) => { if ((v ?? '') !== search.value) search.value = v ?? '' })

const do조건지우기 = () => {
  search.value = ''
  do쿼리반영({ q: null, sort: null, ...Object.fromEntries(축s.value.map(g => [필터축쿼리키(g), null])) })
}

// ─────────────────────────────────────────────────────────────────────────────
// 거르기·정렬 — 판정은 전부 모델의 것을 그대로 부른다
// ─────────────────────────────────────────────────────────────────────────────

const 걸러진s = computed(() => {
  const 고른 = selectedFilters.value
  const 검색 = search.value.trim()

  return 공개신청받기s.value.filter((신청받기, i) =>
    축s.value.every((g) => {
      const 값 = 고른[g.key]
      if (!값) return true
      return g.options.find(o => o.value === 값)?.match(신청받기, i) ?? true
    })
    // 검색도 목록5·도우미와 **같은 함수**다. 훑을 칸은 `신청받기s.검색필드s`가 정한다.
    && 행검색매칭(신청받기, 신청받기s.검색필드s, 검색)
  )
})

const 정렬된s = computed(() => {
  const func = 신청받기s.정렬조건s.find(x => x.value === 정렬.value)?.func
  return func ? [...걸러진s.value].sort(func) : 걸러진s.value
})

// ─────────────────────────────────────────────────────────────────────────────

/** 마감까지 남은 날. 닫힌 신청받기는 null — 배지도 머리말도 이 하나를 보고 갈린다. */
const get남은날 = (신청받기: model신청받기) =>
  (신청받기.is신청받는중 ? 신청받기.신청기간[1].startOf('day').diff(mDayjs().startOf('day'), 'day') : null)

/**
 * 카드 상태 배지. 신청받는 중이면 남은 날, 아니면 왜 못 하는지.
 * 색은 **급할 때만** 준다 — 여유 있는 D-30이 초록으로 제일 튀면 정작 D-2가 묻힌다(목록형 마감 열과 같은 규칙).
 */
const get상태 = (신청받기: model신청받기): i신청받기카드['상태'] => {
  const 남은 = get남은날(신청받기)
  if (남은 === null)
    return { label: 신청받기.is정원초과 ? '정원마감' : '기간마감', color: 'neutral' }
  if (남은 <= 0) return { label: '오늘 마감', color: 'warning' }
  return { label: `D-${남은}`, color: 남은 <= 3 ? 'warning' : 'neutral' }
}

const 카드s = computed((): i신청받기카드[] =>
  정렬된s.value.map((신청받기) => {
    const 종류 = 신청받기대상표[신청받기.대상표]
    const 대상 = 신청받기.대상
    return {
      id: Number(신청받기.stateId),
      종류: 종류?.label ?? '',
      // 이미지가 없을 때 쓸 자리. 자리표시자 이미지 대신 종류 아이콘을 세운다.
      아이콘: 대상?.icon || 종류?.icon || 신청받기.icon,
      제목: 신청받기.대상명 || 신청받기.label,
      설명: 신청받기.대상요약,
      이미지: 대상?.이미지 || null,
      기간: toCompactDates(신청받기.신청기간[0], 신청받기.신청기간[1]),
      상태: get상태(신청받기),
      남은날: get남은날(신청받기),
      신청수: 신청받기.신청수,
      정원: 신청받기.정원,
      요금: 신청받기.is무료 ? '무료' : `${신청받기.결제금액.toLocaleString('ko-KR')}원`,
      is무료: 신청받기.is무료,
      is내신청: 신청받기.is내신청
    }
  })
)

// ─────────────────────────────────────────────────────────────────────────────
// 「내 신청」 갈래 — 여기만 **신청받기가 아니라 신청**을 센다
// ─────────────────────────────────────────────────────────────────────────────

const 회원 = computed(() => model회원s.getInstance().getById(toValue(회원Id)) ?? null)

const 신청상태라벨 = (신청: model신청) =>
  ({ PENDING: '대기', APPROVED: '승인', REJECTED: '반려', SUBMITTED: '제출', CANCELED: '취소' } as const)[신청.상태] ?? 신청.상태

const 마감문구 = (신청받기: model신청받기) => {
  const 남은 = get남은날(신청받기)
  if (남은 === null) return '마감됨'
  return 남은 <= 0 ? '오늘 마감' : `D-${남은} 마감`
}

/**
 * 내가 낸 신청을 「할 일 · 기다리는 것 · 지난 것」 셋으로 나눈다.
 *
 * **할 일이 이 갈래의 첫 화면이다** — 다시 오는 사람이 여기 오는 이유가 새 신청받기가 아니라
 * 안 끝낸 일(미제출 응답 · 미납부)이라서다. 판정은 두 개뿐이고 둘 다 모델이 이미 아는 값이다:
 * 결제가 안 됐나(`결제상태`), 문항이 있는데 안 냈나(`is제출됨`).
 *
 * 한 신청이 둘 다일 수 있는데 줄은 하나다 — **결제가 먼저**다(안 내면 자리 자체가 안 남는다).
 * 남은 쪽은 문구에 붙는다.
 */
const 내신청줄s = computed((): i내신청줄[] => {
  const 회원행 = 회원.value
  if (!회원행) return []
  const 신청repo = model신청s.getInstance()

  const 줄s = 공개신청받기s.value.flatMap((신청받기): i내신청줄[] => {
    const 신청 = 신청repo.getBy회원신청받기(회원행, 신청받기)
    if (!신청 || 신청.상태 === 'CANCELED') return []

    const 종류 = 신청받기대상표[신청받기.대상표]
    const 바탕 = {
      id: Number(신청받기.stateId),
      종류: 종류?.label ?? '',
      아이콘: 신청받기.대상?.icon || 종류?.icon || 신청받기.icon,
      제목: 신청받기.대상명 || 신청받기.label
    }

    const 문항수 = 신청받기.문항s.length
    const is결제필요 = !신청받기.is무료 && 신청.결제상태 === 'UNSUBSCRIBED'
    const is응답필요 = 문항수 > 0 && !신청.is제출됨
    const 남은날 = get남은날(신청받기)
    const is급함 = 남은날 !== null && 남은날 <= 1

    // 지난 것 — 신청받기가 닫혔고 내가 할 것도 없다. 값은 점수가 있으면 점수다.
    if (남은날 === null && !is결제필요) return [{
      ...바탕,
      묶음: '지남',
      구분: '확정',
      문구: `${toCompactDates(신청받기.신청기간[0], 신청받기.신청기간[1])} · ${신청상태라벨(신청)}`,
      액션: '',
      is급함: false,
      값: 신청.is채점대상 ? `${신청.점수} / ${신청.만점}점` : 신청상태라벨(신청)
    }]

    if (is결제필요 || is응답필요) {
      const 남은문항 = Math.max(0, 문항수 - 신청.응답수)
      const 응답문구 = 남은문항 ? `문항 ${남은문항}개가 남았습니다` : '제출만 남았습니다'
      return [{
        ...바탕,
        묶음: '할일',
        구분: is결제필요 ? '결제' : '응답',
        문구: is결제필요
          ? `${신청받기.결제금액.toLocaleString('ko-KR')}원 미납${is응답필요 ? ` · ${응답문구}` : ''} · ${마감문구(신청받기)}`
          : `${응답문구} · ${마감문구(신청받기)}`,
        액션: is결제필요 ? '결제하기' : '이어서 풀기',
        is급함,
        값: ''
      }]
    }

    return [{
      ...바탕,
      묶음: '기다림',
      구분: '확정',
      문구: `${신청상태라벨(신청)} · ${toCompactDates(신청받기.신청기간[0], 신청받기.신청기간[1])}`,
      액션: '보기',
      is급함: false,
      값: ''
    }]
  })

  // 할 일 안에서는 급한 것이 위다. 여기서도 순서를 정하는 건 배너가 아니라 정렬이다.
  return 줄s.sort((a, b) => Number(b.is급함) - Number(a.is급함))
})

const do열기 = (id: number) => navigateTo(`/official/enrolls/${id}`)
</script>
