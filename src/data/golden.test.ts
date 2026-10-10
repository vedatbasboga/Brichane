// "Bağlantılar bozulmasın" testi: paylaşılan bağlantılar aynı elleri yeniden üretmeye dayanır.
// Bu test kırılırsa üretim yöntemi ya da bir varsayılan konu değişmiştir; eski bağlantılar
// artık farklı eller verir. Bilerek yapılan bir değişiklikse SHARE_VERSION artırılmalı
// (eski bağlantılar uyarı gösterir) ve buradaki beklenen değerler güncellenmelidir.

import { describe, expect, it } from 'vitest'
import { dealToPbn, generateDeals } from '../engine'
import { DEFAULT_TOPICS } from './topics'
import { SHARE_VERSION } from './shareLink'

const GOLDEN = [
  {
    topicId: '1nt-opening',
    seed: 'golden-1',
    deals: [
      [1, 'N', 'None', 'N:QJ.K972.AK9.KT94 9864.3.J65.AJ862 AT753.Q.QT72.Q73 K2.AJT8654.843.5'],
      [2, 'E', 'NS', 'N:J873.AJ74.KJ2.82 AK.QT3.AT83.QJ64 Q2.K952.Q9.AKT93 T9654.86.7654.75'],
      [3, 'S', 'EW', 'N:T987.A743.QT83.6 QJ54.QT2.J2.QT32 K6.KJ96.K654.AJ8 A32.85.A97.K9754'],
    ],
  },
  {
    topicId: 'takeout-double',
    seed: 'golden-2',
    deals: [
      [1, 'N', 'None', 'N:AKQT83.6..A98654 97654.AKJ5.A64.3 2.Q8743.KT52.KJT J.T92.QJ9873.Q72'],
      [2, 'E', 'NS', 'N:93.AJ4.T9762.QJT 8542.K7.AKQJ3.A6 AKQJ7.Q32.8.9874 T6.T9865.54.K532'],
      [3, 'S', 'EW', 'N:J732.Q643.AJ6.92 A98.KT52.T843.T4 54.A.KQ975.KJ876 KQT6.J987.2.AQ53'],
    ],
  },
  {
    topicId: 'slam',
    seed: 'golden-3',
    deals: [
      [1, 'N', 'None', 'N:9.KJT4.Q864.QJ54 2.Q97653.KJ9.T86 AKQJ.A2.AT7.AK93 T876543.8.532.72'],
      [2, 'E', 'NS', 'N:7.QJT753.T754.32 J83.AK8.6.KQJ875 T654.64.KJ2.T964 AKQ92.92.AQ983.A'],
      [3, 'S', 'EW', 'N:QT.Q.AKT4.AQT432 976543.K984.J.76 AK2.AJT7.Q7632.K J8.6532.985.J985'],
    ],
  },
]

describe(`share links stay stable (SHARE_VERSION ${SHARE_VERSION})`, () => {
  it.each(GOLDEN)('$topicId / $seed', ({ topicId, seed, deals }) => {
    const recipe = DEFAULT_TOPICS.find((t) => t.id === topicId)!
    const result = generateDeals({ recipe, count: deals.length, seed })
    expect(result.deals.map((d) => [d.board, d.dealer, d.vul, dealToPbn(d.hands)])).toEqual(deals)
  })
})
