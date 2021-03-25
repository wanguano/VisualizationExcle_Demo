<template>
  <div>
    <button class="btn" @click="requestExcleStream">测试</button>
    <div class="content">
      <div id="xss-demo" />
    </div>
  </div>
</template>

<script>
import axios from 'axios'
import Spreadsheet from '@/components/x-spreadsheet';
import XStyle from 'xlsx-style';
import Exchange from '@/util/xlsx-exchange';
export default {
  name: "TestExcel",
  async mounted() {
    this.instantiateSheet();
  },
  methods: {
    requestExcleStream() {
      axios({
        method: 'get',
        url: 'http://39.102.36.212:3006/excelExport',
        responseType: 'blob'
      }).then((res) => {
        const self = this
        const result = res.data
        console.log('result', result)
        // debugger
        this.flobFileSize = result.size || 0;
        if (result instanceof Blob) {
          var reader = new FileReader();
          reader.onload = function (e) {
            let data = e.target.result;
            console.log(data)
            if (data) {
              let workbook = XStyle.read(data, { type: "binary", cellStyles: true });
              let out = Exchange.stox(workbook);
              self.setXsheetData(out)
            } else {
              self.setXsheetData([])
            }
          };
          reader.readAsBinaryString(result);
        } else {
          self.setXsheetData([])
        }
      })
    },
    // 设置xsheet 数据
    setXsheetData(out) {
      this.sheet.loadData(out);
      if (out.length) {
        let colLen = Object.keys(out[0].rows[0].cells).length || 10;
        // let colLen = this.getTableColLen(out) || 10;
        let rowLen = Object.keys(out[0].rows).length || 10;
        this.sheet.sheet.data.rows.len = rowLen;
        this.sheet.sheet.data.cols.len = colLen;
        this.sheet.reRender();
      }
    },
    // 实例化 xsheet
    instantiateSheet() {
      let queryListHeight = 0;
      if (this.$refs.queryList)
        queryListHeight = this.$refs.queryList.$el.offsetHeight || 0;
      this.sheet = new Spreadsheet(document.getElementById("xss-demo"), {
        mode: "read", // edit | read
        showToolbar: false,
        showGrid: false,
        showContextmenu: false,
        view: {
          height: () =>
            document.documentElement.clientHeight - 180 - queryListHeight,
          width: () => document.documentElement.clientWidth - 300,
        },
        row: {
          height: 25,
          len: 100,
        },
        col: {
          len: 16,
          width: 100,
          indexWidth: 60,
          minWidth: 60,
        },
      });
    },
  }
}
</script>

<style scoped>
.btn {
  width: 100px;
  height: 36px;
  cursor: pointer;
}
</style>