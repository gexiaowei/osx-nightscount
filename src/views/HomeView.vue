<template>
  <div>
    <div>
      <div>4分钟前</div>
      <div>-0.1 mmol/L</div>
    </div>
    <div>
      6.3
    </div>
    <div v-if="option">
      <v-chart class="chart" :option="option"/>
    </div>
    <div>
      <div>
        <div>Low</div>
        <div>0%</div>
      </div>
      <div>
        <div>In Range</div>
        <div>100%</div>
      </div>
      <div>
        <div>High</div>
        <div>0%</div>
      </div>
    </div>
    <div>
      <div>100%</div>
    </div>
  </div>
</template>

<script>
import { use } from 'echarts/core'
import { CanvasRenderer } from 'echarts/renderers'
import { ScatterChart } from 'echarts/charts'
import moment from 'moment'
import {
  TitleComponent,
  TooltipComponent,
  LegendComponent
} from 'echarts/components'
import VChart, { THEME_KEY } from 'vue-echarts'
import { Component, Vue } from 'vue-property-decorator'
import { getEntries } from '@/api/entries'

use([
  CanvasRenderer,
  ScatterChart,
  TitleComponent,
  TooltipComponent,
  LegendComponent
])

@Component({
  components: {
    VChart
  },
  provide: {
    [THEME_KEY]: 'dark'
  }
})
export default class Chart extends Vue {
  option = null

  mounted () {
    this.initChartData()
    this.loop()
  }

  async initChartData () {
    const { data } = await getEntries({
      'find[date][$gte]': moment('2022-06-11').format('x'),
      count: 999
    })
    this.renderChart()
    console.log(data)
  }

  async getAppendChartData () {
    const { data } = await getEntries({
      'find[date][$gt]': moment().format('x'),
      count: 10
    })
    console.log(data)
  }

  async loop () {
    setInterval(() => {
      this.getAppendChartData()
    }, 60 * 1000)
  }

  renderChart () {
    this.option = {
      xAxis: {},
      yAxis: {},
      series: [
        {
          symbolSize: 20,
          data: [
            [10.0, 8.04],
            [8.07, 6.95],
            [13.0, 7.58],
            [9.05, 8.81],
            [11.0, 8.33],
            [14.0, 7.66],
            [13.4, 6.81],
            [10.0, 6.33],
            [14.0, 8.96],
            [12.5, 6.82],
            [9.15, 7.2],
            [11.5, 7.2],
            [3.03, 4.23],
            [12.2, 7.83],
            [2.02, 4.47],
            [1.05, 3.33],
            [4.05, 4.96],
            [6.03, 7.24],
            [12.0, 6.26],
            [12.0, 8.84],
            [7.08, 5.82],
            [5.02, 5.68]
          ],
          type: 'scatter'
        }
      ]
    }
  }
}
</script>

<style lang="scss" scoped>
.chart {
  height: 100vh;
}
</style>
