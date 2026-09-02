<!-- 模板中心 - 卡片：统计 / 进度 / 图表 / 数据列表 / 图片卡片 -->
<template>
  <div class="template-cards-page">
    <PageHeader
      title="卡片"
      subtitle="统计、进度、图表、列表与图片卡片示例"
      icon="template"
    />

    <h1 class="page-title">统计卡片（文字）</h1>
    <ElRow :gutter="20">
      <ElCol
        v-for="card in statsCards"
        :key="card.id"
        :xs="24"
        :sm="12"
        :md="6"
        class="page-col"
      >
        <StatsCard
          :icon="card.icon"
          :title="card.title"
          :description="card.description"
          :color="card.color"
        />
      </ElCol>
    </ElRow>

    <h1 class="page-title">统计卡片（数字滚动）</h1>
    <ElRow :gutter="20">
      <ElCol
        v-for="card in statsCards"
        :key="card.id"
        :xs="24"
        :sm="12"
        :md="6"
        class="page-col"
      >
        <StatsCard
          :icon="card.icon"
          :count="card.count"
          :description="card.description"
          :color="card.color"
          :decimals="0"
          separator=","
        />
      </ElCol>
    </ElRow>

    <h1 class="page-title">统计卡片（自定义样式）</h1>
    <ElRow :gutter="20">
      <ElCol
        v-for="card in statsCards"
        :key="card.id"
        :xs="24"
        :sm="12"
        :md="6"
        class="page-col"
      >
        <StatsCard
          :icon="card.icon"
          :title="card.title"
          :description="card.description"
          :color="card.color"
          plain-icon
        />
      </ElCol>
    </ElRow>

    <h1 class="page-title">进度卡片</h1>
    <ElRow :gutter="20">
      <ElCol
        v-for="card in progressCards"
        :key="card.id"
        :xs="24"
        :sm="12"
        :md="6"
        class="page-col"
      >
        <ProgressCard
          :percentage="card.percentage"
          :title="card.title"
          :color="card.color"
        />
      </ElCol>
    </ElRow>

    <h1 class="page-title">进度卡片（icon）</h1>
    <ElRow :gutter="20">
      <ElCol
        v-for="card in progressCards"
        :key="card.id"
        :xs="24"
        :sm="12"
        :md="6"
        class="page-col"
      >
        <ProgressCard
          :percentage="card.percentage"
          :title="card.title"
          :color="card.color"
          :icon="card.icon"
        />
      </ElCol>
    </ElRow>

    <h1 class="page-title">图表卡片（小图表）</h1>
    <ElRow :gutter="20">
      <ElCol :xs="24" :sm="12" :md="6" class="page-col">
        <LineChartCard
          :is-mini-chart="true"
          :value="2545"
          label="新用户"
          date="过去7天"
          :percentage="1.2"
          :height="9.5"
          :chart-data="[120, 132, 101, 134, 90, 230, 210]"
        />
      </ElCol>
      <ElCol :xs="24" :sm="12" :md="6" class="page-col">
        <BarChartCard
          :is-mini-chart="true"
          :value="15480"
          label="浏览量"
          date="过去 14 天"
          :percentage="-4.15"
          :height="9.5"
          bar-width="45%"
          :chart-data="[120, 100, 150, 140, 90, 120, 130]"
        />
      </ElCol>
      <ElCol :xs="24" :sm="12" :md="6" class="page-col">
        <LineChartCard
          :is-mini-chart="true"
          :value="2545"
          label="粉丝数"
          date="过去 30 天"
          :percentage="1.2"
          :height="9.5"
          :show-area-color="true"
          :chart-data="[150, 180, 160, 200, 180, 220, 240]"
        />
      </ElCol>
      <ElCol :xs="24" :sm="12" :md="6" class="page-col">
        <DonutChartCard
          :value="36358"
          title="粉丝量"
          :percentage="18"
          percentage-label="较去年"
          :data="[50, 40]"
          :height="9.5"
          current-value="2022"
          previous-value="2021"
          :radius="['50%', '70%']"
        />
      </ElCol>
    </ElRow>

    <h1 class="page-title">图表卡片（大图表）</h1>
    <ElRow :gutter="20">
      <ElCol :xs="24" :sm="12" :md="6" class="page-col">
        <LineChartCard
          :value="2545"
          label="新用户"
          :percentage="1.2"
          :height="11"
          :chart-data="[120, 132, 101, 134, 90, 230, 210]"
        />
      </ElCol>
      <ElCol :xs="24" :sm="12" :md="6" class="page-col">
        <BarChartCard
          :value="15480"
          label="浏览量"
          :percentage="-4.15"
          :height="11"
          :chart-data="[120, 100, 150, 140, 90, 120, 130, 110]"
        />
      </ElCol>
      <ElCol :xs="24" :sm="12" :md="6" class="page-col">
        <LineChartCard
          :value="2545"
          label="粉丝数"
          :percentage="1.2"
          :height="11"
          :show-area-color="true"
          :chart-data="[150, 180, 160, 200, 180, 220, 240]"
        />
      </ElCol>
      <ElCol :xs="24" :sm="12" :md="6" class="page-col">
        <DonutChartCard
          :value="36358"
          title="粉丝量"
          :percentage="-18"
          percentage-label="较2021年"
          :data="[70, 30]"
          :height="11"
          current-value="12月"
          previous-value="11月"
        />
      </ElCol>
    </ElRow>

    <h1 class="page-title">数据列表卡片</h1>
    <ElRow :gutter="20">
      <ElCol :xs="24" :sm="12" :lg="8" class="page-col">
        <DataListCard
          :list="dataList"
          title="待办事项"
          subtitle="今日待处理任务"
        />
      </ElCol>
      <ElCol :xs="24" :sm="12" :lg="8" class="page-col">
        <DataListCard
          :max-count="4"
          :list="dataList"
          title="最近活动"
          subtitle="近期活动列表"
          :show-more-button="true"
          @more="handleMore"
        />
      </ElCol>
      <ElCol :xs="24" :sm="12" :lg="8" class="page-col">
        <TimelineListCard
          :list="timelineData"
          title="最近交易"
          subtitle="2024年12月20日"
        />
      </ElCol>
    </ElRow>

    <h1 class="page-title">图片卡片</h1>
    <ElRow :gutter="20">
      <ElCol
        v-for="card in imageCards"
        :key="card.id"
        :xs="24"
        :sm="12"
        :md="6"
        class="page-col"
      >
        <ImageCard
          :image-url="card.imageUrl"
          :title="card.title"
          :category="card.category"
          :read-time="card.readTime"
          :views="card.views"
          :comments="card.comments"
          :date="card.date"
          @click="handleImageCardClick(card)"
        />
      </ElCol>
    </ElRow>
  </div>
</template>

<script setup>
import cover1 from '@/assets/images/cover/img1.webp'
import cover2 from '@/assets/images/cover/img2.webp'
import cover3 from '@/assets/images/cover/img3.webp'
import cover4 from '@/assets/images/cover/img4.webp'

defineOptions({ name: 'template-cards' })

/**
 * 统计卡片数据配置
 */
const statsCards = [
  {
    id: 1,
    title: '销售产品',
    count: 1235,
    description: '鞋子、牛仔裤、派对服装、手表',
    icon: 'TrendCharts',
    color: 'var(--color-info)'
  },
  {
    id: 2,
    title: '活跃用户',
    count: 5000,
    description: '日活跃用户超过5,000+',
    icon: 'User',
    color: 'var(--color-warning)'
  },
  {
    id: 3,
    title: '总收入',
    count: 35000,
    description: '月收入超过¥350,000+',
    icon: 'Money',
    color: 'var(--color-violet)'
  },
  {
    id: 4,
    title: '客户评价',
    count: 4800,
    description: '平均评分4.8/5',
    icon: 'ChatDotRound',
    color: 'var(--color-danger)'
  }
]

/**
 * 进度卡片数据配置
 */
const progressCards = [
  {
    id: 1,
    title: '完成进度',
    percentage: 75,
    color: 'var(--color-success)',
    icon: 'CircleCheck'
  },
  {
    id: 2,
    title: '项目进度',
    percentage: 65,
    color: 'var(--color-primary)',
    icon: 'VideoPlay'
  },
  {
    id: 3,
    title: '学习进度',
    percentage: 45,
    color: 'var(--color-danger)',
    icon: 'Reading'
  },
  {
    id: 4,
    title: '任务进度',
    percentage: 90,
    color: 'var(--color-violet)',
    icon: 'Flag'
  }
]

/**
 * 图片卡片数据配置
 */
const imageCards = [
  {
    id: 1,
    imageUrl: cover1,
    title: 'AI技术在医疗领域的创新应用与发展前景',
    category: '社交',
    readTime: '2分钟',
    views: 9125,
    comments: 3,
    date: '12月19日 周一'
  },
  {
    id: 2,
    imageUrl: cover2,
    title: '大数据分析助力企业决策的实践案例',
    category: '技术',
    readTime: '3分钟',
    views: 7234,
    comments: 5,
    date: '12月20日 周二'
  },
  {
    id: 3,
    imageUrl: cover3,
    title: '区块链技术在供应链管理中的应用',
    category: '科技',
    readTime: '4分钟',
    views: 5678,
    comments: 8,
    date: '12月21日 周三'
  },
  {
    id: 4,
    imageUrl: cover4,
    title: '云计算技术发展趋势与未来展望',
    category: '云技术',
    readTime: '5分钟',
    views: 4321,
    comments: 6,
    date: '12月22日 周四'
  }
]

/**
 * 数据列表卡片数据配置
 */
const dataList = [
  {
    title: '新加坡之行',
    status: '进行中',
    time: '5分钟',
    tone: 'primary',
    icon: 'Camera'
  },
  {
    title: '归档数据',
    status: '进行中',
    time: '10分钟',
    tone: 'secondary',
    icon: 'TrendCharts'
  },
  {
    title: '客户会议',
    status: '待处理',
    time: '15分钟',
    tone: 'warning',
    icon: 'User'
  },
  {
    title: '筛选任务团队',
    status: '进行中',
    time: '20分钟',
    tone: 'danger',
    icon: 'Avatar'
  },
  {
    title: '发送信封给小王',
    status: '已完成',
    time: '20分钟',
    tone: 'success',
    icon: 'ChatDotRound'
  }
]

/**
 * 时间轴卡片数据配置
 */
const timelineData = [
  {
    time: '上午 09:30',
    status: 'rgb(73, 190, 255)',
    content: '收到 John Doe 支付的 385.90 美元'
  },
  {
    time: '上午 10:00',
    status: 'rgb(54, 158, 255)',
    content: '新销售记录',
    code: 'ML-3467'
  },
  {
    time: '上午 12:00',
    status: 'rgb(103, 232, 207)',
    content: '向 Michael 支付了 64.95 美元'
  },
  {
    time: '下午 14:30',
    status: 'rgb(255, 193, 7)',
    content: '系统维护通知',
    code: 'MT-2023'
  },
  {
    time: '下午 15:45',
    status: 'rgb(255, 105, 105)',
    content: '紧急订单取消提醒',
    code: 'OR-9876'
  },
  {
    time: '下午 17:00',
    status: 'rgb(103, 232, 207)',
    content: '完成每日销售报表'
  }
]

/**
 * 处理查看更多按钮点击
 */
const handleMore = () => {
  ElMessage.info('查看更多')
}

/**
 * 处理图片卡片点击事件
 * @param {object} card 卡片数据
 */
const handleImageCardClick = (card) => {
  console.log('点击卡片:', card)
}
</script>

<style lang="scss" scoped>
.template-cards-page {
  display: flex;
  flex-direction: column;
  gap: 16px;
  padding: 4px;
}

.page-title {
  margin: 20px 0;
  font-size: 20px;
  font-weight: 500;
  color: var(--color-text-primary);

  &:first-of-type {
    margin-top: 8px;
  }
}

.page-col {
  margin-bottom: 20px;
}
</style>
