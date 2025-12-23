<template>
  <div ref="chartContainer" class="ebbinghaus-chart"></div>
</template>

<script setup>
import { ref, onMounted, onBeforeUnmount } from "vue";
import * as echarts from "echarts";

const chartContainer = ref(null);
let chartInstance = null;

// 艾宾浩斯遗忘曲线数据点 (时间小时, 记忆保持率%)
const ebbinghausData = [
  [0, 100],
  [0.5, 50],
  [1, 45],
  [2, 40],
  [6, 35],
  [24, 30],
  [48, 25],
  [72, 22],
  [120, 20],
];

const initChart = () => {
  if (!chartContainer.value) return;

  chartInstance = echarts.init(chartContainer.value);

  const option = {
    tooltip: {
      trigger: "axis",
      formatter: function (params) {
        const point = params[0];
        return `学习后 ${point.name} 小时<br/>记忆保持率: ${point.value[1]}%`;
      },
    },
    xAxis: {
      type: "value",
      name: "时间（小时）",
      min: 0,
      max: 125,
      nameTextStyle: {
        color: "#000033",
        fontSize: 12,
      },
      axisLine: {
        lineStyle: {
          color: "#000033",
        },
      },
      axisLabel: {
        color: "#000033",
        fontSize: 10,
      },
      splitLine: {
        show: false,
      },
    },
    yAxis: {
      type: "value",
      name: "记忆保持率（%）",
      min: 15,
      max: 105,
      nameTextStyle: {
        color: "#000033",
        fontSize: 12,
      },
      axisLine: {
        lineStyle: {
          color: "#000033",
        },
      },
      axisLabel: {
        color: "#000033",
        fontSize: 10,
        formatter: "{value}",
      },
      splitLine: {
        lineStyle: {
          type: "dashed",
          color: "rgba(0, 0, 51, 0.1)",
        },
      },
    },
    series: [
      {
        type: "line",
        data: ebbinghausData,
        smooth: true,
        showSymbol: false,
        lineStyle: {
          width: 4,
          color: "#000076",
        },
        emphasis: {
          focus: "series",
        },
        animationDuration: 3000,
        animationEasing: "quadraticInOut",
      },
    ],
    animationEasing: "quadraticInOut",
    backgroundColor: "transparent",
    grid: {
      left: "10%",
      right: "5%",
      top: "10%",
      bottom: "15%",
    },
  };

  chartInstance.setOption(option);
};

// 处理窗口大小变化
const handleResize = () => {
  if (chartInstance) {
    chartInstance.resize({
      animation: {
        duration: 300,
      },
    });
  }
};

onMounted(() => {
  initChart();

  // 监听窗口大小变化，重新调整图表大小
  window.addEventListener("resize", handleResize);
});

onBeforeUnmount(() => {
  window.removeEventListener("resize", handleResize);
  if (chartInstance) {
    chartInstance.dispose();
  }
});
</script>

<style scoped>
.ebbinghaus-chart {
  width: 100%;
  height: 100%;
  min-height: 300px;
}
</style>
