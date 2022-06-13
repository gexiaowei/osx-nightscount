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
import { ipcRenderer } from 'electron'
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
  data = []

  get option () {
    const { data } = this
    if (data.length) {
      return {
        tooltip: {},
        xAxis: {
          scale: true,
          axisLabel: {
            formatter: (value) => {
              return moment(value).format('HH:mm')
            }
          }
        },
        yAxis: {
          scale: true
        },
        series: [
          {
            symbolSize: 10,
            data: data.map(item => [item.date, (item.sgv * 0.0555).toFixed(1)]),
            type: 'scatter'
          }
        ]
      }
    } else {
      return null
    }
  }

  mounted () {
    this.initChartData()
    this.loop()
  }

  async initChartData () {
    const { data } = await getEntries({
      'find[date][$gte]': moment().startOf('day').format('x'),
      'find[date][$lte]': moment().endOf('day').format('x'),
      count: 999
    })
    this.data = data
    ipcRenderer.send('receive-entry', data[0])
  }

  async getAppendChartData () {
    if (this.data.length) {
      const { data } = await getEntries({
        'find[date][$gt]': this.data[0].date
      })
      if (data.length) {
        this.data = [...data, ...this.data]
        ipcRenderer.send('receive-entry', data[0])
      }
    }
  }

  async loop () {
    setInterval(() => {
      this.getAppendChartData()
    }, 60 * 1000)
  }
}
</script>

<style lang="scss" scoped>
.chart {
  height: 100vh;
}
</style>
