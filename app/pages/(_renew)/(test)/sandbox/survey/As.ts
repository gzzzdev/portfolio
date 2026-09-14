type iID = number

/**
 * 대질문 qId + qIds 순서(매력/필요/중요)의 optionIdx
 * CSV: 매력·필요 = 값-1 / 중요도 = 5-값 (CSV 5=매우 중요 → idx 0)
 */
interface iAnswer {
  qId: iID
  optionIdx: number[]
}

interface iResponse {
  timestamp: string
  answers: iAnswer[]
}

const As: iResponse[] = [
  {
    timestamp: '응답 1',
    answers: [
      { qId: 100, optionIdx: [4, 1, 4] },
      { qId: 101, optionIdx: [0, 0, 2] },
      { qId: 102, optionIdx: [0, 0, 2] },
      { qId: 103, optionIdx: [0, 1, 2] },
      { qId: 104, optionIdx: [0, 1, 2] },
      { qId: 105, optionIdx: [0, 1, 2] },
      { qId: 106, optionIdx: [0, 2, 2] },
      { qId: 107, optionIdx: [0, 0, 2] },
      { qId: 108, optionIdx: [0, 1, 2] },
      { qId: 109, optionIdx: [0, 3, 0] },
      { qId: 110, optionIdx: [2, 1, 2] },
      { qId: 111, optionIdx: [0, 0, 2] },
      { qId: 112, optionIdx: [0, 3, 2] },
      { qId: 113, optionIdx: [0, 3, 2] },
      { qId: 114, optionIdx: [0, 3, 2] },
      { qId: 115, optionIdx: [0, 3, 0] },
      { qId: 116, optionIdx: [0, 3, 2] },
      { qId: 117, optionIdx: [0, 3, 0] },
      { qId: 118, optionIdx: [0, 3, 1] },
      { qId: 119, optionIdx: [0, 3, 0] },
      { qId: 120, optionIdx: [0, 3, 0] }
    ]
  },
  {
    timestamp: '응답 2',
    answers: [
      { qId: 100, optionIdx: [0, 1, 2] },
      { qId: 101, optionIdx: [0, 1, 0] },
      { qId: 102, optionIdx: [1, 3, 1] },
      { qId: 103, optionIdx: [1, 3, 0] },
      { qId: 104, optionIdx: [0, 3, 0] },
      { qId: 105, optionIdx: [1, 3, 1] },
      { qId: 106, optionIdx: [0, 3, 0] },
      { qId: 107, optionIdx: [0, 3, 2] },
      { qId: 108, optionIdx: [0, 4, 0] },
      { qId: 109, optionIdx: [0, 3, 1] },
      { qId: 110, optionIdx: [1, 3, 2] },
      { qId: 111, optionIdx: [0, 3, 0] },
      { qId: 112, optionIdx: [0, 3, 1] },
      { qId: 113, optionIdx: [0, 3, 1] },
      { qId: 114, optionIdx: [0, 3, 0] },
      { qId: 115, optionIdx: [0, 3, 0] },
      { qId: 116, optionIdx: [0, 3, 0] },
      { qId: 117, optionIdx: [0, 4, 2] },
      { qId: 118, optionIdx: [0, 3, 0] },
      { qId: 119, optionIdx: [0, 3, 2] },
      { qId: 120, optionIdx: [0, 3, 2] }
    ]
  },
  {
    timestamp: '응답 3',
    answers: [
      { qId: 100, optionIdx: [2, 2, 3] },
      { qId: 101, optionIdx: [2, 2, 2] },
      { qId: 102, optionIdx: [2, 2, 2] },
      { qId: 103, optionIdx: [4, 0, 4] },
      { qId: 104, optionIdx: [0, 2, 2] },
      { qId: 105, optionIdx: [0, 3, 0] },
      { qId: 106, optionIdx: [0, 3, 1] },
      { qId: 107, optionIdx: [0, 3, 0] },
      { qId: 108, optionIdx: [0, 3, 1] },
      { qId: 109, optionIdx: [0, 3, 0] },
      { qId: 110, optionIdx: [0, 3, 0] },
      { qId: 111, optionIdx: [0, 3, 1] },
      { qId: 112, optionIdx: [0, 3, 0] },
      { qId: 113, optionIdx: [0, 3, 0] },
      { qId: 114, optionIdx: [0, 3, 0] },
      { qId: 115, optionIdx: [0, 3, 0] },
      { qId: 116, optionIdx: [0, 3, 1] },
      { qId: 117, optionIdx: [0, 4, 1] },
      { qId: 118, optionIdx: [0, 3, 0] },
      { qId: 119, optionIdx: [0, 4, 1] },
      { qId: 120, optionIdx: [0, 3, 0] }
    ]
  },
  {
    timestamp: '응답 4',
    answers: [
      { qId: 100, optionIdx: [0, 2, 2] },
      { qId: 101, optionIdx: [0, 1, 2] },
      { qId: 102, optionIdx: [3, 1, 2] },
      { qId: 103, optionIdx: [2, 2, 2] },
      { qId: 104, optionIdx: [3, 1, 2] },
      { qId: 105, optionIdx: [0, 2, 2] },
      { qId: 106, optionIdx: [0, 3, 0] },
      { qId: 107, optionIdx: [0, 3, 0] },
      { qId: 108, optionIdx: [3, 2, 2] },
      { qId: 109, optionIdx: [4, 2, 4] },
      { qId: 110, optionIdx: [2, 2, 2] },
      { qId: 111, optionIdx: [0, 2, 0] },
      { qId: 112, optionIdx: [0, 1, 2] },
      { qId: 113, optionIdx: [0, 3, 1] },
      { qId: 114, optionIdx: [0, 3, 0] },
      { qId: 115, optionIdx: [0, 3, 0] },
      { qId: 116, optionIdx: [0, 3, 0] },
      { qId: 117, optionIdx: [0, 3, 0] },
      { qId: 118, optionIdx: [0, 3, 2] },
      { qId: 119, optionIdx: [0, 2, 2] },
      { qId: 120, optionIdx: [0, 3, 1] }
    ]
  },
  {
    timestamp: '응답 5',
    answers: [
      { qId: 100, optionIdx: [0, 3, 2] },
      { qId: 101, optionIdx: [0, 0, 2] },
      { qId: 102, optionIdx: [0, 4, 0] },
      { qId: 103, optionIdx: [0, 3, 2] },
      { qId: 104, optionIdx: [0, 3, 1] },
      { qId: 105, optionIdx: [0, 4, 0] },
      { qId: 106, optionIdx: [0, 4, 0] },
      { qId: 107, optionIdx: [0, 4, 1] },
      { qId: 108, optionIdx: [0, 4, 0] },
      { qId: 109, optionIdx: [0, 4, 0] },
      { qId: 110, optionIdx: [0, 4, 0] },
      { qId: 111, optionIdx: [0, 4, 0] },
      { qId: 112, optionIdx: [0, 3, 1] },
      { qId: 113, optionIdx: [0, 3, 2] },
      { qId: 114, optionIdx: [0, 4, 0] },
      { qId: 115, optionIdx: [0, 3, 1] },
      { qId: 116, optionIdx: [0, 3, 2] },
      { qId: 117, optionIdx: [1, 4, 0] },
      { qId: 118, optionIdx: [0, 3, 0] },
      { qId: 119, optionIdx: [0, 3, 2] },
      { qId: 120, optionIdx: [0, 3, 2] }
    ]
  },
  {
    timestamp: '응답 6',
    answers: [
      { qId: 100, optionIdx: [0, 1, 2] },
      { qId: 101, optionIdx: [4, 0, 4] },
      { qId: 102, optionIdx: [1, 2, 2] },
      { qId: 103, optionIdx: [1, 0, 2] },
      { qId: 104, optionIdx: [0, 3, 2] },
      { qId: 105, optionIdx: [0, 3, 0] },
      { qId: 106, optionIdx: [0, 3, 0] },
      { qId: 107, optionIdx: [0, 3, 0] },
      { qId: 108, optionIdx: [1, 2, 2] },
      { qId: 109, optionIdx: [0, 3, 2] },
      { qId: 110, optionIdx: [0, 3, 1] },
      { qId: 111, optionIdx: [0, 3, 1] },
      { qId: 112, optionIdx: [0, 2, 0] },
      { qId: 113, optionIdx: [0, 2, 2] },
      { qId: 114, optionIdx: [0, 2, 2] },
      { qId: 115, optionIdx: [0, 3, 0] },
      { qId: 116, optionIdx: [0, 2, 2] },
      { qId: 117, optionIdx: [0, 1, 2] },
      { qId: 118, optionIdx: [0, 2, 2] },
      { qId: 119, optionIdx: [0, 2, 2] },
      { qId: 120, optionIdx: [0, 2, 2] }
    ]
  },
  {
    timestamp: '응답 7',
    answers: [
      { qId: 100, optionIdx: [0, 2, 2] },
      { qId: 101, optionIdx: [1, 2, 2] },
      { qId: 102, optionIdx: [0, 1, 2] },
      { qId: 103, optionIdx: [0, 2, 2] },
      { qId: 104, optionIdx: [0, 2, 2] },
      { qId: 105, optionIdx: [0, 2, 2] },
      { qId: 106, optionIdx: [0, 3, 2] },
      { qId: 107, optionIdx: [0, 3, 0] },
      { qId: 108, optionIdx: [0, 1, 2] },
      { qId: 109, optionIdx: [0, 2, 2] },
      { qId: 110, optionIdx: [0, 1, 2] },
      { qId: 111, optionIdx: [0, 1, 2] },
      { qId: 112, optionIdx: [0, 3, 1] },
      { qId: 113, optionIdx: [0, 3, 0] },
      { qId: 114, optionIdx: [0, 3, 2] },
      { qId: 115, optionIdx: [0, 2, 2] },
      { qId: 116, optionIdx: [0, 1, 2] },
      { qId: 117, optionIdx: [0, 4, 0] },
      { qId: 118, optionIdx: [0, 3, 1] },
      { qId: 119, optionIdx: [0, 1, 2] },
      { qId: 120, optionIdx: [0, 2, 2] }
    ]
  },
  {
    timestamp: '응답 8',
    answers: [
      { qId: 100, optionIdx: [0, 2, 2] },
      { qId: 101, optionIdx: [0, 1, 2] },
      { qId: 102, optionIdx: [1, 2, 4] },
      { qId: 103, optionIdx: [1, 1, 2] },
      { qId: 104, optionIdx: [0, 1, 2] },
      { qId: 105, optionIdx: [2, 1, 4] },
      { qId: 106, optionIdx: [0, 0, 2] },
      { qId: 107, optionIdx: [0, 0, 2] },
      { qId: 108, optionIdx: [0, 2, 2] },
      { qId: 109, optionIdx: [0, 1, 2] },
      { qId: 110, optionIdx: [1, 1, 2] },
      { qId: 111, optionIdx: [0, 0, 2] },
      { qId: 112, optionIdx: [3, 2, 2] },
      { qId: 113, optionIdx: [0, 0, 2] },
      { qId: 114, optionIdx: [0, 2, 2] },
      { qId: 115, optionIdx: [1, 3, 2] },
      { qId: 116, optionIdx: [0, 0, 2] },
      { qId: 117, optionIdx: [0, 3, 0] },
      { qId: 118, optionIdx: [0, 2, 2] },
      { qId: 119, optionIdx: [0, 2, 2] },
      { qId: 120, optionIdx: [0, 0, 4] }
    ]
  },
  {
    timestamp: '응답 9',
    answers: [
      { qId: 100, optionIdx: [0, 3, 0] },
      { qId: 101, optionIdx: [0, 3, 0] },
      { qId: 102, optionIdx: [4, 0, 3] },
      { qId: 103, optionIdx: [1, 3, 0] },
      { qId: 104, optionIdx: [0, 3, 1] },
      { qId: 105, optionIdx: [0, 3, 1] },
      { qId: 106, optionIdx: [0, 3, 0] },
      { qId: 107, optionIdx: [0, 4, 0] },
      { qId: 108, optionIdx: [0, 3, 0] },
      { qId: 109, optionIdx: [0, 3, 2] },
      { qId: 110, optionIdx: [0, 2, 2] },
      { qId: 111, optionIdx: [0, 1, 2] },
      { qId: 112, optionIdx: [0, 1, 2] },
      { qId: 113, optionIdx: [0, 3, 1] },
      { qId: 114, optionIdx: [0, 3, 0] },
      { qId: 115, optionIdx: [0, 3, 0] },
      { qId: 116, optionIdx: [0, 1, 2] },
      { qId: 117, optionIdx: [0, 3, 1] },
      { qId: 118, optionIdx: [4, 0, 4] },
      { qId: 119, optionIdx: [0, 0, 1] },
      { qId: 120, optionIdx: [0, 0, 0] }
    ]
  },
  {
    timestamp: '응답 10',
    answers: [
      { qId: 100, optionIdx: [0, 3, 1] },
      { qId: 101, optionIdx: [0, 3, 0] },
      { qId: 102, optionIdx: [0, 0, 4] },
      { qId: 103, optionIdx: [0, 3, 1] },
      { qId: 104, optionIdx: [0, 3, 0] },
      { qId: 105, optionIdx: [0, 3, 0] },
      { qId: 106, optionIdx: [0, 3, 0] },
      { qId: 107, optionIdx: [0, 4, 0] },
      { qId: 108, optionIdx: [0, 4, 1] },
      { qId: 109, optionIdx: [0, 4, 1] },
      { qId: 110, optionIdx: [0, 3, 1] },
      { qId: 111, optionIdx: [0, 3, 0] },
      { qId: 112, optionIdx: [0, 3, 0] },
      { qId: 113, optionIdx: [0, 3, 0] },
      { qId: 114, optionIdx: [0, 3, 0] },
      { qId: 115, optionIdx: [0, 3, 0] },
      { qId: 116, optionIdx: [0, 3, 1] },
      { qId: 117, optionIdx: [0, 4, 1] },
      { qId: 118, optionIdx: [0, 3, 0] },
      { qId: 119, optionIdx: [0, 3, 0] },
      { qId: 120, optionIdx: [0, 3, 0] }
    ]
  },
  {
    timestamp: '응답 11',
    answers: [
      { qId: 100, optionIdx: [0, 3, 1] },
      { qId: 101, optionIdx: [0, 3, 1] },
      { qId: 102, optionIdx: [0, 1, 0] },
      { qId: 103, optionIdx: [0, 3, 0] },
      { qId: 104, optionIdx: [0, 3, 0] },
      { qId: 105, optionIdx: [0, 3, 1] },
      { qId: 106, optionIdx: [0, 3, 1] },
      { qId: 107, optionIdx: [0, 3, 0] },
      { qId: 108, optionIdx: [0, 4, 1] },
      { qId: 109, optionIdx: [0, 4, 1] },
      { qId: 110, optionIdx: [0, 3, 0] },
      { qId: 111, optionIdx: [0, 3, 1] },
      { qId: 112, optionIdx: [0, 3, 0] },
      { qId: 113, optionIdx: [0, 0, 0] },
      { qId: 114, optionIdx: [0, 3, 0] },
      { qId: 115, optionIdx: [0, 3, 1] },
      { qId: 116, optionIdx: [0, 3, 0] },
      { qId: 117, optionIdx: [0, 3, 1] },
      { qId: 118, optionIdx: [0, 4, 0] },
      { qId: 119, optionIdx: [0, 0, 0] },
      { qId: 120, optionIdx: [0, 3, 0] }
    ]
  },
  {
    timestamp: '응답 12',
    answers: [
      { qId: 100, optionIdx: [0, 3, 1] },
      { qId: 101, optionIdx: [0, 3, 1] },
      { qId: 102, optionIdx: [0, 3, 1] },
      { qId: 103, optionIdx: [0, 3, 0] },
      { qId: 104, optionIdx: [0, 3, 1] },
      { qId: 105, optionIdx: [0, 4, 1] },
      { qId: 106, optionIdx: [0, 3, 0] },
      { qId: 107, optionIdx: [0, 3, 1] },
      { qId: 108, optionIdx: [0, 3, 1] },
      { qId: 109, optionIdx: [0, 3, 0] },
      { qId: 110, optionIdx: [0, 4, 1] },
      { qId: 111, optionIdx: [0, 3, 0] },
      { qId: 112, optionIdx: [0, 3, 1] },
      { qId: 113, optionIdx: [0, 3, 1] },
      { qId: 114, optionIdx: [0, 3, 0] },
      { qId: 115, optionIdx: [0, 3, 0] },
      { qId: 116, optionIdx: [0, 3, 0] },
      { qId: 117, optionIdx: [0, 3, 0] },
      { qId: 118, optionIdx: [0, 3, 1] },
      { qId: 119, optionIdx: [0, 3, 1] },
      { qId: 120, optionIdx: [0, 3, 0] }
    ]
  },
  {
    timestamp: '응답 13',
    answers: [
      { qId: 100, optionIdx: [0, 3, 0] },
      { qId: 101, optionIdx: [0, 3, 1] },
      { qId: 102, optionIdx: [1, 3, 0] },
      { qId: 103, optionIdx: [1, 4, 1] },
      { qId: 104, optionIdx: [0, 3, 2] },
      { qId: 105, optionIdx: [0, 3, 2] },
      { qId: 106, optionIdx: [0, 3, 0] },
      { qId: 107, optionIdx: [0, 3, 0] },
      { qId: 108, optionIdx: [0, 3, 2] },
      { qId: 109, optionIdx: [0, 3, 2] },
      { qId: 110, optionIdx: [0, 3, 2] },
      { qId: 111, optionIdx: [0, 2, 2] },
      { qId: 112, optionIdx: [0, 3, 2] },
      { qId: 113, optionIdx: [0, 3, 0] },
      { qId: 114, optionIdx: [0, 3, 1] },
      { qId: 115, optionIdx: [0, 3, 2] },
      { qId: 116, optionIdx: [0, 2, 2] },
      { qId: 117, optionIdx: [0, 3, 0] },
      { qId: 118, optionIdx: [0, 0, 2] },
      { qId: 119, optionIdx: [0, 3, 0] },
      { qId: 120, optionIdx: [0, 3, 0] }
    ]
  },
  {
    timestamp: '응답 14',
    answers: [
      { qId: 100, optionIdx: [0, 3, 0] },
      { qId: 101, optionIdx: [0, 3, 0] },
      { qId: 102, optionIdx: [0, 3, 1] },
      { qId: 103, optionIdx: [0, 0, 1] },
      { qId: 104, optionIdx: [0, 3, 0] },
      { qId: 105, optionIdx: [0, 3, 0] },
      { qId: 106, optionIdx: [0, 3, 0] },
      { qId: 107, optionIdx: [0, 3, 0] },
      { qId: 108, optionIdx: [0, 3, 0] },
      { qId: 109, optionIdx: [0, 3, 0] },
      { qId: 110, optionIdx: [0, 0, 1] },
      { qId: 111, optionIdx: [0, 3, 1] },
      { qId: 112, optionIdx: [0, 3, 0] },
      { qId: 113, optionIdx: [0, 3, 1] },
      { qId: 114, optionIdx: [0, 3, 0] },
      { qId: 115, optionIdx: [0, 3, 0] },
      { qId: 116, optionIdx: [0, 3, 1] },
      { qId: 117, optionIdx: [0, 0, 2] },
      { qId: 118, optionIdx: [0, 0, 0] },
      { qId: 119, optionIdx: [0, 3, 1] },
      { qId: 120, optionIdx: [0, 3, 0] }
    ]
  }
]

export default As
