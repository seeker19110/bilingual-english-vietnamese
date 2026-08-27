// Hướng DEVOPS/SRE — làm cho phần mềm chạy được và chạy tiếp, không chỉ chạy trên máy mình.
import type { ProgrammingSpecialization } from './types.js'

export const DEVOPS_SPECIALIZATION: ProgrammingSpecialization = {
  id: 'devops',
  name: 'DevOps, Cloud & SRE',
  tagline: 'Hạ tầng như mã nguồn: phát hành mỗi ngày mà vẫn ngủ ngon ban đêm.',
  forWho:
    'Hợp với người thích tự động hoá và điều tra sự cố. Cần chịu được áp lực khi hệ thống đang sập và mọi người đang chờ bạn.',
  prerequisite: 'p4',
  duration: '9–14 tháng',
  languages: ['Bash', 'Python hoặc Go', 'YAML/HCL'],
  coreTools: ['Linux', 'Docker', 'Kubernetes', 'Terraform', 'Prometheus/Grafana', 'GitHub Actions'],
  stages: [
    {
      id: 'devops-s1',
      tier: 's1',
      name: 'Linux, mạng và tự động hoá cơ bản',
      canDo: 'Vận hành một máy chủ Linux, chẩn đoán sự cố cơ bản, viết script tự động hoá.',
      duration: '6–8 tuần',
      modules: [
        {
          id: 'devops-s1-m1',
          title: 'Linux thực chiến',
          topics: [
            'Tiến trình, dịch vụ systemd, nhật ký journald',
            'Quyền, người dùng, SSH khoá công khai',
            'Chẩn đoán: CPU, RAM, đĩa, mô tả tệp cạn kiệt',
          ],
        },
        {
          id: 'devops-s1-m2',
          title: 'Mạng đủ dùng',
          topics: [
            'DNS, TLS, cổng, tường lửa',
            'Reverse proxy (Nginx), cân bằng tải cơ bản',
            'Công cụ: dig, curl -v, ss, tcpdump mức đọc được',
          ],
        },
        {
          id: 'devops-s1-m3',
          title: 'Script và Git',
          topics: [
            'Bash an toàn: set -euo pipefail, xử lý lỗi',
            'Chiến lược nhánh, review, quy ước commit',
            'Bí mật không bao giờ vào repo',
          ],
        },
        {
          id: 'devops-s1-m4',
          title: 'Sao lưu và khôi phục',
          topics: [
            'Quy tắc 3-2-1, sao lưu ngoài máy chủ',
            'Diễn tập khôi phục — bản sao chưa thử khôi phục là không tồn tại',
            'RPO/RTO nói bằng số',
          ],
        },
      ],
      project: {
        name: 'Máy chủ sản xuất dựng bằng script',
        brief: 'Từ VPS trắng tới ứng dụng chạy có HTTPS, chỉ bằng script chạy lại được.',
        requirements: [
          'Dựng lại toàn bộ từ máy trắng trong < 30 phút, không thao tác tay',
          'Sao lưu tự động hằng ngày và một lần khôi phục thật có bấm giờ',
          'Không có bí mật nào nằm trong repo',
        ],
      },
    },
    {
      id: 'devops-s2',
      tier: 's2',
      name: 'Container và CI/CD',
      canDo: 'Đóng gói ứng dụng, xây pipeline tự động build–test–deploy có rollback.',
      duration: '8–10 tuần',
      modules: [
        {
          id: 'devops-s2-m1',
          title: 'Container tới nơi tới chốn',
          topics: [
            'Namespace, cgroup — container thật ra là gì',
            'Ảnh nhiều tầng, cache build, ảnh gốc tối thiểu',
            'Quét lỗ hổng ảnh, không chạy bằng root',
          ],
        },
        {
          id: 'devops-s2-m2',
          title: 'Pipeline CI/CD',
          topics: [
            'Cổng chất lượng: lint, test, build, quét bảo mật',
            'Tạo tác có phiên bản, phát hành tái lập được',
            'Deploy xanh–lam / theo tỷ lệ và rollback nhanh',
          ],
        },
        {
          id: 'devops-s2-m3',
          title: 'Hạ tầng như mã nguồn',
          topics: [
            'Terraform: state, plan/apply, module',
            'Ansible hoặc cloud-init cho cấu hình máy',
            'Xem xét thay đổi hạ tầng như xem xét code',
          ],
        },
        {
          id: 'devops-s2-m4',
          title: 'Nền tảng đám mây',
          topics: [
            'Máy ảo, lưu trữ đối tượng, CSDL quản lý sẵn',
            'Mạng ảo, nhóm bảo mật, IAM đặc quyền tối thiểu',
            'Chi phí: cái gì đắt và vì sao',
          ],
        },
      ],
      project: {
        name: 'Pipeline phát hành đầy đủ',
        brief: 'Từ commit tới sản xuất tự động, hạ tầng khai báo bằng Terraform.',
        requirements: [
          'Merge là tự deploy, không ai bấm nút',
          'Rollback về bản trước trong < 5 phút, có diễn tập',
          'Toàn bộ hạ tầng dựng lại được từ mã nguồn ở vùng khác',
        ],
      },
    },
    {
      id: 'devops-s3',
      tier: 's3',
      name: 'Kubernetes và quan sát',
      canDo: 'Vận hành cụm container, thiết lập giám sát và cảnh báo có ích.',
      duration: '10–12 tuần',
      modules: [
        {
          id: 'devops-s3-m1',
          title: 'Kubernetes nền tảng',
          topics: [
            'Pod, Deployment, Service, Ingress',
            'Giới hạn tài nguyên, thăm dò sống/sẵn sàng',
            'Tự mở rộng theo tải, gián đoạn có kiểm soát',
          ],
        },
        {
          id: 'devops-s3-m2',
          title: 'Cấu hình và bí mật',
          topics: [
            'ConfigMap, Secret, quản lý bí mật ngoài cụm',
            'Helm hoặc Kustomize, môi trường nhiều tầng',
            'GitOps: trạng thái mong muốn nằm trong Git',
          ],
        },
        {
          id: 'devops-s3-m3',
          title: 'Quan sát',
          topics: [
            'Metric với Prometheus, biểu đồ với Grafana',
            'Log tập trung, trace phân tán',
            'Cảnh báo theo triệu chứng người dùng, chống cảnh báo nhiễu',
          ],
        },
        {
          id: 'devops-s3-m4',
          title: 'Độ tin cậy',
          topics: [
            'SLI/SLO/error budget và cách dùng để quyết định',
            'Chaos engineering có kiểm soát',
            'Quy trình trực và sổ tay xử lý sự cố',
          ],
        },
      ],
      project: {
        name: 'Cụm K8s có giám sát đầy đủ',
        brief: 'Đưa hệ thống nhiều dịch vụ lên Kubernetes theo mô hình GitOps.',
        requirements: [
          'Mọi thay đổi cụm đi qua Git, không kubectl tay lên sản xuất',
          '≥ 5 cảnh báo có ý nghĩa, mỗi cảnh báo có sổ tay xử lý',
          'Một bài chaos: giết node, hệ thống tự phục hồi',
        ],
      },
    },
    {
      id: 'devops-s4',
      tier: 's4',
      name: 'Chuyên gia — kỹ thuật nền tảng',
      canDo:
        'Xây nền tảng nội bộ cho các đội khác tự phát hành an toàn; chịu trách nhiệm độ tin cậy toàn hệ.',
      duration: '12–16 tuần',
      modules: [
        {
          id: 'devops-s4-m1',
          title: 'Nền tảng cho lập trình viên',
          topics: [
            'Lối đi lát sẵn (golden path), khuôn mẫu dịch vụ',
            'Cổng tự phục vụ, giảm thời gian từ ý tưởng tới sản xuất',
            'Đo trải nghiệm lập trình viên (DORA metrics)',
          ],
        },
        {
          id: 'devops-s4-m2',
          title: 'Bảo mật chuỗi cung ứng',
          topics: [
            'SBOM, ký tạo tác, xuất xứ build',
            'Quản lý bí mật tập trung, xoay vòng tự động',
            'Chính sách như mã nguồn (OPA)',
          ],
        },
        {
          id: 'devops-s4-m3',
          title: 'Quy mô và chi phí',
          topics: [
            'Đa cụm, đa vùng, chuyển vùng khi sự cố',
            'FinOps: quy trách nhiệm chi phí về từng đội',
            'Đánh đổi giữa dùng dịch vụ quản lý sẵn và tự vận hành',
          ],
        },
        {
          id: 'devops-s4-m4',
          title: 'Văn hoá vận hành',
          topics: [
            'Post-mortem không đổ lỗi và theo dõi hành động sửa',
            'Giảm việc thủ công lặp lại (toil) có kế hoạch',
            'Chuẩn bị cho sự kiện tải cao đã biết trước',
          ],
        },
      ],
      project: {
        name: 'Nền tảng nội bộ dùng chung',
        brief: 'Bộ khuôn mẫu + tự động hoá để một đội mới lên sản xuất trong một ngày.',
        requirements: [
          'Dịch vụ mới từ khuôn mẫu tới sản xuất < 1 ngày, có bằng chứng',
          'Tạo tác được ký và có SBOM',
          'Báo cáo DORA metrics trước–sau',
        ],
      },
    },
  ],
  capstone: {
    name: 'Hệ thống sản xuất bạn chịu trách nhiệm vận hành',
    brief: 'Vận hành thật, có SLO, có trực sự cố, có hồ sơ sự cố và cải tiến.',
    requirements: [
      'Đạt SLO công bố ≥ 3 tháng',
      'Ít nhất một sự cố thật có post-mortem và hành động đã hoàn thành',
      'Khôi phục thảm hoạ diễn tập thành công có bấm giờ',
      'Toàn bộ hạ tầng khai báo bằng mã, dựng lại được ở vùng khác',
    ],
  },
  expertSignals: [
    'Tự động hoá việc mình phải làm lần thứ hai',
    'Cảnh báo trong hệ của bạn ít nhưng cái nào kêu cũng đáng dậy lúc 3 giờ sáng',
    'Chuẩn bị đường lui trước khi thay đổi, không phải sau khi hỏng',
    'Nói được chi phí một tính năng hạ tầng bằng tiền thật',
  ],
  careers: [
    'DevOps Engineer',
    'Site Reliability Engineer',
    'Cloud / Platform Engineer',
    'Infrastructure Security Engineer',
  ],
  pitfalls: [
    'Sửa tay lên sản xuất rồi quên ghi vào mã nguồn',
    'Cảnh báo quá nhiều tới mức không ai đọc nữa',
    'Dùng Kubernetes cho hệ thống một máy chủ là đủ',
    'Có sao lưu nhưng chưa bao giờ thử khôi phục',
  ],
  resources: [
    'Google SRE Book & SRE Workbook',
    'The Phoenix Project / Accelerate (DORA)',
    'Kubernetes Up & Running',
    'Tài liệu chính thức Terraform và Prometheus',
  ],
}
