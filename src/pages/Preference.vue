<template>
  <div class="preference-container">
    <el-tabs>
      <el-tab-pane>
        <div slot="label" class="tab-item">
          <img src="@/assets/icons/input-numeric.svg" alt="">
          通用
        </div>
        <div class="setting-container">
          <el-form ref="value" :model="value" label-width="100px">
            <el-form-item label="血糖单位">
              <el-select class="w-100" v-model="value.unit" placeholder="请选择血糖单位">
                <el-option label="mmol/L" value="mmol"></el-option>
                <el-option label="mg/dL" value="mg/dl"></el-option>
              </el-select>
            </el-form-item>
            <el-form-item label="血糖极高值">
              <el-input-number class="w-100" :step="0.1" v-model="value.urgent_high"></el-input-number>
            </el-form-item>
            <el-form-item label="血糖高值">
              <el-input-number class="w-100" :step="0.1" :max="value.urgent_high"
                               v-model="value.high"></el-input-number>
            </el-form-item>
            <el-form-item label="血糖低值">
              <el-input-number class="w-100" :step="0.1" :max="value.high" v-model="value.low"></el-input-number>
            </el-form-item>
            <el-form-item :step="0.1" label="血糖极低值">
              <el-input-number class="w-100" :step="0.1" :max="value.low" v-model="value.urgent_low"></el-input-number>
            </el-form-item>
            <el-form-item label="血糖目标值">
              <el-input-number class="w-100" :step="0.1" v-model="value.target"></el-input-number>
            </el-form-item>
          </el-form>
        </div>
      </el-tab-pane>
      <el-tab-pane>
        <div slot="label" class="tab-item">
          <img src="@/assets/icons/server.svg" alt="">
          服务器
        </div>
        <div class="setting-container">
          <el-form ref="server" :model="server" label-width="100%" label-position="top">
            <el-form-item>
              <div slot="label" class="text-center d-flex align-items-center server-label">
                <img src="@/assets/images/logo-nightscout.png" alt="">
                <b>NightCount服务器地址</b>
              </div>
              <el-input v-model="server.url" clearable></el-input>
            </el-form-item>
          </el-form>
        </div>
      </el-tab-pane>
      <el-tab-pane>
        <div slot="label" class="tab-item">
          <img src="@/assets/icons/circle-info.svg" alt="">
          关于
        </div>
        <div class="setting-container d-flex flex-column align-items-center justify-content-center">
          <img src="@/assets/icons/droplet-degree.svg" class="logo" alt="">
          <h3 class="mt-2">CGM Monitor 1.0.0</h3>
          <div>Copyright © 2022-2023 Gexiaowei</div>
        </div>
      </el-tab-pane>
    </el-tabs>
  </div>
</template>

<script>
import { Component, Vue } from 'vue-property-decorator'

export default @Component({})
class Preference extends Vue {
  tab = 'common'
  value = {
    unit: 'mmol',
    urgent_high: 12,
    high: 9,
    low: 3.9,
    urgent_low: 2.8,
    target: 7.6
  }

  server = {
    url: 'https://nightscout-gexiaowei.herokuapp.com/'
  }
}
</script>

<style lang="scss" scoped>
.preference-container {
  font-size: 0.875rem;
}

.tab-item {
  display: flex;
  align-items: center;
  padding: 0 .25rem;

  img {
    height: 1rem;
    margin-right: 0.5rem;
  }
}

.setting-container {
  padding: 0 1rem;
}

.logo {
  width: 10rem;
}

.server-label {
  img {
    width: 1.5rem;
    margin-right: .25rem;
  }
}

::v-deep .el-tabs__item {
  padding: 0 1rem !important;
}

::v-deep .is-active {
  .tab-item {
    img {
      filter: invert(47%) sepia(92%) saturate(1410%) hue-rotate(192deg) brightness(104%) contrast(101%);
    }
  }
}

</style>
