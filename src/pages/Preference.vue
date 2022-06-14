<template>
  <div class="preference-container">
    <div class="d-flex align-items-center nav">
      <div class="item" :class="{active:tab==='common'}" @click="tab='common'">
        <img src="@/assets/icons/input-numeric.svg" alt="">
        <span>通用</span>
      </div>
      <div class="item" :class="{active:tab==='server'}" @click="tab='server'">
        <img src="@/assets/icons/server.svg" alt="">
        <span>服务器</span>
      </div>
      <div class="item" :class="{active:tab==='about'}" @click="tab='about'">
        <img src="@/assets/icons/circle-info.svg" alt="">
        <span>关于</span>
      </div>
    </div>
    <div class="setting-container">
      <div v-if="tab==='common'">
        <div class="d-flex align-items-center item">
          <div class="label">单位</div>
          <div class="flex-1 text-left">
            <select name="" id="">
              <option value="mmol">mmol/L</option>
              <option value="mg/dl">mg/dL</option>
            </select>
          </div>
        </div>
        <div class="d-flex align-items-center item">
          <div class="label">血糖极高值</div>
          <div class="flex-1 text-left">
            <input type="text">
          </div>
        </div>
        <div class="d-flex align-items-center item">
          <div class="label">血糖极高值</div>
          <div class="flex-1 text-left">
            <input type="text">
          </div>
        </div>
        <div class="d-flex align-items-center item">
          <div class="label">血糖低值</div>
          <div class="flex-1 text-left">
            <input type="text">
          </div>
        </div>
        <div class="d-flex align-items-center item">
          <div class="label">血糖极低值</div>
          <div class="flex-1 text-left">
            <input type="text">
          </div>
        </div>
        <div class="d-flex align-items-center item">
          <div class="label">血糖目标值</div>
          <div class="flex-1 text-left">
            <input type="text">
          </div>
        </div>
      </div>
    </div>
    <div v-if="tab==='server'">
      <div class="d-flex align-items-center item">
        <div class="label">NightsCount</div>
        <div class="flex-1 text-left">
          <input type="text">
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { Component, Vue } from 'vue-property-decorator'

export default @Component({})
class Preference extends Vue {
  tab = 'common'
}
</script>

<style lang="scss" scoped>
.preference-container {
  font-size: 0.875rem;
}

.nav {
  padding: 0.25rem;
  background: #EDEAF0;
  border-bottom: 1px solid #C6C3C8;

  .item {
    margin: 0 2px;
    padding: 0.25rem;
    cursor: pointer;
    width: 4rem;
    text-align: center;
    display: flex;
    align-items: center;
    flex-direction: column;
    border-radius: 4px;

    img {
      margin-bottom: 0.25rem;
      width: 1.25rem;
      height: 1.25rem;
    }

    &:hover, &.active {
      background: #E1DEE4;
    }
  }
}

.setting-container {
  padding: 1rem 0.25rem;

  .item {
    margin-bottom: 0.5rem;

    & > div {
      margin: 0 0.25rem;
    }

    .label {
      width: 5rem;
    }
  }
}
</style>
