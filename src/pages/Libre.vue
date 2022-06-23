<template>
  <div class="container pt-2 pb-2">
    <div>
      <v-date-picker
        v-model="range"
        is-expanded
        is-range
      />
    </div>
    <div class="d-flex align-items-center justify-content-center">
      <el-button
        type="primary"
        :loading="loading"
        @click="upload"
      >
        上传数据
      </el-button>
      <el-button
        :loading="loading"
        @click="close"
      >
        关闭
      </el-button>
    </div>
  </div>
</template>

<script>
import { Component, Vue } from 'vue-property-decorator'
import moment from 'moment'
import { ipcRenderer } from 'electron'

export default @Component({})
class Libre extends Vue {
  loading = false
  range = {
    start: moment().startOf('month').toDate(),
    end: moment().endOf('month').toDate()
  }

  async upload () {
    try {
      this.loading = true
      await ipcRenderer.invoke('batch-upload-libre-run', this.range)
      this.$message.success('上传成功')
    } catch (e) {
      this.$message.error('上传失败')
    } finally {
      this.loading = false
    }
  }

  close () {
    ipcRenderer.invoke('batch-upload-libre-close')
  }
}
</script>

<style lang="scss" scoped>

</style>
