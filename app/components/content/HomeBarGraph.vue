<template>
  <div
    class="text-center px-8 py-8 elevation-2"
    style="background: #fff; border: 1px solid #eee"
  >
    <h2 style="border: none; font-size: 18px">
      Domestic and Sexual Violence Victims Who Received Services in Illinois,
      2018-2024
    </h2>
    <h3 style="border: none; font-size: 12px">Source: InfoNet System</h3>
    <div style="min-height: 25vh" class="pt-3 pb-10" role="img" aria-label="Bar chart showing domestic and sexual violence victims who received services in Illinois from 2018 to 2024">
      <Bar
        :data="chartData"
        :options="chartOptions"
        aria-hidden="true"
      />
    </div>
    <!-- Screen reader accessible data table (visually hidden) -->
    <table class="sr-only-table">
      <caption>Domestic and Sexual Violence Victims Who Received Services, 2018-2024</caption>
      <thead>
        <tr>
          <th scope="col">Year</th>
          <th scope="col">Victims who received services</th>
        </tr>
      </thead>
      <tbody>
        <tr><td>2018</td><td>70,133</td></tr>
        <tr><td>2019</td><td>72,905</td></tr>
        <tr><td>2020</td><td>60,717</td></tr>
        <tr><td>2021</td><td>61,857</td></tr>
        <tr><td>2022</td><td>61,259</td></tr>
        <tr><td>2023</td><td>63,211</td></tr>
        <tr><td>2024</td><td>63,557</td></tr>
      </tbody>
    </table>
    <div class="text-center">
      <v-btn
        size="small"
        variant="text"
        to="/about"
        style="font-weight: 700; color: #000 !important"
        ><span style="color: #000 !important"
          >More about InfoNet&nbsp;&raquo;</span
        ></v-btn
      >
    </div>
  </div>
</template>
<script setup>
import { Bar } from "vue-chartjs";
import {
  Chart as ChartJS,
  Title,
  Tooltip,
  BarElement,
  CategoryScale,
  LinearScale,
} from "chart.js";
import { ref } from "vue";
ChartJS.register(
  Title,
  Tooltip,

  BarElement,
  CategoryScale,
  LinearScale
);

const chartData = ref({
  labels: ["2018", "2019", "2020", "2021", "2022", "2023", "2024"],
  layout: {
    padding: 20,
  },
  datasets: [
    {
      label: "Victims who received services",
      backgroundColor: "#0D4471",
      data: [70133, 72905, 60717, 61857, 61259, 63211, 63557],
    },
  ],
});
const chartOptions = ref({
  responsive: true,

  maintainAspectRatio: false,
  plugins: {
    legend: {
      display: false,
    },
  },
});
</script>
