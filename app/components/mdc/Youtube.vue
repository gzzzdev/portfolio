<template>
  <div class="my-5 overflow-hidden rounded-lg ring-1 ring-default m-층-카드">
    <ClientOnly>
      <mYoutubePlayer
        v-model:watched-time="본시간"
        v-model:duration="길이"
        :url="url"
        :autoplay="false"
        :mute="false"
        :start-time="0"
        :show-sound="true"
      />
      <template #fallback>
        <div class="aspect-video w-full bg-muted" />
      </template>
    </ClientOnly>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'

/**
 * `::youtube` — 본문 영상. 어댑터다.
 *
 * **처음에 `::video` 로 지었다가 바꿨다.** `video` 는 MDC 의 HTML 태그 목록에 있어서
 * (`mdc/runtime/parser/utils/html-tags-list.js`) 컴포넌트 해석 자체를 건너뛴다 —
 * 컴포넌트를 등록해도 소용이 없고, `<video url="...">` 로 나가 빈 칸만 남는다. **경고도 안 뜬다.**
 * 그 목록에 든 이름은 전부 못 쓴다: `video`·`audio`·`iframe`·`img`·`picture`·`figure`·
 * `details`·`summary`·`table`·`code`·`kbd`·`time`·`menu` … (2026-09-05 실측)
 *
 * `mYoutubePlayer` 를 그대로 쓴다. 그쪽이 `watchedTime`·`duration` 을 required 모델로
 * 요구하는데(수강 진도 추적용) 본문에는 진도라는 개념이 없다 — **어댑터가 그 배선을 대신
 * 들어주는 것**이 여기서 하는 일이다. 값은 버린다.
 *
 * 액자는 `::photo` 와 같은 층 1(`m-층-카드`)이다 — 같은 이유고, 논거는 그쪽 머리말에 있다.
 */
interface Props {
  /** 유튜브 주소. */
  url: string
}
defineProps<Props>()

/** 본문 영상은 진도를 안 센다. 플레이어 계약을 맞추려고 두는 자리일 뿐이다. */
const 본시간 = ref(0)
const 길이 = ref(0)
</script>
