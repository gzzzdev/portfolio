import { mDayjs } from '~utils';
import { BaseModels2, BaseModel2, 타입지정, getRepoInstance, hasServerPk } from '~utils/models';
import type { BaseXXDto, BaseXX } from '~utils/models';
import { computed, toValue } from 'vue';

import { model등급별심사s, type model등급별심사 } from './model등급별심사';
import { model회원s,model메뉴s } from '../_basics';


import { model회원의등급심사s, type model회원의등급심사 } from './model회원의등급심사';

export type i등급심사유형 = 'enroll' | 'auto';
export const i등급심사유형options = [
  { label: '자동', value: 'auto' },
  { label: '수동', value: 'enroll' },
] as const;

export interface i등급심사dto extends BaseXXDto {
 
  type: i등급심사유형;
  date: string;
  nickName: string;
  isEnd: boolean;
}

export interface i등급심사 extends BaseXX {
  유형: i등급심사유형;
  심사일: ReturnType<typeof mDayjs>;
  회차명: string;
  is종료: boolean;
  is진행중: boolean;
  대상자수: number;
  합격자수: number;
  불합격자수: number;
  등급별심사s: model등급별심사[];
  회원의등급심사s: model회원의등급심사[];
}

export class model등급심사s extends BaseModels2<model등급심사, i등급심사dto> {
  protected etcFields = [];
  override 필터조건ss = [
    this.라디오필터그룹(
      i등급심사유형options.map((item) => ({
        label: item.label,
        value: (row: model등급심사) => row.유형 === item.value,
      })),
      { title: '유형' },
    ),
    this.라디오필터그룹(
      [
        { label: '진행중', value: (row: model등급심사) => row.is진행중, 대기: true },
        { label: '종료', value: (row: model등급심사) => row.is종료 },
      ],
      { title: '상태' },
    ),
  ];
  static getInstance = () => getRepoInstance('model등급심사s', () => new model등급심사s());

  private constructor() {
    super(model등급심사, 'gradings');
  }
  get 메뉴() { return model메뉴s.getInstance().getBy테이블명(this.tableName) }

  override _generate = () => new model등급심사().generate();
  override _init = () => new model등급심사().init();

  private _has진행중심사 = () => toValue(this.list).some((row) => row.is진행중);

  private _assert생성가능 = () => {
    if (!this._has진행중심사()) return true;
    if (import.meta.client) {
      useAlert().error('등급심사 생성 불가', '마감되지 않은 심사가 있습니다. ');
    }
    throw new Error('등급심사 생성 불가: isEnd=false(진행중) 심사가 이미 존재합니다.');
  };

  override create = async (item: i등급심사dto, is등록필요 = true) => {
    this._assert생성가능();
    return await super.create({ ...(item as any), isEnd: false }, is등록필요);
  };

  override empty = async (m = this._init()) => {
    return await this.create(m as i등급심사dto, true);
  };

  override random = async (m: Omit<i등급심사dto, 'id'> = this._generate()) => {
    const dto = {
      ...(m as any),
      id: `imsi${Date.now()}`,
      isEnd: false,
    } as i등급심사dto;
    return await this.create(dto, true);
  };
}

export class model등급심사 extends BaseModel2<i등급심사dto> implements i등급심사 {
  constructor(state?: i등급심사dto) {
    super(model등급심사s.getInstance(), state);
  }

  bindModel = null as any;
  override afterCreate = () => {
    void model등급별심사s.getInstance().ensureFor등급심사(this);
  };
  override afterSave = () => {
    void model등급별심사s.getInstance().ensureFor등급심사(this);
  };

  override beforeSave = () => {
    return true;
  };

  override 자동필드ss = [
    {
      label: '기본',
      list: [
        
        { key: '회차명', label: '회차명', show: true },
        {
          key: '유형',
          label: '유형',
          type: 타입지정.선택0,
          options: i등급심사유형options,
          props: { type: 'radio' },
          show: true,
        },
        
        { key: '심사일', label: '심사일', type: 타입지정._.날짜, show: true },
        { key: '대상자수', label: '대상', type: 타입지정._.숫자, show: true, canEdit: false },
        { key: '합격자수', label: '합격', type: 타입지정._.숫자, show: true, canEdit: false },
        { key: '불합격자수', label: '불합격', type: 타입지정._.숫자, show: true, canEdit: false },
      ],
    },
    {
      label: '등급별 심사',
      config: { ratio: 40 },
      list: [
        {
          key: '등급별심사s',
          label: '등급별 심사',
          type: 타입지정._.카드s,
          show: true,
          is한줄: false,
          props: { show탭: false },
        },
      ],
    },
  ];

  override 자동버튼s = this.기본버튼s.concat([
    {
      key: 'do대상자s등록',
      label: '전체 대상자등록',
      icon: 'i-lucide-users',
      show: true,
    },
    {
      key: 'do대상자s일괄심사',
      label: '전체 일괄 심사',
      icon: 'i-lucide-badge-check',
      show: true,
    },
    {
      key: 'do마감',
      label: '마감',
      icon: 'i-lucide-lock',
      show: computed(() => this.is진행중),
    },
  ]);

  override generate() {
    const typeRaw = this.state?.type;
    const type: i등급심사유형 = typeRaw === 'enroll' || typeRaw === 'auto' ? typeRaw : 'auto';
    const rawDate = String(this.state?.date ?? '').trim();
    const date = mDayjs(rawDate).isValid()
      ? mDayjs(rawDate).format('YYYY-MM-DD')
      : mDayjs().format('YYYY-MM-DD');

    return {
      ...this.init(),
      type,
      date,
      nickName: String(this.state?.nickName ?? '').trim(),
      isEnd: !!(this.state?.isEnd ?? (this.state as any)?.is종료),
    };
  }

  override init() {
    return {
      type: 'auto' as i등급심사유형,
      date: mDayjs().format('YYYY-MM-DD'),
      nickName: '',
      isEnd: false,
    };
  }

  get 유형(): i등급심사유형 { const v = this.state?.type; return v === 'enroll' || v === 'auto' ? v : 'auto'; }
  set 유형(v: i등급심사유형) { this.state.type = v === 'enroll' ? 'enroll' : 'auto'; }

  get 심사일() { const raw = String(this.state?.date ?? '').trim(); const d = mDayjs(raw); return d.isValid() ? d : mDayjs(); }
  set 심사일(v: ReturnType<typeof mDayjs>) { this.state.date = mDayjs(v).format('YYYY-MM-DD'); }

  get 회차명() { return String(this.state?.nickName ?? '').trim(); }
  set 회차명(v: string) { this.state.nickName = String(v ?? '').trim(); }

  get is종료() { return !!(this.state?.isEnd ?? (this.state as any)?.is종료); }
  set is종료(v: boolean) { this.state.isEnd = !!v; }

  get is진행중() { return !this.is종료; }

  get 등급별심사s(): model등급별심사[] { return model등급별심사s.getInstance().getsBy등급심사(this); }

  get 회원의등급심사s(): model회원의등급심사[] { return model회원의등급심사s.getInstance().getsBy등급심사(this); }

  get 대상자수() { return this.회원의등급심사s.length; }

  get 합격자수() { return this.회원의등급심사s.filter((row) => row.상태 === 'passed').length; }

  get 불합격자수() { return this.회원의등급심사s.filter((row) => row.상태 === 'fail').length; }

  _badges = computed(() => {
    const total = this.대상자수;
    const passed = this.합격자수;
    const failed = this.불합격자수;
    const 진행중 = this.is진행중;
    return [
      { label: 진행중 ? '진행중' : '종료', color: 진행중 ? ('primary' as const) : ('neutral' as const) },
      { label: `대상 ${total}`, color: 'neutral' as const },
      { label: `합격 ${passed}`, color: passed > 0 ? ('primary' as const) : ('neutral' as const) },
      { label: `불합격 ${failed}`, color: failed > 0 ? ('error' as const) : ('neutral' as const) },
    ];
  });
  override get badges() { return toValue(this._badges); }

  /** nickName 없을 때 `YY.MM N차 등급심사` — N은 같은 월 내 id 오름차순, 미저장은 항상 마지막 회차 */
  월내회차 = (): number => {
    const ym = this.심사일.format('YY.MM');
    const isPending = (row: model등급심사) => !hasServerPk(row.stateId);
    const pk = (row: model등급심사) => String(row.stateId ?? '');
    const allList = toValue(model등급심사s.getInstance().list);
    const listIndex = new Map(allList.map((row, i) => [row, i]));
    const sameMonth = allList
      .filter((row) => row.심사일.format('YY.MM') === ym)
      .sort((a, b) => {
        const aPending = isPending(a);
        const bPending = isPending(b);
        if (aPending !== bPending) return aPending ? 1 : -1;
        if (aPending && bPending) return (listIndex.get(a) ?? 0) - (listIndex.get(b) ?? 0);
        return pk(a).localeCompare(pk(b), undefined, { numeric: true });
      });
    const idx = sameMonth.findIndex(
      (row) => row === this || (!isPending(this) && row.isSame(this)),
    );
    if (idx >= 0) return idx + 1;
    if (isPending(this)) return sameMonth.length + 1;
    return 1;
  };

  override get label() { return this.회차명 || `${this.심사일.format('YY년 M월')} 등급심사 ${this.월내회차()}차`; }

  override get sub() { const total = this.대상자수; return total ? `대상 ${total}명 · 합격 ${this.합격자수} · 불합격 ${this.불합격자수}` : '대상 없음'; };

  do마감 = async () => {
    if (this.is종료) {
      if (import.meta.client) useAlert().show('등급심사 마감', '이미 마감된 심사입니다.');
      return true;
    }

    const 남은대상자수 = this.회원의등급심사s.filter(
      (row) => row.상태 !== 'passed' && row.상태 !== 'fail',
    ).length;
    if (남은대상자수 > 0 && import.meta.client) {
      const ok = confirm(`미심사 대상자가 ${남은대상자수}명 있습니다.\n그래도 마감할까요?`);
      if (!ok) return false;
    }

    this.is종료 = true;
    await this.do저장(false, false);
    if (import.meta.client) useAlert().success('등급심사 마감', `${this.label}을(를) 마감했습니다.`);
    return true;
  };

  do대상자s등록 = async () => {
    if (!hasServerPk(this.stateId)) {
      useAlert().error('대상자 등록 불가', '등급심사를 먼저 저장한 뒤 다시 시도해주세요.');
      return;
    }
    if (import.meta.server) return;

    const perRepo = model등급별심사s.getInstance();
    const memberRepo = model회원의등급심사s.getInstance();
    await perRepo.ensureFor등급심사(this);

    const 회원s = toValue(model회원s.getInstance().회원s);
    if (!회원s.length) {
      useAlert().show('전체 대상자 등록', '등록된 회원이 없습니다.');
      return;
    }

    const 이미있음 = new Set(
      memberRepo
        .getsBy등급심사(this)
        .map((row) => String(row.state.memberId ?? '').trim())
        .filter(Boolean),
    );

    // `status`는 모델에 없는 멤버였다 — 합격·불합격이 안 난 행이 심사중이다(`do일괄심사`와 같은 판정).
    const 심사중 = new Set(
      toValue(memberRepo.list)
        .filter((row) => row.상태 !== 'passed' && row.상태 !== 'fail')
        .map((row) => String(row.state.memberId ?? '').trim())
        .filter(Boolean),
    );

    const items: ReturnType<typeof memberRepo.buildDtoFor심사>[] = [];
    for (const m of 회원s) {
      const mid = String(m.stateId ?? '');
      if (!mid || 이미있음.has(mid) || 심사중.has(mid)) continue;

      const { target } = memberRepo.resolveFromTargetFor회원(m);
      if (!target) continue;

      const per = perRepo.getBy등급심사_목표등급(this, target);
      if (!per) continue;

      items.push(memberRepo.buildDtoFor심사(mid, String(per.stateId ?? '')));
    }

    if (!items.length) {
      useAlert().show(
        '전체 대상자 등록',
        '추가할 대상이 없습니다. (승급 가능 등급 없음·이미 등록됨·다른 회차 심사중)',
      );
      return;
    }

    const 제외수 = 회원s.length - items.length;
    const msg = [
      `${this.label} 기준`,
      `전체 ${회원s.length}명 중 ${items.length}명을 등급별 심사에 등록합니다.`,
      제외수 > 0 ? `(제외 ${제외수}명)` : '',
      '계속할까요?',
    ]
      .filter(Boolean)
      .join('\n');
    if (!confirm(msg)) return;

    try {
      await memberRepo.creates(items);
      useAlert().success('전체 대상자 등록', `${items.length}명을 등록했습니다.`);
    } catch {
      /* creates에서 알림 */
    }
  };

  do대상자s일괄심사 = async () => {
    if (!hasServerPk(this.stateId)) {
      useAlert().error('일괄 심사 불가', '등급심사를 먼저 저장한 뒤 다시 시도해주세요.');
      return;
    }
    if (import.meta.server) return;

    const candidates = this.회원의등급심사s.filter(
      (row) => row.상태 !== 'passed' && row.상태 !== 'fail',
    );
    if (!candidates.length) {
      useAlert().show('전체 일괄 심사', '심사할 대상자가 없습니다.');
      return;
    }

    const msg = [
      `${this.label} 기준`,
      `미심사 대상 ${candidates.length}명을 등급별로 일괄 심사합니다.`,
      '계속할까요?',
    ].join('\n');
    if (!confirm(msg)) return;

    let passed = 0;
    let failed = 0;
    let skipped = 0;

    for (const track of this.등급별심사s) {
      for (const row of track.회원의등급심사s.filter(
        (r) => r.상태 !== 'passed' && r.상태 !== 'fail',
      )) {
        const result = await row.do심사({ silent: true });
        if (result === 'passed') passed++;
        else if (result === 'fail') failed++;
        else skipped++;
      }
    }

    if (passed + failed === 0) {
      useAlert().show(
        '전체 일괄 심사',
        skipped > 0 ? '처리된 건이 없습니다.' : '심사 결과가 없습니다.',
      );
      return;
    }

    const parts = [`합격 ${passed}명`, `불합격 ${failed}명`];
    if (skipped > 0) parts.push(`건너뜀 ${skipped}명`);
    useAlert().success('전체 일괄 심사', parts.join(' · '));
  };
}

export { model등급심사 as modelGradingEvent, model등급심사s as modelGradingEvents };
