// PathArtifactVault — SSR: kiểm khung form + danh sách giai đoạn hiện đúng, và không render gì
// khi không có giai đoạn nào (đợt 3 chỉ cho nộp artifact ở giai đoạn ĐÃ có nội dung).
import { describe, it, expect } from 'vitest'
import { renderToStaticMarkup } from 'react-dom/server'
import PathArtifactVault from './PathArtifactVault'

describe('PathArtifactVault — SSR', () => {
  it('hiện tiêu đề + ô chọn giai đoạn khi có ít nhất một giai đoạn', () => {
    const html = renderToStaticMarkup(
      <PathArtifactVault
        pathId="principal-ai"
        phases={[
          { id: 'principal-ai-p1', name: 'Nền toán & thuật toán' },
          { id: 'principal-ai-p2', name: 'Dữ liệu & backend' },
        ]}
      />,
    )
    expect(html).toContain('Hồ sơ bằng chứng')
    // renderToStaticMarkup escape &, so chuỗi thô sẽ trượt oan.
    expect(html).toContain('Nền toán &amp; thuật toán')
    expect(html).toContain('Dữ liệu &amp; backend')
  })

  it('KHÔNG render gì khi không có giai đoạn nào (mọi giai đoạn đang soạn)', () => {
    const html = renderToStaticMarkup(<PathArtifactVault pathId="principal-ai" phases={[]} />)
    expect(html).toBe('')
  })
})
