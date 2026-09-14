// https://nuxt.com/docs/api/configuration/nuxt-config
import { createResolver } from '@nuxt/kit'

const resolver = createResolver(import.meta.url)

export default defineNuxtConfig({

  modules: [
    '@nuxt/eslint',
    '@nuxtjs/supabase',
    '@nuxt/ui',
    '@nuxt/fonts',
    '@nuxt/image',
    '@nuxt/content',
    '@vueuse/nuxt',
    '@vueuse/sound/nuxt',
    'nuxt-og-image',
    'motion-v/nuxt',
    '@pinia/nuxt',
    'pinia-plugin-persistedstate/nuxt',
    '@nuxtjs/device'
  ],

  /**
   * 기본 스캔 확장자는 `nuxt.options.extensions`(.js/.jsx/.mjs/.ts/.tsx/.vue) 라서
   * `components/` 아래 헬퍼 모듈(.ts/.js)까지 전부 컴포넌트로 등록된다.
   * → `export default` 가 없는데 GlobalComponents 에 올라가 타입을 오염시키고,
   *   같은 이름으로 해석되는 파일끼리 충돌해 한쪽이 조용히 탈락한다.
   * `.vue` 만 등록하도록 제한.
   */
  components: [
    /*
     * `::` 본문 블록 어댑터는 여기 안 적는다 — `@nuxtjs/mdc` 가 **`<srcDir>/components/mdc/` 를
     * 규약으로 이미 알고 있다.** 그 모듈이 `components:dirs` 훅에서 그 폴더를
     * `{ global: true, pathPrefix: false }` 로 앞에 꽂는다(mdc/dist/module.mjs:417).
     *
     * 둘 다 필요한 조건이라 손으로 적을 때 하나만 빠뜨리기 쉽다 —
     * `pathPrefix:false` 가 없으면 이름이 `MdcFrame` 이 되고, `global:true` 가 없으면
     * 런타임 `resolveComponent` 로 안 잡힌다(Nuxt 자동등록은 템플릿 컴파일 시점에 붙는다).
     * 그리고 `frame`·`video` 는 **실재하는 HTML 태그**라 실패해도 Vue 가 경고조차 안 하고
     * 빈 자리만 남는다. 여기 손으로 적었다가 그 사고를 냈고, 규약에 맡기는 쪽으로 되돌렸다.
     *
     * 어휘 정본은 `_CUSTOM/utils/mdc/blocks.ts`. 파일명은 ASCII 로 둘 것(md 이름이 ASCII 라서).
     */
    { path: '~/components', extensions: ['vue'] }
  ],
  devtools: { enabled: true },

  // 마장터 산 로고(`_CUSTOM/public/img/logo.png`)에서 산만 잘라 흰 둥근 판에 얹었다 — 글자는 16px 에서 안 읽히고, 어두운 탭에서도 보이게.
  app: {
    head: {
      link: [
        { rel: 'icon', type: 'image/x-icon', href: '/favicon.ico' },
        { rel: 'apple-touch-icon', href: '/apple-touch-icon.png' }
      ]
    }
  },

  // css: ['~/app/assets/css/main.css'],
  css: [resolver.resolve('./app/assets/css/main.css')],
  colorMode: {
    preference: 'light',
    fallback: 'light' // SSR/미지원 환경 fallback
  },

  /**
   * `::note` 만 우리 어댑터로 돌려놓는다. `@nuxt/ui` 의 `ProseNote` 가 `color="info"` 를 박아서
   * 넘기는데, 그 자리는 **조용해야 하는 칸**이라 색을 내려야 했다(`app/components/mdc/Note.vue`).
   * `app.config.ts` 의 `ui.prose.callout` 은 클래스만 덮고 prop 은 못 바꿔서 여기로 왔다.
   *
   * 나머지 이름은 건드리지 않는다 — `@nuxt/ui` 의 기본 매핑이 그대로 산다.
   */
  mdc: {
    components: {
      map: { note: 'Note' }
    }
  },

  ui: {
    colorMode: true
  },
  // Runtime values are overridden by matching NUXT_ env vars at runtime.
  // Do not assign process.env.* here — that only works at build time.
  // @see https://nuxt.com/docs/4.x/guide/going-further/runtime-config
  runtimeConfig: {
    public: {
      isDev: false, // NUXT_PUBLIC_IS_DEV
      audience: 'toss', // NUXT_PUBLIC_AUDIENCE — 'toss' | 'wishket'. 포트폴리오 겉옷 문구만 갈린다(`usePortfolio`)
      developKey: '', // NUXT_PUBLIC_DEVELOP_KEY
      tossPaymentsClientKey: '', // NUXT_PUBLIC_TOSS_PAYMENTS_CLIENT_KEY
      siteUrl: 'http://localhost:3000', // NUXT_PUBLIC_SITE_URL
      apiBaseUrl: '/api', // NUXT_PUBLIC_API_BASE_URL
      apiUrl: '/api', // NUXT_PUBLIC_API_URL
      naverMapClientId: '', // NUXT_PUBLIC_NAVER_MAP_CLIENT_ID
      naverClientId: '', // NUXT_PUBLIC_NAVER_CLIENT_ID
      kakaoClientId: '' // NUXT_PUBLIC_KAKAO_CLIENT_ID
    },
    // Private (server-only) — overridden by NUXT_<KEY>
    tossPaymentsSecretKey: '', // NUXT_TOSS_PAYMENTS_SECRET_KEY
    tossPaymentsWebhookSecret: '', // NUXT_TOSS_PAYMENTS_WEBHOOK_SECRET
    naverClientSecret: '', // NUXT_NAVER_CLIENT_SECRET
    kakaoClientSecret: '', // NUXT_KAKAO_CLIENT_SECRET
    siteUrl: 'http://localhost:3000', // NUXT_SITE_URL
    supabaseUrl: '', // NUXT_SUPABASE_URL
    supabaseServiceRoleKey: '', // NUXT_SUPABASE_SERVICE_ROLE_KEY
    supabaseAnonKey: '', // NUXT_SUPABASE_ANON_KEY
    supabaseBucketName: '', // NUXT_SUPABASE_BUCKET_NAME
    geminiApiKey: '', // NUXT_GEMINI_API_KEY
    unsplashApplicationId: '', // NUXT_UNSPLASH_APPLICATION_ID
    unsplashAccessKey: '', // NUXT_UNSPLASH_ACCESS_KEY
    unsplashSecretKey: '', // NUXT_UNSPLASH_SECRET_KEY
    /**
     * `server/middleware/api-guard.ts`의 동작. NUXT_API_GUARD 로 덮어쓴다.
     * `warn`(기본) = 거부할 상황을 로그만 남기고 통과 / `enforce` = 403 / `off` = 검사 안 함.
     * 권한 데이터가 실제 호출을 다 덮는지 로그로 확인한 뒤 `enforce`로 올릴 것.
     */
    apiGuard: 'warn' // NUXT_API_GUARD
  },

  dir: { public: '_CUSTOM/public' },

  alias: {
    '~utils': resolver.resolve('_CUSTOM/utils'),
    '~models': resolver.resolve('_CUSTOM/models'),
    '~models/test2': resolver.resolve('_CUSTOM/models/test2'),
    //
    '~base-comps': resolver.resolve('app/components')
  },

  // routeRules: {
  //   '/': { prerender: true }
  // },
  routeRules: {
    '/_ipx/**': {
      headers: {
        'cache-control': 'public, max-age=3600'
      }
    }
  },
  sourcemap: { server: false, client: false },

  devServer: {
    port: 3000,
    // port: 3001,
    host: '0.0.0.0' // localhost + LAN IP(예: 192.168.x.x)로 접속 가능
  },

  /**
   * `getRepoInstance`(BaseModels2)가 서버에서 repo를 요청 스코프로 캐시하려면
   * 렌더 도중(=await 이후)에도 `useNuxtApp`이 살아있어야 한다. 없으면 요청 안에서
   * 인스턴스가 갈라져 SSR 단계의 목록이 전부 비어 보인다.
   */
  experimental: { asyncContext: true },
  compatibilityDate: '2025-07-15',

  nitro: {
    externals: {
      inline: ['vue', '@vue/server-renderer']
    },
    imports: {
      dirs: [
        resolver.resolve('server/utils'),
        resolver.resolve('_CUSTOM/utils/common')
      ],
      /**
       * **vite가 이미 다 만든 서버 청크(`.nuxt/dist`)에는 자동 import를 다시 걸지 않는다.**
       * nitropack은 원래 buildDir를 빼는데, nuxt가 `exclude`를 먼저 채워 넣어서 그 기본값이 빠진다.
       * 그러면 unimport가 청크를 한 번 더 훑는다. 그런데 unimport의 import 파서는 한글 식별자를 못 읽는다
       * (`import { 현 as _____, A as useAppConfig } from "../server.mjs"`). 이 import 문을 통째로 놓치고,
       * `useAppConfig`·`get`을 또 넣어서 esbuild가 `has already been declared`로 빌드를 멈춘다.
       * 롤업이 한글 export를 어느 청크로 나누느냐에 따라 **어떤 빌드는 되고 어떤 빌드는 안 된다.**
       */
      exclude: [/[/\\]\.nuxt[/\\]dist[/\\]/]
    }
  },

  vite: {
    envPrefix: ['VITE_', 'NUXT_'],
    server: {
      // 앞의 점은 하위 도메인 전부 — 테일스케일 기기 이름을 바꿔도 그대로 통한다
      allowedHosts: ['tractor-patchwork-gray.ngrok-free.dev', '.tail7bce7f.ts.net']
    },
    /**
     * `@supabase/ssr`가 브라우저에서도 돈다(`useSupabaseClient` → `createBrowserClient`).
     * 그런데 그 안에 **중첩 설치된 `cookie`가 CJS만** 준다(`exports.parse = …`).
     * 사전 번들 대상이 아니면 Vite가 그걸 ESM으로 그냥 내보내서
     * `does not provide an export named 'parse'`로 터진다(dev에서만 — 빌드는 롤업이 처리한다).
     *
     * `dedupe`로 최상위 사본(같은 1.1.1)에 모으고, `include`로 그 CJS를 실제로 변환시킨다.
     * 둘 중 하나만으론 부족했다 — 중첩 경로가 남으면 사본이 둘이 되고,
     * 사전 번들을 안 걸면 CJS가 그대로 나간다.
     */
    resolve: {
      dedupe: ['cookie']
    },
    optimizeDeps: {
      include: ['cookie', '@supabase/ssr > cookie']
    }
  },

  eslint: {
    config: {
      stylistic: {
        commaDangle: 'never',
        braceStyle: '1tbs'
      }
    }
  },

  fonts: {
    /* families 순서 ≈ mTheme / 테마피커: 시각적 획 굵기 얇은 쪽 → 두꺼운 쪽 */
    families: [
      {
        name: 'Gowun Batang',
        provider: 'google',
        global: true,
        weights: ['500'],
        // weights: ['100', '200', '300', '400', '500', '600', '700', '800', '900'],
        subsets: ['latin', 'korean']
      },
      {
        name: 'SUIT',
        provider: 'noonnu-bundle',
        global: true,
        weights: ['500']
        // weights: ['100', '200', '300', '400', '500', '600', '700', '800', '900'],
      },
      {
        name: 'Pretendard',
        provider: 'google',
        global: true,
        weights: ['500'],
        // weights: ['100', '200', '300', '400', '500', '600', '700', '800', '900'],
        subsets: ['latin', 'korean']
      },
      {
        name: 'PyeojinGothic',
        provider: 'noonnu-bundle',
        global: true,
        weights: ['500']
        // weights: ['100', '200', '300', '400', '500', '600', '700', '800', '900'],
      },
      {
        name: 'Gowun Dodum',
        provider: 'google',
        global: true,
        weights: ['500']
        // weights: ['100', '200', '300', '400', '500', '600', '700', '800', '900'],
      },
      {
        name: 'Escoredream',
        provider: 'noonnu-bundle',
        global: true,
        weights: ['500']
        // weights: ['100', '200', '300', '400', '500', '600', '700', '800', '900'],
      },
      {
        name: 'Paperozi',
        provider: 'noonnu-bundle',
        global: true,
        weights: ['500']
        // weights: ['100', '200', '300', '400', '500', '600', '700', '800', '900'],
      },
      {
        name: 'A2z',
        provider: 'noonnu-bundle',
        global: true,
        weights: ['500']
        // weights: ['100', '200', '300', '400', '500', '600', '700', '800', '900'],
      },
      {
        name: 'YeogiOttaeJalnanGothic',
        provider: 'noonnu-bundle',
        global: true,
        weights: ['500']
        // weights: ['100', '200', '300', '400', '500', '600', '700', '800', '900'],
      },
      {
        name: 'Datatype',
        // Datatype is a custom font syntax, not a Google Fonts family.
        // Avoid @nuxt/fonts fetch/injection for this family.
        provider: 'none',
        global: false,
        weights: ['400'],
        subsets: ['latin']
      }
    ],
    providers: {
      'noonnu-bundle': resolver.resolve('./providers/noonnu-bundle')
    }
  },
  image: {
    format: ['avif', 'webp'], // 더 작은 포맷 우선
    quality: 75, // 기본 이미지 품질(용량 절감)
    densities: [1, 2],
    screens: {
      'xs': 320,
      'sm': 640,
      'md': 768,
      'lg': 1024,
      'xl': 1280,
      '2xl': 1536
    },
    ipx: {
      maxAge: 60 * 60 * 24 * 30 // 최적화 이미지 30일 캐시
    },
    domains: [
      'img.freepik.com',
      'cdn-icons-png.freepik.com',
      'cdn0.iconfinder.com',
      'picsum.photos',
      'images.unsplash.com',
      /*
       * 운영(Netlify)에서만 필요하다 — 로컬에서 지워도 아무 일도 안 일어나서 없어도 되는 줄로 보인다.
       * `ipx` 프로바이더는 `validateDomains`가 켜져 있어 목록에 없는 호스트를 원본 URL 그대로 통과시키지만,
       * `netlifyImageCdn`은 그 키가 아예 없어 절대 URL을 전부 `/.netlify/images?url=…`로 감싼다.
       * 그 원격 허용목록이 이 배열에서 나오므로, 빠지면 400 `is not an allowed pattern`이 된다.
       * `model회원.ts`의 `이미지` 게터가 `state.thumbnail`을 무시하고 항상 dicebear를 돌려주므로
       * 그 400은 운영의 회원 아바타 전부를 엑박으로 만든다.
       */
      'api.dicebear.com',
      process?.env?.NUXT_PUBLIC_IMAGE_DOMAIN ?? '',
      ...(process?.env?.NUXT_PUBLIC_IMAGE_DOMAINS?.split(',').map(d => d.trim()) ?? [])
    ]
  },

  pinia: {
    storesDirs: []
  },

  sound: {
    sounds: {
      scan: true
    }
  },

  /**
   * 신원은 Supabase Auth가 소유한다(`_CUSTOM/sql/schema.auth.sql` 머리말).
   * 세션은 쿠키에 실려 SSR·Nitro 라우트에서도 그대로 읽힌다 —
   * `serverSupabaseClient(event).auth.getClaims()` 가 ES256을 **로컬에서** 검증한다.
   *
   * `redirect: false`인 이유: 로그인 여부로 튕기는 판정은 이미
   * `app/middleware/access-control.global.ts`가 `메뉴.접근역할codes`로 한다.
   * 모듈의 리다이렉트를 켜면 같은 질문에 두 곳이 다르게 답한다.
   *
   * 여기 쓰는 건 **anon(publishable) 키**다. service role은 서버 어댑터 전용이고
   * `runtimeConfig.supabaseServiceRoleKey`로만 산다 — 클라 번들에 나가면 안 된다.
   */
  supabase: {
    redirect: false,
    url: process.env.NUXT_SUPABASE_URL,
    key: process.env.NUXT_SUPABASE_ANON_KEY,

    /**
     * 모듈 기본값은 `secure: true`다. 그 쿠키가 세션을 싣는 유일한 자리라
     * (`serverSupabaseClient`가 이 값을 그대로 받아 응답 쿠키를 심는다)
     * **평문 http로 붙으면 브라우저가 쿠키를 통째로 버린다** — 로그인 라우트는 200을 주는데
     * 뒤이은 `/auth/me`만 비로그인으로 돌아와서 "클릭로그인이 안 된다"로 보인다.
     * 브라우저는 `http://localhost`만 예외로 받아주므로, 폰·다른 기기에서
     * LAN IP나 테일스케일 IP(`http://100.x`)로 붙는 순간 증상이 난다.
     *
     * `NODE_ENV` 기준인 이유: `nuxt dev`에서만 풀고 `nuxt build` 산출물은 `Secure`를 그대로 둔다.
     * `NUXT_PUBLIC_IS_DEV`로 걸면 `.env`에 `true`가 박혀 있어 preview 빌드까지 같이 풀린다.
     */
    cookieOptions: { secure: process.env.NODE_ENV === 'production' }
  }

})
