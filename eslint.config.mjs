// @ts-check
import withNuxt from './.nuxt/eslint.config.mjs'

export default withNuxt()
  .append({
    /**
     * **`import/first` 는 SFC 에서 끈다 — 그 자동수정이 파일을 깨뜨린다.**
     *
     * `<script>` 와 `<script setup>` 둘을 쓴 파일에서 파서는 두 블록을 **한 프로그램**으로
     * 읽는다. 그러면 평범한 블록의 `export` 들이 setup 블록의 `import` 들보다 앞에 오고,
     * 이 규칙은 그걸 「import 가 본문 중간에 있다」로 보고 위로 끌어올린다. 끌어올릴 때
     * 사이에 낀 `</script>\n<script setup>` 까지 같이 딸려 가서, **`export` 가 setup 안으로
     * 들어간다.** 그러면 같은 설정의 `vue/no-export-in-script-setup` 이 그걸 에러로 잡고,
     * Vue 컴파일러도 거부한다 — `bun run lint --fix` 한 번이 빌드를 세운다.
     *
     * 2026-09-09 에 이걸로 넷이 깨져 있었다(`m/List/_/Item.vue`, `m/Sortable/1·2/index.vue`,
     * 그리고 페이지 셋의 import 가 닫히지 않은 것). 값 `export` 는 setup 에 못 두므로
     * 두 블록 쓰기는 피할 수 없고, 그렇다면 꺼야 하는 건 규칙 쪽이다.
     *
     * **`.ts`·`.mjs` 에서는 그대로 켜져 있다** — 거기서는 블록 경계가 없어 안전하다.
     */
    files: ['**/*.vue'],
    rules: { 'import/first': 'off' }
  })
  .append({
    /**
     * **`vue/attribute-hyphenation` 도 끈다 — 한글 이름의 대문자를 하이픈 없이 뭉갠다.**
     *
     * 이 규칙은 케밥으로 바꿀 때 대문자 앞에 `-` 를 넣는데, 그 판정이 ASCII 단어경계라
     * **앞 글자가 한글이면 경계로 안 보고 소문자로만 내린다**: `:get로딩Ref` → `:get로딩ref`.
     * 하이픈이 없으니 Vue 의 `camelize` 가 되돌릴 것도 없어서 prop 이 **조용히 안 꽂힌다**
     * (`needCan수정` → `need-can수정` 처럼 앞이 ASCII 면 멀쩡히 왕복한다 — 한글 뒤만 깨진다).
     *
     * 2026-09-09 에 `bun run lint --fix` 가 `get로딩Ref` 를 넷에서 이렇게 뭉갰다
     * (`view/상세4·상세5`, `Input/카드·카드s`). 받는 쪽(`view/모델필드s·s2`)에서 필수 prop 이
     * `undefined` 가 됐고, 그걸 부르는 자리가 하필 `<ClientOnly>` 안이라 **라벨만 남고
     * 값칸과 버튼이 통째로 빈** 상세판이 됐다. 화면엔 에러가 아니라 빈 칸으로만 보였다.
     *
     * 이 리포는 `회원Id`·`게시판Id`·`is구분선Id`처럼 **한글 뒤 대문자** 이름이 흔하다.
     * 한 자리를 되돌려 봐야 다음 `--fix` 가 다른 자리를 깨므로, 꺼야 하는 건 규칙 쪽이다.
     * (`vue/v-on-event-hyphenation` 은 같은 흠이 있지만 위험한 이름이 현재 0개라 그대로 둔다.)
     */
    files: ['**/*.vue'],
    rules: { 'vue/attribute-hyphenation': 'off' }
  })
  .append({
    /**
     * **속성을 어디서 끊을지는 eslint 가 정하지 않는다 — 사람이 정한다.**
     *
     * 기본값(`vue/max-attributes-per-line` 의 `singleline.max: 1`)은 속성이 둘만 넘어도 태그를
     * 통째로 세로로 편다. 속성 셋짜리 태그 하나가 여는 줄·속성 셋·닫는 `>` 로 **다섯 줄**이 된다.
     * 2026-09-09 에 `view/상세5`·`view/목록5`·`_view필터조건` 의 template 를 재니 그렇게 늘어난
     * 줄이 **402줄**, 셋을 합친 1777줄의 **23%** 였다. 한 화면에 들어오는 태그 수가 그만큼 줄어든다.
     *
     * **한 줄로 합치는 fixer 는 어느 규칙에도 없다.** 그래서 이 셋을 끄면 `--fix` 가 속성 배치를
     * 아예 안 건드린다 — 한 줄로 둔 건 한 줄로, 중간에 엔터를 쳐서 몇 개씩 묶은 건 묶은 채로 남는다.
     * 반대로 `max-attributes-per-line` 을 켜 두면(`multiline.max: 1`) 중간이 없어진다: 17개짜리를
     * 3줄로 나눠 놔도 `--fix` 가 17줄로 떨어뜨린다. 길이로 끊는 판정은 eslint 가 못 하고
     * (`vue/max-len` 은 이 리포에 없다), 개수로 긋는 선은 실제로 안 맞았다 — 그래서 사람에게 맡긴다.
     *
     * `first-attribute-linebreak`·`html-closing-bracket-newline` 을 같이 푸는 이유는, 저 둘이
     * 켜져 있으면 부분으로 나눠 쓴 태그의 첫 속성과 닫는 `>` 만 따로 끌려가 모양이 어그러지기 때문이다.
     */
    files: ['**/*.vue'],
    rules: {
      'vue/max-attributes-per-line': 'off',
      'vue/first-attribute-linebreak': 'off',
      'vue/html-closing-bracket-newline': 'off'
    }
  })
