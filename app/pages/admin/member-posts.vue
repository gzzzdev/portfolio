<template>
  <div class="h-[calc(100dvh-var(--ui-layout-header-offset,var(--ui-header-height,4rem)))] w-full flex flex-row justify-center py-2">
    <viewAlert v-if="!is관리자" />
    <template v-else>
      <view목록5
        v-model:selected="selected"
        v-model:필터선택="필터선택s"
        v-model:is수정중="is수정중"
        :repository="XXs"
        :주소동기="false"
        :can수정="is관리자"
      />
    </template>
  </div>
</template>

<script setup lang="ts">
definePageMeta({ 꽉찬폭: true })

import { do첫조회 } from '~/composables/do첫조회'

import { storeToRefs } from 'pinia'

import { useMyAuthStore } from '~/stores/useMyAuthStore'

import { computed, ref, watch, toValue } from 'vue'
import type { i필터선택s } from '~utils/models'
import type {
  model회원게시글 as modelXX } from '~models/test2'
import {
  model회원게시글s as modelXXs,
  model게시판s,
  model회원s
} from '~models/test2'

const route = useRoute()
const XXs = modelXXs.getInstance()
const selected = ref<modelXX | null>(null)

/**
 * 목록5의 필터 선택을 이 페이지가 들고 있는다 — URL(`?menuId=`)과 양방향으로 물려야 하기 때문.
 * repo(싱글턴)에 선택을 두면 이 페이지를 떠난 뒤에도 다른 화면의 같은 모델 목록이 딸려 움직인다.
 */
const 필터선택s = ref<i필터선택s>({})
const 게시판축 = XXs.게시판필터그룹.key
const 게시판선택 = computed(() =>
  (게시판축 in 필터선택s.value ? 필터선택s.value[게시판축] : XXs.게시판필터그룹.기본선택) as string | null
)
const set게시판선택 = (v: string) => {
  if (게시판선택.value === v) return
  필터선택s.value = { ...필터선택s.value, [게시판축]: v }
}

const { is관리자, is수정중 } = storeToRefs(useMyAuthStore())

function queryMenuId(): string {
  const raw = route.query.menuId ?? route.query.boardId
  const v = Array.isArray(raw) ? raw[0] : raw
  return v != null && v !== '' ? String(v) : ''
}

function queryMenuSlug(): string {
  const raw = route.query.menuSlug ?? route.query.boardSlug
  const v = Array.isArray(raw) ? raw[0] : raw
  return v != null && v !== '' ? String(v) : ''
}

function syncBoardFilterFromStores() {
  XXs.sync게시판필터옵션()
  const bid = queryMenuId()
  set게시판선택(bid ? XXs.게시판필터값FromBoardId(bid) : XXs.게시판필터값FromBoardSlug(queryMenuSlug()))
}

await do첫조회('member-posts', () => Promise.all([
  XXs.reads(),
  model게시판s.getInstance().reads(),
  model회원s.getInstance().reads()
]).then(() => {
  syncBoardFilterFromStores()
}), is관리자)

watch(
  () => toValue(model게시판s.getInstance().list),
  () => {
    if (!is관리자.value) return
    syncBoardFilterFromStores()
  },
  { deep: true }
)

watch(
  () => [route.query.menuId, route.query.boardId],
  () => {
    if (!is관리자.value) return
    syncBoardFilterFromStores()
  }
)

watch(
  () => [route.query.menuSlug, route.query.boardSlug],
  () => {
    if (!is관리자.value) return
    syncBoardFilterFromStores()
  }
)

watch(
  게시판선택,
  (sel) => {
    if (!is관리자.value) return
    const cur = queryMenuId()
    const curSlug = queryMenuSlug()
    if (sel == null || sel === '전체') {
      if (!cur && !curSlug) return
      void navigateTo(
        {
          path: '/admin/member-posts',
          query: {
            ...route.query,
            menuId: undefined,
            menuSlug: undefined,
            boardId: undefined,
            boardSlug: undefined
          }
        },
        { replace: true }
      )
      return
    }
    const bid = XXs.filterBoardIdForLabel(sel)
    if (!bid || bid === cur) return
    void navigateTo(
      {
        path: '/admin/member-posts',
        query: {
          ...route.query,
          menuId: bid,
          menuSlug: undefined,
          boardId: undefined,
          boardSlug: undefined
        }
      },
      { replace: true }
    )
  }
)
</script>
