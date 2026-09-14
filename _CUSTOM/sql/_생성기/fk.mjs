/**
 * **FK 표 — `gen-schema.mjs`와 `rowkey-check.mjs`가 함께 읽는 한 벌.**
 *
 * FK는 이름으로 못 정한다 — `tag-links.memoId`는 `memos`가 아니라 `tag-memos`를 가리킨다.
 * 그래서 규칙이 아니라 목록으로 둔다. 이 표가 곧 스키마의 제약 목록이고, 동시에
 * `rowkey-check fk`가 검사하는 대상이다.
 *
 * **한 파일로 합친 이유**: 예전엔 두 스크립트가 같은 표를 각자 들고 「바뀌면 양쪽을 같이
 * 고칠 것」이라는 주석으로 지켰는데, 그 주석이 못 막았다 — `classes.teacherId`가 스키마 쪽에만
 * 들어가서, 제약은 생기는데 검사기는 그 열을 안 보는 상태로 갈라져 있었다.
 * 사람이 지켜야 하는 규약은 어긋나는 쪽으로 흐른다. 그래서 표를 하나로 만든다.
 */
export const FK = {
  'answers': { applicationId: 'applications', questionId: 'questions' },
  'applications': { recruitId: 'recruits', memberId: 'members' },
  'classes': { parentId: 'classes', teacherId: 'members' },
  'grade-conditions': { gradeId: 'grades' },
  'member-comments': { memberId: 'members' },
  'member-entity-historys': { memberId: 'members', roleId: 'roles', gradeId: 'grades' },
  'member-posts': { boardId: 'boards', memberId: 'members' },
  'member-status-historys': { memberId: 'members' },
  'occasions': { parentId: 'occasions' },
  'questions': { questionnaireId: 'questionnaires' },
  'recruits': { questionnaireId: 'questionnaires' },
  'tag-links': { tagId: 'tags', eventId: 'events', memoId: 'tag-memos', resourceId: 'resources' },
  'tag-memos': { tagId: 'tags', memoId: 'tag-memos' },
  'users': { memberId: 'members' }
}

/**
 * **값은 남의 PK인데 FK를 못 거는 열.** 가리키는 표가 값 하나로 안 정해지기 때문이다.
 *
 * 위 `FK`에 넣으면 안 된다. `recruits.ownerId`가 한때 `members`로 들어가 있었는데,
 * 표마다 id가 1부터 매겨져서 **엉뚱한 표에서 찾아 맞고** 검사기가 「통과」를 냈다.
 * 그대로 올렸으면 회원을 지울 때 `on delete set null`이 남의 모집에서 대상을 지웠을 것이다.
 */
export const 폴리모픽s = [
  { 열: 'records.targetId', 사유: '"vegetables:1002" 꼴 (표 이름이 값 안에 있다)' },
  { 열: 'member-comments.commentableId', 사유: 'commentableType 과 짝' },
  { 열: 'recruits.ownerId', 사유: 'ownerTable 과 짝 (surveys·quizzes·polls·classes·occasions)' }
]
