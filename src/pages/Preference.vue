<template>
  <div class="preference-container">
    <el-tabs>
      <el-tab-pane>
        <div
          slot="label"
          class="tab-item"
        >
          <img
            src="@/assets/icons/brush.svg"
            alt=""
          >
          通用
        </div>
        <div class="setting-container">
          <el-form
            ref="config"
            :model="config"
            label-position="left"
            label-width="100px"
          >
            <el-form-item label="开机启动">
              <el-switch
                v-model="config.auto"
              />
            </el-form-item>
            <el-form-item label="主题颜色">
              <el-radio-group v-model="config.theme">
                <el-radio label="dark">
                  深色
                </el-radio>
                <el-radio label="light">
                  浅色
                </el-radio>
                <el-radio label="system">
                  系统
                </el-radio>
              </el-radio-group>
            </el-form-item>
          </el-form>
        </div>
      </el-tab-pane>
      <el-tab-pane>
        <div
          slot="label"
          class="tab-item"
        >
          <img
            src="@/assets/icons/droplet-degree.svg"
            alt=""
          >
          血糖
        </div>
        <div class="setting-container">
          <el-form
            ref="value"
            :model="value"
            label-width="100px"
            label-position="left"
          >
            <el-form-item label="血糖单位">
              <el-select
                v-model="value.unit"
                class="w-100"
                placeholder="请选择血糖单位"
                @change="changeUnit"
              >
                <el-option
                  label="mmol/L"
                  value="mmol"
                />
                <el-option
                  label="mg/dL"
                  value="mg/dl"
                />
              </el-select>
            </el-form-item>
            <el-form-item label="血糖极高值">
              <el-input-number
                v-model="value.urgent_high"
                class="port-input w-100"
                controls-position="right"
                :step="step"
              />
            </el-form-item>
            <el-form-item label="血糖高值">
              <el-input-number
                v-model="value.high"
                class="port-input w-100"
                controls-position="right"
                :step="step"
                :max="value.urgent_high"
              />
            </el-form-item>
            <el-form-item label="血糖低值">
              <el-input-number
                v-model="value.low"
                class="port-input w-100"
                controls-position="right"
                :step="step"
                :max="value.high"
              />
            </el-form-item>
            <el-form-item
              :step="step"
              label="血糖极低值"
            >
              <el-input-number
                v-model="value.urgent_low"
                class="port-input w-100"
                controls-position="right"
                :step="step"
                :max="value.low"
              />
            </el-form-item>
            <el-form-item label="血糖目标值">
              <el-input-number
                v-model="value.target"
                class="port-input w-100"
                controls-position="right"
                :step="step"
              />
            </el-form-item>
          </el-form>
        </div>
      </el-tab-pane>
      <el-tab-pane>
        <div
          slot="label"
          class="tab-item"
        >
          <img
            src="@/assets/icons/server.svg"
            alt=""
          >
          服务器
        </div>
        <div class="setting-container">
          <el-form
            ref="server"
            :model="server"
            label-width="100px"
            label-position="left"
          >
            <div
              class="text-center d-flex align-items-center server-label w-100"
            >
              <img
                src="@/assets/images/logo-nightscout.png"
                alt=""
              >
              <b>NightCount服务器地址</b>
            </div>
            <el-form-item
              label-width="0"
              class="mt-2"
            >
              <el-input
                v-model="server.url"
                clearable
              />
            </el-form-item>
            <el-form-item
              label="Libre服务"
              label-position="left"
            >
              <el-switch
                v-model="libre.enable"
              />
            </el-form-item>
            <el-form-item
              v-show="libre.enable"
              label="用户名"
            >
              <el-input
                v-model="libre.user"
                placeholder="请输入用户名"
              />
            </el-form-item>
            <el-form-item
              v-show="libre.enable"
              label="密码"
            >
              <el-input
                v-model="libre.password"
                show-password
                placeholder="请输入密码"
              />
            </el-form-item>
            <el-form-item
              v-show="libre.enable"
              label="设备SN"
            >
              <el-input
                v-model="libre.device_id"
                placeholder="请输入设备序列号"
              />
            </el-form-item>
            <el-form-item
              v-show="libre.enable"
            >
              <el-button
                :loading="testing"
                @click="testLibreServer"
              >
                测试连接
              </el-button>
            </el-form-item>
          </el-form>
        </div>
      </el-tab-pane>
      <el-tab-pane>
        <div
          slot="label"
          class="tab-item"
        >
          <img
            src="@/assets/icons/network-wired.svg"
            alt=""
          >
          代理
        </div>
        <div class="setting-container">
          <el-form
            ref="proxy"
            :model="proxy"
            label-width="100px"
            label-position="left"
          >
            <el-form-item
              label="代理服务器"
            >
              <el-switch
                v-model="proxy.enable"
              />
            </el-form-item>
            <el-form-item label="类型">
              <el-radio-group
                v-model="proxy.protocol"
                :disabled="!proxy.enable"
              >
                <el-radio label="http">
                  Http
                </el-radio>
                <el-radio label="socks">
                  Socks
                </el-radio>
              </el-radio-group>
            </el-form-item>
            <el-form-item label="主机名">
              <el-input
                v-model="proxy.host"
                :disabled="!proxy.enable"
                placeholder="主机名"
              />
            </el-form-item>
            <el-form-item label="端口">
              <el-input-number
                v-model="proxy.port"
                :disabled="!proxy.enable"
                class="port-input w-100"
                controls-position="right"
                placeholder="端口"
              />
            </el-form-item>
          </el-form>
        </div>
      </el-tab-pane>
      <el-tab-pane>
        <div
          slot="label"
          class="tab-item"
        >
          <img
            src="@/assets/icons/keyboard.svg"
            alt=""
          >
          快捷键
        </div>
        <div class="setting-container">
          <el-form
            ref="shortcut"
            :model="shortcut"
            label-width="100px"
            label-position="left"
          >
            <el-form-item label="切换显示">
              <hot-key-input
                :hotkey.sync="shortcut.toggle"
                placeholder="请按需要绑定的按键，支持组合按键"
              />
            </el-form-item>
          </el-form>
        </div>
      </el-tab-pane>
      <el-tab-pane>
        <div
          slot="label"
          class="tab-item"
        >
          <img
            src="@/assets/icons/circle-info.svg"
            alt=""
          >
          关于
        </div>
        <div class="setting-container d-flex flex-column align-items-center justify-content-center">
          <img
            src="@/assets/logo.png"
            class="logo"
            alt=""
          >
          <h3 class="mt-2">
            CGM Monitor 1.1.0
          </h3>
          <div>Copyright © 2022 gexiaowei</div>
        </div>
      </el-tab-pane>
    </el-tabs>
  </div>
</template>

<script>
import { Component, Watch, Vue } from 'vue-property-decorator'
import { ipcRenderer } from 'electron'
import HotKeyInput from '@/components/HotKeyInput'
import { convertUnits, sgvToUnit, toSgv } from '@/utils/blood'
import { DEFAULT_VALUE } from '@/config'
import store from '@/utils/store'

export default @Component({
  components: { HotKeyInput }
})
class Preference extends Vue {
  tab = 'common'
  testing = false
  value = { ...DEFAULT_VALUE }

  server = {
    url: ''
  }

  libre = {
    enable: false,
    user: '',
    password: '',
    device_id: ''
  }

  shortcut = {
    toggle: []
  }

  proxy = {
    enable: false,
    protocol: 'http',
    host: '',
    port: '',
    auth: {
      username: '',
      password: ''
    }
  }

  config = {
    auto: false,
    theme: 'system'
  }

  get step () {
    return this.value.unit === 'mg/dl' ? 1 : 0.1
  }

  changeUnit () {
    const { unit } = this.value
    this.value.urgent_high = convertUnits(this.value.urgent_high, unit)
    this.value.high = convertUnits(this.value.high, unit)
    this.value.low = convertUnits(this.value.low, unit)
    this.value.urgent_low = convertUnits(this.value.urgent_low, unit)
    this.value.target = convertUnits(this.value.target, unit)
    this.handleValueSettingChange()
  }

  @Watch('libre', { deep: true })
  handleLibreChange (value) {
    ipcRenderer.invoke('set-setting', {
      key: 'libre',
      value
    })
  }

  @Watch('shortcut', { deep: true })
  handleShortcutChange (value) {
    ipcRenderer.invoke('set-setting', {
      key: 'shortcut',
      value: {
        toggle: value.toggle.length ? value.toggle[0].text : ''
      }
    })
  }

  @Watch('proxy', { deep: true })
  handleProxyChange (value) {
    ipcRenderer.invoke('set-setting', {
      key: 'proxy',
      value
    })
  }

  @Watch('config', { deep: true })
  handleConfigChange (value) {
    ipcRenderer.invoke('set-setting', {
      key: 'config',
      value
    })
  }

  @Watch('value', { deep: true })
  handleValueSettingChange () {
    const {
      unit,
      urgent_high,
      high,
      low,
      urgent_low,
      target
    } = this.value
    ipcRenderer.invoke('set-setting', {
      key: 'value',
      value: {
        unit,
        urgent_high: toSgv(urgent_high, unit),
        high: toSgv(high, unit),
        low: toSgv(low, unit),
        urgent_low: toSgv(urgent_low, unit),
        target: toSgv(target, unit)
      }
    })
  }

  @Watch('server', { deep: true })
  handleServerSettingChange (server) {
    ipcRenderer.invoke('set-setting', {
      key: 'server',
      value: server
    })
  }

  mounted () {
    this.getLocalSetting()
  }

  getLocalSetting () {
    const value = store.get('value')
    if (value) {
      const {
        unit,
        urgent_high,
        high,
        low,
        urgent_low,
        target
      } = value
      this.value = {
        unit,
        urgent_high: sgvToUnit(urgent_high, unit),
        high: sgvToUnit(high, unit),
        low: sgvToUnit(low, unit),
        urgent_low: sgvToUnit(urgent_low, unit),
        target: sgvToUnit(target, unit)
      }
    }
    const server = store.get('server')
    if (server) {
      this.server = server
    }
    const config = store.get('config')
    if (config) {
      this.config = config
    }
    const proxy = store.get('proxy')
    if (proxy) {
      this.proxy = proxy
    }
    const libre = store.get('libre')
    if (libre) {
      this.libre = libre
    }
    const shortcut = store.get('shortcut')
    if (shortcut) {
      this.shortcut = {
        toggle: shortcut.toggle ? [shortcut.toggle] : []
      }
    }
  }

  async testLibreServer () {
    try {
      this.testing = true
      await ipcRenderer.invoke('test-libre', this.libre)
      this.$message.success('连接服务器成功')
    } catch (e) {
      this.$message.error('连接服务器失败')
    } finally {
      this.testing = false
    }
  }
}
</script>

<style lang="scss" scoped>
.preference-container {
  font-size: 0.875rem;
  height: 100vh;
}

.tab-item {
  display: flex;
  align-items: center;
  padding: 0 .25rem;

  img {
    height: 1rem;
    margin-right: 0.5rem;

    @media (prefers-color-scheme: dark) {
      filter: invert(100%) sepia(0%) saturate(2%) hue-rotate(236deg) brightness(104%) contrast(101%);
    }
  }
}

.setting-container {
  padding: 0 1rem;
}

.logo {
  width: 10rem;

  @media (prefers-color-scheme: dark) {
    filter: invert(100%) sepia(0%) saturate(2%) hue-rotate(236deg) brightness(104%) contrast(101%);
  }
}

.refresh {
  cursor: pointer;
  display: flex;
  width: 14px;
  height: 14px;
  filter: invert(48%) sepia(96%) saturate(445%) hue-rotate(176deg) brightness(100%) contrast(103%);

  @media (prefers-color-scheme: dark) {
    filter: invert(100%) sepia(0%) saturate(2%) hue-rotate(236deg) brightness(104%) contrast(101%);
  }
}

.server-label {
  img {
    width: 1.5rem;
    margin-right: .25rem;
  }
}

.port-input {
  ::v-deep input {
    text-align: left !important;
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
