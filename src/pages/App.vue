<template>
  <div class="d-flex flex-column page-container">
    <div class="d-flex align-items-center justify-content-between summary-container">
      <div class="summary text-center">
        <div class=" d-flex align-items-center">
          <div class="current">
            {{ current.sgv | format_unit(value.unit) }}
          </div>
          <div>
            <img
              v-if="['SingleUp','DoubleUp','TripleUp'].includes(current.direction)"
              class="arrow"
              src="@/assets/icons/arrow-up.svg"
              alt=""
            >
            <img
              v-else-if="['FortyFiveUp'].includes(current.direction)"
              class="arrow"
              src="@/assets/icons/arrow-up-right.svg"
              alt=""
            >
            <img
              v-else-if="['FortyFiveDown'].includes(current.direction)"
              class="arrow"
              src="@/assets/icons/arrow-down-right.svg"
              alt=""
            >
            <img
              v-else-if="['SingleDown','DoubleDown','TripleDown'].includes(current.direction)"
              class="arrow"
              src="@/assets/icons/arrow-down.svg"
              alt=""
            >
            <img
              v-else-if="['RATE OUT OF RANGE'].includes(current.direction)"
              class="arrow"
              src="@/assets/icons/arrows-from-line.svg"
              alt=""
            >
            <img
              v-else
              class="arrow"
              src="@/assets/icons/arrow-right.svg"
              alt=""
            >
          </div>
        </div>
        <div class="d-flex align-items-center justify-content-center">
          <div class="d-flex align-items-center pill">
            <div class="value d-flex align-items-center">
              <span v-if="current.offset>=0">+</span>
              {{ current.offset | format_unit(value.unit) }}
            </div>
            <div class="unit">
              {{ value.unit | get_unit_label }}
            </div>
          </div>
        </div>
      </div>
      <div>
        <div class="time">
          {{ +current.date | moment('HH:mm') }}
        </div>
        <div class="d-flex align-items-center justify-content-center">
          <div>
            <el-popover
              placement="left"
              width="280"
              trigger="click"
            >
              <v-date-picker
                v-model="currentDate"
                is-expanded
                :max-date="new Date()"
                @input="changeDate"
              />
              <img
                slot="reference"
                class="history-button"
                src="@/assets/icons/clock-rotate-left.svg"
                alt=""
              >
            </el-popover>
          </div>
          <div class="d-flex align-items-center pill">
            <div class="value">
              {{ minuteOffset }}
            </div>
            <div class="unit">
              分钟前
            </div>
          </div>
          <div
            v-if="device"
            class="d-flex align-items-center pill"
          >
            <div class="value">
              {{ device.uploader.battery }}%
            </div>
            <div class="unit">
              <img
                v-if="device.uploader.battery > 85"
                class="battery-icon"
                src="@/assets/icons/battery-full.svg"
                alt=""
              >
              <img
                v-else-if="device.uploader.battery > 65"
                class="battery-icon"
                src="@/assets/icons/battery-three-quarters.svg"
                alt=""
              >
              <img
                v-else-if="device.uploader.battery > 45"
                class="battery-icon"
                src="@/assets/icons/battery-half.svg"
                alt=""
              >
              <img
                v-else-if="device.uploader.battery > 15"
                class="battery-icon"
                src="@/assets/icons/battery-quarter.svg"
                alt=""
              >
              <img
                v-else
                class="battery-icon"
                src="@/assets/icons/battery-low.svg"
                alt=""
              >
            </div>
          </div>
        </div>
      </div>
    </div>

    <div
      v-loading="loading"
      class="flex-1 chart-container"
    >
      <v-chart
        class="chart"
        :option="option"
      />
    </div>
    <div class="d-flex statistics-container">
      <div class="item">
        <div>Low</div>
        <div class="value low">
          {{ distributed.low }}
        </div>
      </div>
      <div class="item">
        <div>In Range</div>
        <div class="value normal">
          {{ distributed.normal }}
        </div>
      </div>
      <div class="item">
        <div>High</div>
        <div class="value high">
          {{ distributed.high }}
        </div>
      </div>
      <div class="item">
        <div>Average</div>
        <div class="value">
          {{ average | format_unit(value.unit) }}{{ value.unit|get_unit_label }}
        </div>
      </div>
      <div class="item">
        <div>HbA1c</div>
        <div class="value">
          {{ HbA1c }}%
        </div>
      </div>
      <div class="item">
        <div>CV</div>
        <div class="value">
          {{ CV }}%
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { use } from 'echarts/core'
import { CanvasRenderer } from 'echarts/renderers'
import { ScatterChart } from 'echarts/charts'
import moment from 'moment'
import _ from 'lodash'
import {
  LegendComponent,
  MarkLineComponent,
  MarkPointComponent,
  TitleComponent,
  TooltipComponent
} from 'echarts/components'
import VChart, { THEME_KEY } from 'vue-echarts'
import { Component, Vue } from 'vue-property-decorator'
import { getDeviceStatus } from '@/api/device'
import { getTreatments } from '@/api/treatment'
import { ipcRenderer } from 'electron'
import { getUnitLabel, sgvToUnit, sgvToUnitString } from '@/utils/blood'
import store from '@/utils/store'
import { standardDeviation } from '@/utils/math'
import { DEFAULT_VALUE } from '@/config'

use([
  CanvasRenderer,
  ScatterChart,
  TitleComponent,
  TooltipComponent,
  LegendComponent,
  MarkLineComponent,
  MarkPointComponent
])

@Component({
  components: {
    VChart
  },
  provide: {
    [THEME_KEY]: 'white'
  },
  filters: {
    format_unit (value, unit) {
      return sgvToUnitString(value, unit)
    },
    get_unit_label (unit) {
      return getUnitLabel(unit)
    }
  }
})
export default class Chart extends Vue {
  loading = false
  auto = true
  entries = []
  treatments = []
  currentTime = moment()
  currentDate = moment().toDate()
  current = {
    sgv: 0,
    date: moment().format('x'),
    offset: 0
  }

  value = _.cloneDeep(DEFAULT_VALUE)

  device = null

  get minuteOffset () {
    return this.currentTime.diff(moment(+this.current.date), 'minutes')
  }

  get average () {
    return this.entries.length ? _.chain(this.entries).map('sgv').mean().value() : 0
  }

  get HbA1c () {
    return this.entries.length ? (Math.round(10 * (_.chain(this.entries).map('sgv').mean().value() + 46.7) / 28.7) / 10).toFixed(1) : 0
  }

  get CV () {
    if (this.entries.length) {
      return (standardDeviation(this.entries.map(entry => entry.sgv), false) * 100 / this.average).toFixed(0)
    } else {
      return 0
    }
  }

  get distributed () {
    if (this.entries.length) {
      const high_count = this.entries.filter(({ sgv }) => sgv > this.value.high).length
      const low_count = this.entries.filter(({ sgv }) => sgv < this.value.low).length
      const normal_count = this.entries.length - high_count - low_count
      return {
        high: (high_count * 100 / this.entries.length).toFixed(2) + '%',
        normal: (normal_count * 100 / this.entries.length).toFixed(2) + '%',
        low: (low_count * 100 / this.entries.length).toFixed(2) + '%'
      }
    } else {
      return {
        high: '--',
        normal: '--',
        low: '--'
      }
    }
  }

  get option () {
    const { entries } = this
    if (entries && entries.length) {
      return {
        tooltip: {
          formatter: (value) => {
            switch (value.seriesIndex) {
              case 0:
                return `${value.name}<br>${value.value[1]}${getUnitLabel(this.value.unit)}`
              case 1:
                return `Type: ${value.data.treatment.eventType} <br />Insulin: ${value.data.treatment.insulin}U  <br />Carbs: ${value.data.treatment.carbs || 0}g <br />Time: ${moment(value.data.treatment.created_at).format('HH:mm')} <br />By: ${value.data.treatment.enteredBy}`
              default:
                return ''
            }
          },
          axisPointer: {
            type: 'cross',
            label: {
              formatter: ({
                axisDimension,
                value
              }) => {
                if (axisDimension === 'x') {
                  return moment(value).format('HH:mm')
                } else {
                  return value.toFixed(1)
                }
              }
            }
          }
        },
        grid: {
          top: '3%',
          right: '4%',
          bottom: '1%',
          left: '1%',
          containLabel: true
        },
        xAxis: {
          min: moment(this.currentDate).startOf('day').format('x'),
          max: moment(this.currentDate).endOf('day').format('x'),
          interval: 2 * 60 * 60 * 1000,
          axisLabel: {
            formatter: (value) => {
              return moment(value).format('HH:mm')
            }
          }
        },
        yAxis: [
          {
            max: Math.ceil(sgvToUnit(this.value.urgent_high, this.value.unit) * 1.1),
            min: Math.floor(sgvToUnit(this.value.urgent_low, this.value.unit) * 0.9),
            gridIndex: 0
          },
          {
            max: 20,
            min: 0,
            gridIndex: 0,
            axisTick: {
              show: false
            },
            axisLabel: {
              show: false
            },
            splitLine: {
              show: false
            }
          }
        ],
        series: [
          {
            symbolSize: 8,
            data: entries.map(item => ({
              name: moment(item.date).format('HH:mm'),
              value: [item.date, sgvToUnit(item.sgv, this.value.unit)],
              itemStyle: {
                color: this.getPointColor(item)
              }
            })),
            type: 'scatter',
            yAxisIndex: 0,
            markLine: {
              symbol: 'none',
              lineStyle: {
                type: 'dashed',
                width: 1
              },
              tooltip: {
                formatter: `{b}: {c}${getUnitLabel(this.value.unit)}`
              },
              data: [
                {
                  name: '极高',
                  yAxis: sgvToUnit(this.value.urgent_high, this.value.unit),
                  lineStyle: { color: '#F56C6C' },
                  label: { color: '#F56C6C' }
                },
                {
                  name: '高',
                  yAxis: sgvToUnit(this.value.high, this.value.unit),
                  lineStyle: { color: '#E6A23C' },
                  label: { color: '#E6A23C' }
                },
                {
                  name: '目标值',
                  yAxis: sgvToUnit(this.value.target, this.value.unit),
                  lineStyle: { color: '#67C23A' },
                  label: { color: '#67C23A' }
                },
                {
                  name: '低',
                  yAxis: sgvToUnit(this.value.low, this.value.unit),
                  lineStyle: { color: '#E6A23C' },
                  label: { color: '#E6A23C' }
                },
                {
                  name: '极低',
                  yAxis: sgvToUnit(this.value.urgent_low, this.value.unit),
                  lineStyle: { color: '#F56C6C' },
                  label: { color: '#F56C6C' }
                }
              ]
            }
          },
          {
            symbol: 'path://M437.2 403.5L319.1 215L319.1 64h7.1c13.25 0 23.1-10.75 23.1-24l-.0002-16c0-13.25-10.75-24-23.1-24H120C106.8 0 96.01 10.75 96.01 24l-.0002 16c0 13.25 10.75 24 23.1 24h7.1L128 215l-117.2 188.5C-18.48 450.6 15.27 512 70.89 512h306.2C432.7 512 466.5 450.5 437.2 403.5zM137.1 320l48.15-77.63C189.8 237.3 191.9 230.8 191.9 224l.0651-160h63.99l-.06 160c0 6.875 2.25 13.25 5.875 18.38L309.9 320H137.1z',
            symbolSize: (value) => {
              return Math.max(value[1] / 20 * 48, 20)
            },
            yAxisIndex: 1,
            data: (this.treatments || []).map(item => ({
              value: [item.date, item.insulin],
              treatment: item,
              itemStyle: {
                color: '#409EFF'
                // color: '#E03C8A'
              }
            })),
            type: 'scatter'
          }
        ]
      }
    } else {
      return null
    }
  }

  getPointColor ({ sgv }) {
    const {
      high,
      low,
      urgent_low
    } = this.value
    if (sgv > high || (sgv < low && sgv >= urgent_low)) {
      return '#E6A23C'
    } else if (sgv < urgent_low) {
      return '#F56C6C'
    } else {
      return '#67C23A'
    }
  }

  mounted () {
    this.initEvent()
    this.getLocalSetting()
    this.getInitData()
    this.createTimer()
    this.loopDeviceStatus()
  }

  beforeDestroy () {
    clearInterval(this.timer)
    this.timer = null
  }

  createTimer () {
    setInterval(() => { this.currentTime = moment() }, 30 * 1000)
  }

  async getInitData () {
    try {
      this.loading = true
      this.entries = await ipcRenderer.invoke('entries-refresh')
    } finally {
      this.loading = false
    }
  }

  async changeDate (date) {
    try {
      this.loading = true
      this.auto = moment(date).isSame(moment(), 'day')
      this.entries = await ipcRenderer.invoke('entries-request', date)
      await this.getTreatments()
    } finally {
      this.loading = false
    }
  }

  getLocalSetting () {
    const value = store.get('value')
    if (value) {
      this.value = value
    }
  }

  async getDeviceStatus () {
    const { data } = await getDeviceStatus()
    if (data.length) {
      this.device = data[0]
    }
  }

  async getTreatments () {
    const date = this.auto ? moment() : moment(this.currentDate)
    const end = date.endOf('day').format()
    const { data } = await getTreatments({
      'find[created_at][$lte]': end
    })
    if (data.length) {
      this.treatments = data.filter(({ created_at }) => moment(created_at).isSameOrAfter(moment().startOf('day'))).map(item => ({
        ...item,
        date: moment(item.created_at).format('x')
      }))
    }
  }

  getExtraInformation () {
    this.getDeviceStatus()
    if (this.auto) {
      this.getTreatments()
    }
  }

  async loopDeviceStatus () {
    await this.getExtraInformation()
    setInterval(() => {
      this.getExtraInformation()
    }, 5 * 60 * 1000)
  }

  initEvent () {
    ipcRenderer.on('entries-update', (channel, entries) => {
      if (entries.length) {
        this.current = {
          ...entries[0],
          offset: entries[0].sgv - entries[1].sgv
        }
        this.entries = entries
      }
      this.loading = false
    })
    ipcRenderer.on('setting-updated', () => {
      this.getLocalSetting()
    })
  }
}
</script>

<style lang="scss" scoped>
.page-container {
  padding: 1rem;
  height: 100vh;
  //background: #110F24;
  //color: white;
  color: var(--text-primary-color);

  .summary-container {
    .summary {
      .current {
        font-size: 5rem;
        color: var(--success-color);
      }

      .arrow {
        width: 3.5rem;
        height: 3.5rem;
        filter: invert(58%) sepia(100%) saturate(295%) hue-rotate(56deg) brightness(93%) contrast(98%);
      }
    }

    .time {
      font-size: 5rem;
      color: var(--text-regular-color)
    }

    .history-button {
      cursor: pointer;
      height: 1.1rem;
      display: flex;
      margin-right: 0.5rem;

      @media (prefers-color-scheme: light) {
        filter: invert(18%) sepia(6%) saturate(309%) hue-rotate(182deg) brightness(92%) contrast(92%);
      }

      @media (prefers-color-scheme: dark) {
        filter: invert(100%) sepia(0%) saturate(2%) hue-rotate(236deg) brightness(104%) contrast(101%);
      }

    }

    .pill {
      margin: 0 .25rem;
      background: var(--info-color);
      border-radius: 6px;
      padding: 0.25rem;
      font-size: 1.1rem;

      .value {
        background: #ffffff;
        border-radius: 4px;
        padding: 0 0.25rem;
        font-weight: bold;
      }

      .unit {
        padding: 0 0.25rem;
        @media (prefers-color-scheme: dark) {
          color: white;
        }

        img {
          height: 1.4rem;
          display: flex;
          filter: invert(17%) sepia(7%) saturate(265%) hue-rotate(182deg) brightness(95%) contrast(92%);

          @media (prefers-color-scheme: dark) {
            filter: invert(100%) sepia(0%) saturate(2%) hue-rotate(236deg) brightness(104%) contrast(101%) !important;
          }
        }
      }
    }
  }

  .statistics-container {
    .item {
      flex: 1;
      text-align: center;

      .value {
        margin-top: .4rem;
        font-weight: bold;

        &.high {
          color: var(--warning-color)
        }

        &.normal {
          color: var(--success-color)
        }

        &.low {
          color: var(--danger-color)
        }
      }

      @media (prefers-color-scheme: dark) {
        color: white;
      }
    }
  }
}

.chart-container {
  padding: 1rem 0;

  .chart {
    height: 100%;
  }
}

</style>
