import { BaseModels2, BaseModel2, type BaseXX, type BaseXXDto, getRepoInstance } from '~utils/models'

export interface i기본dto extends BaseXXDto {
  name: string
}

export interface i기본 extends BaseXX {
  이름: string
}

export class model기본s extends BaseModels2<model기본, i기본dto> {
  protected etcFields = []
  static getInstance = () => getRepoInstance('model기본s', () => new model기본s())

  private constructor() {
    super(model기본, 'basics')
  }

  //   get 메뉴() { return model메뉴s.getInstance().getBy테이블명(this.tableName); }

  override async reads() {
    return super.reads()
  }

  override _generate = () => new model기본().generate()
  override _init = () => new model기본().init()
}

export class model기본 extends BaseModel2<i기본dto> implements i기본 {
  constructor(state?: i기본dto) {
    super(model기본s.getInstance(), state)
  }

  override afterCreate = () => { }
  override beforeSave = () => true
  override afterSave = () => { }

  override 자동필드ss = [
    {
      label: '기본',
      list: [
        { key: '이름', label: '이름' }
      ]
    }
  ]

  override generate() {
    return this.init()
  }

  override init() {
    return {
      name: '이름'
    }
  }

  override get label() { return this.이름 }

  get 이름() { return this.state?.name ?? '' }
  set 이름(v: string) { if (!this.state) return; this.state.name = v }
}
