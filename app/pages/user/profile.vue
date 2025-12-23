<template>
  <div class="profile-container">
    <div class="profile-header">
      <div class="avatar-placeholder">
        <svg
          xmlns="http://www.w3.org/2000/svg"
          width="80"
          height="80"
          viewBox="0 0 24 24"
          fill="none"
          stroke="#000033"
          stroke-width="1"
          stroke-linecap="round"
          stroke-linejoin="round"
        >
          <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path>
          <circle cx="12" cy="7" r="4"></circle>
        </svg>
      </div>
      <h1 class="username">{{ loginUserStore.loginUser.userName }}</h1>
      <p class="bio">这个人很懒，还没有添加个人简介</p>
    </div>

    <div class="profile-section">
      <h2>学习记录</h2>
      <div ref="chartContainer" class="chart-placeholder"></div>
    </div>

    <div class="profile-section">
      <h2>单词本</h2>
      <div class="wordbook-placeholder">
        <p>单词本内容占位符</p>
      </div>
    </div>
  </div>
</template>

<script setup>
import { useLoginUserStore } from "~/stores/userLoginUserStore";
import * as echarts from "echarts";
import { onMounted, ref } from "vue";

definePageMeta({
  middleware: 'auth'
});

const loginUserStore = useLoginUserStore();
const chartContainer = ref(null);
let chart = null;

// 生成学习记录热力图数据
const getData = () => {
  const data = [];
  for (let i = 0; i < 7; i++) {
    for (let j = 0; j < 12; j++) {
      data.push([i, j, Math.floor(Math.random() * 10)]);
    }
  }
  return data;
};

// 图表配置
const chartOption = {
  tooltip: {
    position: "top",
  },
  grid: {
    height: "50%",
    top: "10%",
  },
  xAxis: {
    type: "category",
    data: ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"],
    splitArea: {
      show: true,
    },
  },
  yAxis: {
    type: "category",
    data: ["0", "2", "4", "6", "8", "10", "12", "14", "16", "18", "20", "22"],
    splitArea: {
      show: true,
    },
  },
  visualMap: {
    min: 0,
    max: 10,
    calculable: true,
    orient: "horizontal",
    left: "center",
    bottom: "15%",
  },
  series: [
    {
      name: "学习时长",
      type: "heatmap",
      data: getData(),
      label: {
        show: true,
      },
      emphasis: {
        itemStyle: {
          shadowBlur: 10,
          shadowColor: "rgba(0, 0, 0, 0.5)",
        },
      },
    },
  ],
};

onMounted(() => {
  if (chartContainer.value) {
    chart = echarts.init(chartContainer.value);
    chart.setOption(chartOption);
  }
});
</script>

<style scoped>
.profile-container {
  max-width: 800px;
  margin: 0 auto;
  padding: 2rem;
  min-height: 100vh;
  background-color: #fff;
}

.profile-header {
  text-align: center;
  margin-bottom: 3rem;
  padding-bottom: 2rem;
  border-bottom: 1px solid #eee;
}

.avatar-placeholder {
  margin: 0 auto 1rem;
  width: 80px;
  height: 80px;
  border-radius: 50%;
  background-color: #f5f5f5;
  display: flex;
  align-items: center;
  justify-content: center;
}

.username {
  font-size: 2rem;
  font-weight: 600;
  color: #000033;
  margin-bottom: 0.5rem;
}

.bio {
  color: #666;
  font-size: 1rem;
}

.profile-section {
  margin-bottom: 3rem;
}

.profile-section h2 {
  font-size: 1.5rem;
  color: #000033;
  margin-bottom: 1.5rem;
  font-weight: 600;
}

.chart-placeholder {
  height: 300px;
  background-color: #f9f9f9;
  border-radius: 8px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.chart {
  width: 100%;
  height: 100%;
}

.wordbook-placeholder {
  height: 200px;
  background-color: #f9f9f9;
  border-radius: 8px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #666;
}
</style>
