import type { Meta, StoryObj } from '@storybook/react-vite'
import GmPregnancyCard, {
  type GmPregnancyMilestone,
  type GmPregnancyTask,
} from '../goodmom-ui/src/components/GmPregnancyCard'

const TASKS: GmPregnancyTask[] = [
  { key: 't1', label: '记录今日胎动' },
  { key: 't2', label: '补交糖耐报告' },
  { key: 't3', label: '预约下次产检' },
]

const MILESTONES: GmPregnancyMilestone[] = [
  { key: 'm1', label: 'NT', done: true },
  { key: 'm2', label: '大排畸', done: true },
  { key: 'm3', label: '糖耐', done: true },
  { key: 'm4', label: '产前评估', done: false },
]

const meta = {
  component: GmPregnancyCard,
  tags: ['ai-generated'],
  globals: { viewport: { value: 'mobile375' } },
  args: {
    week: 24,
    day: 2,
    dueDate: '2026-11-02',
    stage: 'middle',
    babyName: '豆豆',
    progress: -1,
    tasks: TASKS,
    milestones: MILESTONES,
    onTask: () => {},
  },
} satisfies Meta<typeof GmPregnancyCard>

export default meta
type Story = StoryObj<typeof meta>

/** 默认：大数字周数 + 阶段 chip + 预产期倒计时 + 任务（≤3）+ 进度带与节点。 */
export const Basic: Story = { args: {} }

/** 孕晚期：进度按 week/day 折算，阶段文案随 stage 切换。 */
export const LateStage: Story = {
  args: { week: 36, day: 4, stage: 'late', babyName: '豆豆', milestones: MILESTONES.slice(0, 3) },
}

/** 无预产期 / 无任务：倒计时与任务区都不渲染，只留进度与节点。 */
export const NoDueDate: Story = {
  args: { dueDate: '', tasks: [], babyName: '' },
}
