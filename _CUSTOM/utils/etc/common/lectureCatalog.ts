/** 샘플 강의 링크: 항목은 항상 { title, url } */
export type 강의목록Item = { title: string, url: string }
export type 강의목록Group = { label: string, thumbnail?: string, tags?: string[], aliases?: string[], list: 강의목록Item[] }

export const 강의목록ss = [
  {
    label: '과학 상식과 우주론 입문 (쿠르츠게작트)',
    thumbnail: 'https://img.youtube.com/vi/bLwCoUJqMu8/0.jpg',
    aliases: [
      '한눈에 보는 세상 – 쿠르츠게작트',
      '한눈에 보는 세상 - 쿠르츠게작트',
      '과학·우주 상식 입문: 쿠르츠게작트 인기 강의'
    ],
    tags: ['과학', '상식', '우주', '생명', '쿠르츠게작트', '한눈에 보는 세상'],
    list: [
      { title: '마리아나 해구에서 핵폭탄을 터뜨리면? (판타지 아님, 과학임)', url: 'https://www.youtube.com/watch?v=bLwCoUJqMu8' },
      { title: '나는 무엇인가?', url: 'https://www.youtube.com/watch?v=oAbD397s7Ik' },
      { title: '초끈 이론 – 현실의 본질은?', url: 'https://www.youtube.com/watch?v=xgt9vW9g33k' },
      { title: '지구가 금이 된다면?', url: 'https://www.youtube.com/watch?v=EoQ4DlIRuSc' },
      { title: '물질이란 무엇인가?', url: 'https://www.youtube.com/watch?v=CUkWaEg4NDE' },
      { title: '세상의 모든 핵폭탄을 동시에 터뜨리면?', url: 'https://www.youtube.com/watch?v=bLwCoUJqMu8' },
      { title: '지구에서 가장 치명적인 바이러스', url: 'https://www.youtube.com/watch?v=hes4Nq9b9dc' },
      { title: '금성을 (빠르게) 테라포밍하는 방법', url: 'https://www.youtube.com/watch?v=SsTCNnzlwfI' },
      { title: '지능이란? 지능의 시작은?', url: 'https://www.youtube.com/watch?v=XWKOOfkVEwY' },
      { title: '대도시에 핵폭탄이 터진다면?', url: 'https://www.youtube.com/watch?v=Onp2Qe7n4x4' },
      { title: '외계인을 찾으면 안 되는 이유 – 어둠의 숲', url: 'https://www.youtube.com/watch?v=Cw_XSOfi3zQ' },
      { title: '대왕고래가 암에 걸리지 않는 이유 – 피토 역설', url: 'https://www.youtube.com/watch?v=ibwd1hkXa3w' },
      { title: '의식은 어디에서 시작되었을까 – 무의식에서 의식으로', url: 'https://www.youtube.com/watch?v=5J9PMGA_9p8' },
      { title: '외계 문명은 어떤 모습일까? 카르다쇼프 척도', url: 'https://www.youtube.com/watch?v=jDepsZ_sHlY' }
    ]
  },
  {
    label: '애니·게임 주제가와 보컬 감상 기초',
    thumbnail: 'https://img.youtube.com/vi/nDEl0vGczrk/0.jpg',
    aliases: ['파바로티', '애니·J-POP 보컬 감상 입문 (파바로티 스타일 커버)'],
    tags: ['음악', '성악', '애니', 'J-POP', 'OP', '커버'],
    list: [
      { title: '숲 속의 작은 레스토랑 — 森の小さなレストラン', url: 'https://www.youtube.com/watch?v=nDEl0vGczrk' },
      { title: '원피스 OP. \'우리의 꿈\' — ONE PIECE OP. \'Our Dream\'', url: 'https://www.youtube.com/watch?v=B4u4Bps1CIM' },
      { title: '너에게로 가는 길 (슬램덩크 OP.) — Crazy For You', url: 'https://www.youtube.com/watch?v=mMlO3f8a-u0' },
      { title: '모두 일어나 (썬더 일레븐 1기 OP.) — 立ち上がリーヨ', url: 'https://www.youtube.com/watch?v=sOyqGvLu3CE' }
    ]
  },
  {
    label: '피아노 명곡 감상: 영상음악과 클래식 편곡',
    thumbnail: 'https://img.youtube.com/vi/rA_2B7Yj4QE/0.jpg',
    aliases: ['피아노', '피아노로 듣는 OST·클래식 명곡 감상'],
    tags: ['음악', '피아노', 'OST', '클래식', '애니메이션'],
    list: [
      { title: '인생의 회전목마 (Merry-Go-Round of Life) - 하울의 움직이는 성 OST', url: 'https://www.youtube.com/watch?v=rA_2B7Yj4QE' },
      { title: '탄지로의 노래 (Tanjiro no Uta) - 귀멸의 칼날 OST', url: 'https://www.youtube.com/watch?v=mNlxH0a6CfI' },
      { title: '베토벤 바이러스(Beethoven Virus) - 반야(BanYa)', url: 'https://www.youtube.com/watch?v=a9JoHtHly-w' },
      { title: '언제나 몇번이라도(Always With Me) - 센과 치히로의 행방불명 OST', url: 'https://www.youtube.com/watch?v=7VzMIw--sQQ' },
      { title: '플라워 댄스(Flower Dance) - DJ Okawari', url: 'https://www.youtube.com/watch?v=CzOtZ-KJFEg' },
      { title: 'Summer - 히사이시 조(Hisaishi Joe)', url: 'https://www.youtube.com/watch?v=e2hfX_Yr6Wg' },
      { title: '시대를 초월한 마음(時代を越える想い) - 이누야샤 OST', url: 'https://www.youtube.com/watch?v=hm5SLHan-wI' },
      { title: 'River flows in you - 이루마(Yiruma)', url: 'https://www.youtube.com/watch?v=5vO5HuphDnM' },
      { title: '샤콘느(Chaconne) - 이루마 (Yiruma)', url: 'https://www.youtube.com/watch?v=8eVSUaXw7_8' },
      { title: '코타로 오시오 — 황혼 (Twilight) · 편곡', url: 'https://www.youtube.com/watch?v=Rh4xMPutHqo' },
      { title: '엘가(Elgar) — 위풍당당 행진곡 1번 · 편곡', url: 'https://www.youtube.com/watch?v=Y804Hij0FnI' },
      { title: '오펜바흐 — 캉캉 · 편곡', url: 'https://www.youtube.com/watch?v=81azy090NK4' },
      { title: '"윈도우 XP" 시작음 풀버전', url: 'https://www.youtube.com/watch?v=_GIci6f2YWQ' },
      { title: '캐리비안의 해적 OST 편곡', url: 'https://www.youtube.com/watch?v=0nCVlJHkSTc' }
    ]
  },
  {
    label: '현대 사회와 국제 관계 입문',
    thumbnail: 'https://img.youtube.com/vi/U5PGLmK2dFQ/0.jpg',
    aliases: ['지식 브런치', '시사·지정학 브런치: 세계를 이해하는 짧은 강의'],
    tags: ['시사', '사회', '지정학', '역사', '세계'],
    list: [
      { title: '성당 하나에 600년… 유럽 건축이 느린 진짜 이유', url: 'https://www.youtube.com/watch?v=U5PGLmK2dFQ' },
      { title: '그때 이란은 왜 민주공화국 아닌 신정국가를 택했나', url: 'https://www.youtube.com/watch?v=aQm-pI99cHQ' },
      { title: '핵보유국 vs 최빈국… 파키스탄-아프간 전쟁의 진짜 이유', url: 'https://www.youtube.com/watch?v=b5eE7gRH6L4' },
      { title: '전 세계가 개방한 구글 지도… 한국은 왜 20년을 버텼나?', url: 'https://www.youtube.com/watch?v=NVU7ru_9y1g' },
      { title: '땅 준대도 \'No\'!! 미국이 되기 위한 조건', url: 'https://www.youtube.com/watch?v=QxSGyqVjRR0' },
      { title: '“미국 시민권 준다는데 싫다고?” 미국이 되길 거부한 나라들', url: 'https://www.youtube.com/watch?v=uceGdau6iSc' },
      { title: '중남미 몰아보기 1편 - 이 대륙을 이해하는 가장 빠른 방법', url: 'https://www.youtube.com/watch?v=as6BjHBghX0' },
      { title: '왜 어떤 나라는 언어가 840개고, 어떤 나라는 1개일까', url: 'https://www.youtube.com/watch?v=qyCtGbkgQfg' }
    ]
  },
  {
    label: '원시기술 제작 실습 (불·가옥·도예·야금)',
    thumbnail: 'https://img.youtube.com/vi/P73REgj-3UE/0.jpg',
    aliases: ['원시기술 - primitive technology', '원시기술 실습 종합: 불·도구·가옥·도자기·철'],
    tags: ['원시', '원시기술', '야생', '생존', '도예', '제철'],
    list: [
      { title: 'Tiled Roof Hut', url: 'https://www.youtube.com/watch?v=P73REgj-3UE' },
      { title: 'Cord drill and Pump drill', url: 'https://www.youtube.com/watch?v=ZEl-Y1NvBVI' },
      { title: '송풍기', url: 'https://www.youtube.com/watch?v=VVV4xeWBIxE' },
      { title: 'Stone Axe (celt)', url: 'https://www.youtube.com/watch?v=BN-34JfUrHY' },
      { title: '굴뚝 및 냄비', url: 'https://www.youtube.com/watch?v=mL3sho1CpkI' },
      { title: 'Mud Bricks', url: 'https://www.youtube.com/watch?v=D59v74k5flU' },
      { title: 'Water powered hammer (Monjolo)', url: 'https://www.youtube.com/watch?v=i9TdoO2OVaA' },
      { title: 'Wattle and Daub Hut', url: 'https://www.youtube.com/watch?v=nCKkHqlx9dE' },
      { title: 'Spear Thrower', url: 'https://www.youtube.com/watch?v=rrlr02YDr5A' },
      { title: 'Woven bark fiber', url: 'https://www.youtube.com/watch?v=ey68uVUuyvs' },
      { title: 'Natural Draft Furnace', url: 'https://www.youtube.com/watch?v=u7wAJTGl2gc' },
      { title: 'Sling', url: 'https://www.youtube.com/watch?v=RzDMCVdPwnE' },
      { title: 'Termite clay kiln & pottery', url: 'https://www.youtube.com/watch?v=uZGFTmK6Yk4' },
      { title: 'Charcoal', url: 'https://www.youtube.com/watch?v=GzLvqCTvOQY' },
      { title: 'Freshwater Prawn Trap', url: 'https://www.youtube.com/watch?v=e5nfrehyWDM' },
      { title: 'Blower and charcoal', url: 'https://www.youtube.com/watch?v=JgQ-07VgJuY' },
      { title: 'Sweet potato patch', url: 'https://www.youtube.com/watch?v=TTcXhYHmOx8' },
      { title: 'Barrel Tiled Shed', url: 'https://www.youtube.com/watch?v=q9AoGc-OTCk' },
      { title: 'Reusable charcoal mound', url: 'https://www.youtube.com/watch?v=SjK2XlNE39Q' },
      { title: 'Simplified blower and furnace experiments', url: 'https://www.youtube.com/watch?v=c2ExwOAjLNw' },
      { title: 'Pottery and Stove', url: 'https://www.youtube.com/watch?v=_YDuLCIzbN4' },
      { title: 'Yam, cultivate and cook', url: 'https://www.youtube.com/watch?v=J8MLpv_utfM' },
      { title: 'Palm Thatched Mud Hut', url: 'https://www.youtube.com/watch?v=KzMfeQyY5xM' },
      { title: 'Making poisonous Black bean safe to eat (Moreton Bay Chestnut)', url: 'https://www.youtube.com/watch?v=eVvQnsKuOcE' },
      { title: 'Bed Shed', url: 'https://www.youtube.com/watch?v=_ZXUCQc2Z78' },
      { title: 'A-frame hut', url: 'https://www.youtube.com/watch?v=_7985zBEM3o' },
      { title: 'Grass hut', url: 'https://www.youtube.com/watch?v=qEUGOyjewD4' },
      { title: 'Lime', url: 'https://www.youtube.com/watch?v=Ek3aeUhHaFY' },
      { title: 'Pit and chimney furnace', url: 'https://www.youtube.com/watch?v=U7nqBgklf9E' },
      { title: 'Planting Cassava and Yams', url: 'https://www.youtube.com/watch?v=aZ4KNMnTsIs' },
      { title: 'Wood Ash Cement', url: 'https://www.youtube.com/watch?v=DP0t2MmOMEA' },
      { title: '구은 진흙 벽돌', url: 'https://www.youtube.com/watch?v=FwRFH7MH5N0' },
      { title: 'Pot Made of Wood Ash - New Clay Alternative', url: 'https://www.youtube.com/watch?v=rG6nzrksbPQ' },
      { title: '새로운 장소에서 다시 시작하기', url: 'https://www.youtube.com/watch?v=qQTVuRrZO8w' },
      { title: 'Round hut', url: 'https://www.youtube.com/watch?v=vAuO3bHxSpc' },
      { title: 'Sandals', url: 'https://www.youtube.com/watch?v=i-WYT2UotIc' },
      { title: '돌 자귀', url: 'https://www.youtube.com/watch?v=-JcWY0rjePU' },
      { title: 'Iron prills', url: 'https://www.youtube.com/watch?v=DyGLE0usN_I' },
      { title: 'Crossdraft kiln', url: 'https://www.youtube.com/watch?v=RnvtXikwrIU' },
      { title: 'Baskets and stone hatchet', url: 'https://www.youtube.com/watch?v=kiHojsMTBeA' },
      { title: 'Iron knife made from bacteria', url: 'https://www.youtube.com/watch?v=dhW4XFGQB4o' },
      { title: 'Wood shed and Native bee honey', url: 'https://www.youtube.com/watch?v=ZajpkwDeEYg' },
      { title: 'Polynesian Arrowroot Flour', url: 'https://www.youtube.com/watch?v=lMZY_9QNe4I' },
      { title: 'Firesticks', url: 'https://www.youtube.com/watch?v=z9n9rqb-lvY' },
      { title: 'Hut burned down, built new one', url: 'https://www.youtube.com/watch?v=YmFTK-rnzfk' },
      { title: 'Thatched Dome Hut', url: 'https://www.youtube.com/watch?v=Uwtu_DARM9I' },
      { title: 'Brick Firing Kiln', url: 'https://www.youtube.com/watch?v=wrTDJbaxhOI' },
      { title: 'Making Iron From Creek Sand', url: 'https://www.youtube.com/watch?v=OPIUMpiV0IY' },
      { title: 'Stone Yam planters', url: 'https://www.youtube.com/watch?v=1Ph_ORewpE0' },
      { title: 'Volute Shaped Blower', url: 'https://www.youtube.com/watch?v=Csb-AFD58ww' },
      { title: 'Purifying Clay By Sedimentation and Making Pots', url: 'https://www.youtube.com/watch?v=k2RKtUh6m3Q' },
      { title: 'Grass thatch, Mud hut', url: 'https://www.youtube.com/watch?v=Ka2Eu6LxAKo' },
      { title: 'Adobe wall (dry stacked)', url: 'https://www.youtube.com/watch?v=hzz36cvo88U' },
      { title: 'Smelting Iron In Brick Furnaces', url: 'https://www.youtube.com/watch?v=RZGAYzItazw' },
      { title: 'Thatched Workshop', url: 'https://www.youtube.com/watch?v=0tZLCCLMws4' },
      { title: 'Brick kiln, brick mold and bricks', url: 'https://www.youtube.com/watch?v=ShvAN9bLwnw' },
      { title: 'Roasted Ore and Shell Flux Smelt', url: 'https://www.youtube.com/watch?v=0_p91pv6jdI' },
      { title: 'Pottery Wheel', url: 'https://www.youtube.com/watch?v=Gqhxe_pL6Ws' },
      { title: 'Decarburization of iron and forging experiments', url: 'https://www.youtube.com/watch?v=pOj4L9yp7Mc' },
      { title: 'New Brick Kiln Design', url: 'https://www.youtube.com/watch?v=7SH4irC_xMs' },
      { title: 'Making Charcoal (3 Different Methods)', url: 'https://www.youtube.com/watch?v=JsObuHO1tMA' },
      { title: 'Cane Water Filter/Siphon', url: 'https://www.youtube.com/watch?v=nG-rNHgFxhs' },
      { title: 'Iron Bacteria Cement (no fire/water insoluble)', url: 'https://www.youtube.com/watch?v=9irICRnszOc' }
    ]
  },
  {
    label: '자바스크립트 웹 프로그래밍 기초',
    thumbnail: 'https://img.youtube.com/vi/NoLV5iP5FNY/0.jpg',
    aliases: ['프로그래밍 유튜버', '웹·자바스크립트 개발 입문 (실전 유튜브 코스)'],
    tags: ['IT', '매콤코딩', '웹개발', '자바스크립트', 'Git', 'Node.js'],
    list: [
      { title: '서버에 대해 겁나쉽게 설명해드림 (Node.js 입문)', url: 'https://www.youtube.com/watch?v=NoLV5iP5FNY' },
      { title: 'JSON (존슨) 은 자바스크립트 문법이 아닙니다', url: 'https://www.youtube.com/watch?v=1ID6pfTViXo' },
      { title: '개발자 90%가 모르는 자바스크립트 동작원리', url: 'https://www.youtube.com/watch?v=v67LloZ1ieI' },
      { title: '코딩초보들이 헷갈리는 용어 : API가 뭐냐면', url: 'https://www.youtube.com/watch?v=ckSdPNKM2pY' },
      { title: '객체지향 Class 문법 10분만에 이해시켜줌', url: 'https://www.youtube.com/watch?v=dHrI-_xq1Vo' },
      { title: '요즘 개발자 연봉 현실 (2023 조사 결과)', url: 'https://www.youtube.com/watch?v=IoV_94hr7ks' },
      { title: '크롬 공룡게임 만들기 1편 (자바스크립트)', url: 'https://www.youtube.com/watch?v=qkTtmgCjHhM' },
      { title: '깃, 깃허브 제대로 배우기 (기본 마스터편)', url: 'https://www.youtube.com/watch?v=Z9dvM7qgN9s' },
      { title: '개발자 취업을 위한 포트폴리오 만들기', url: 'https://www.youtube.com/watch?v=KJUdqPDAtTI' },
      { title: '자바스크립트 10. JSON 개념 정리와 활용방법', url: 'https://www.youtube.com/watch?v=FN_D4Ihs3LE' },
      { title: 'API란? 개념 정리와 포트폴리오 유용 사이트', url: 'https://www.youtube.com/watch?v=ogT267HvNuQ' },
      { title: 'CI/CD 5분 개념 정리 (현업 개발 프로세스)', url: 'https://www.youtube.com/watch?v=0Emq5FypiMM' },
      { title: '자바스크립트 배열 제대로 알고 쓰자 (APIs 총정리)', url: 'https://www.youtube.com/watch?v=yOdAVDuHUKQ' },
      { title: '깃허브 사용법 + 단축키 (이것좀 알고 사용하자)', url: 'https://www.youtube.com/watch?v=2tK0txsNd6U' }
    ]
  },
  {
    label: '영화의 이해: 서사·인물·정서 분석 입문',
    thumbnail: 'https://img.youtube.com/vi/TY1R2h4v1CA/0.jpg',
    aliases: ['영화 분석', '영화 감상과 비평: 인간·서사 읽기'],
    tags: ['영화', '예술', '비평', '감상', '드라마'],
    list: [
      { title: '프라하의 겨울 끝에서 만난, 한 줄기 봄볕', url: 'https://www.youtube.com/watch?v=TY1R2h4v1CA' },
      { title: '극적인 사건 없이도, 인간의 쓸쓸함을 드러내는 밀도 높은 연기의 영화', url: 'https://www.youtube.com/watch?v=Wd_VRTK-7Yk' },
      { title: '홀로 남겨진 삶을 다시 시작하게 만든 편지 한 장', url: 'https://www.youtube.com/watch?v=AgxWpfylOGQ' },
      { title: '번듯한 대학을 나와 뉴욕 최고의 상류층 유모로 들어간 그녀', url: 'https://www.youtube.com/watch?v=bXc60Oy62Bg' },
      { title: '투박하지만 따뜻한 북유럽 감성 가득한 크리스마스 영화', url: 'https://www.youtube.com/watch?v=K5pMb_CqJc8' },
      { title: '평생 마음을 닫고 살던 아이를 입양한 남자에게 벌어진 일', url: 'https://www.youtube.com/watch?v=uoMzktJAGb4' }
    ]
  },
  {
    label: '대중음악 라이브 감상 실습 (킬링보이스)',
    thumbnail: 'https://img.youtube.com/vi/3Hr35Kr2aXA/0.jpg',
    aliases: ['딩고 - 킬링보이스', '딩고 킬링보이스: K-POP·발라드 라이브 감상'],
    tags: ['음악', '딩고', '킬링보이스', 'K-POP', '발라드', '라이브'],
    list: [
      { title: '악뮤(AKMU) — 라면인건가, DINOSAUR, 후라이의 꿈, Love Lee, 사람들이 움직이는 게, 200%, 시간과 낙엽, 오랜 날 오랜 밤, 낙하', url: 'https://www.youtube.com/watch?v=3Hr35Kr2aXA' },
      { title: '태연(TAEYEON) — I, 그대라는 시, 만약에, 11:11, Blue, Time Lapse, Weekend, 불티, 사계, Gravity, INVU, 너를 그리는 시간', url: 'https://www.youtube.com/watch?v=5ch94AaPZRQ' },
      { title: '잔나비(JANNABI) — 주저하는 연인들을 위해, 가을밤에 든 생각, She, 사랑하긴했었나요, 투게더!, 꿈과책과힘과벽, 뜨거운여름밤은가고, HONGKONG', url: 'https://www.youtube.com/watch?v=BdwfiToXEio' },
      { title: '에일리(AILEE) — Heaven, 보여줄게, 저녁하늘, U&I, Higher, 노래가 늘었어, 손대지마, 첫눈처럼 너에게 가겠다, If you', url: 'https://www.youtube.com/watch?v=5GrKuaXBg4k' },
      { title: '볼빨간사춘기(BOL4) — 나만 봄, 여행, 나의 사춘기에게, Seoul, Love story, 우주를 줄게, 썸 탈꺼야, 좋다고 말해', url: 'https://www.youtube.com/watch?v=u_nc-t4oHfw' },
      { title: 'Stray Kids(스트레이 키즈) — 神메뉴, MANIAC, 소리꾼, MIROH, 미친 놈, 특, CEREMONY', url: 'https://www.youtube.com/watch?v=ND2znH4KgPo' },
      { title: 'SUPER JUNIOR (슈퍼주니어) — 쏘리 쏘리, U, Miracle, Express Mode, 로꾸거, 너라고', url: 'https://www.youtube.com/watch?v=F28lRubLEKs' },
      { title: '엔하이픈(ENHYPEN) — Bite Me, CRIMINAL LOVE, Polaroid Love, Bad Desire', url: 'https://www.youtube.com/watch?v=6jlQkIgS40g' },
      { title: '노을(Noel) — 늦은 밤 너의 집 앞 골목길에서, 그리워 그리워, 청혼, 전부 너였다, 붙잡고도, 인연, 목소리, 하지 못한 말, 오늘도 그대만', url: 'https://www.youtube.com/watch?v=Vo1bTkDALpU' },
      { title: '케이시(Kassy) — 그때가 좋았어, 진심이 담긴 노래, 굿모닝, 어느 햇살 좋은 날, 나 그댈위해 시 한편을 쓰겠어', url: 'https://www.youtube.com/watch?v=XK4030cO0ko' }
    ]
  }
]

/** 저장된 강좌명(현재 label·예전 label·짧은 태그 등)으로 카탈로그 그룹 찾기 */
export function find강좌Group(강좌제목: string): 강의목록Group | undefined {
  const q = 강좌제목.trim()
  if (!q) return undefined

  const exact = 강의목록ss.find(
    item => item.label === q || item.aliases?.includes(q)
  )
  if (exact) return exact

  return 강의목록ss.find((item) => {
    if (item.label.includes(q) || q.includes(item.label)) return true
    if (item.aliases?.some(a => a.includes(q) || q.includes(a))) return true
    return item.tags?.some((t) => {
      const T = t.trim()
      return T.length > 0 && (q.includes(T) || T.includes(q))
    })
  })
}
