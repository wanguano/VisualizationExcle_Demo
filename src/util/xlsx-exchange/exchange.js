import XLSX from 'xlsx'
const Exchange = {
  //excel -> data
  stox(wb) {
    var out = [];
    wb.SheetNames.forEach(function (name) {
      var o = {
        name: name,
        rows: {},
        cols: {},
        merges: [],
        styles: []
      };
      var ws = wb.Sheets[name];
      console.log('name :>> ', name);
      ws['!cols'] && console.log('ws[ :>> ', ws);
      var aoa = XLSX.utils.sheet_to_json(ws, {
        raw: true,
        rawNumbers: false,
        header: 1
      });
      //获取cell内容
      let styleIndex = 0;
      aoa.forEach(function (r, i) {
        var cells = {};
        r.forEach(function (c, j) {
          let cellIndex = XLSX.utils.encode_cell({
            c: j,
            r: i
          });
          cells[j] = {
            text: c
          }

          if (ws[cellIndex] && ws[cellIndex]['s']) {
            let cellstyle = ws[cellIndex]['s'];
            let oCellstyle = {};

            //填充
            if (cellstyle['fill']) {
              var bgargb = cellstyle['fill']['fgColor']['rgb'];
              if (bgargb && bgargb.length == 6) {
                oCellstyle.bgcolor = '#' + bgargb;
              } else if (bgargb && bgargb.length == 8) {
                oCellstyle.bgcolor = '#' + bgargb.slice(2);
              }
            }
            //字体
            if (cellstyle['font']) {
              oCellstyle.font = {
                bold: cellstyle['font']['bold'] || false,
                size: cellstyle['font']['sz'] || 11
              }
              if (cellstyle['font']['color']) {
                var fcargb = cellstyle['font']['color']['rgb'];
                if (fcargb && fcargb.length == 6) {
                  if (fcargb == '000000') {
                    oCellstyle.color = '#FFFFFF';
                  } else if (fcargb == 'FFFFFF') {
                    oCellstyle.color = '#000000';
                  } else {
                    oCellstyle.color = '#' + fcargb;
                  }
                } else if (fcargb && fcargb.length == 8) {
                  oCellstyle.color = '#' + fcargb.slice(2);
                }
              }
            }
            //边框
            if (cellstyle['border']) {
              oCellstyle.border = {};
              for (var key in cellstyle['border']) {
                if (cellstyle['border'][key]['color']) {
                  let brargb = cellstyle['border'][key]['color']['rgb'];
                  if (bgargb && bgargb.length == 6) {
                    let obrargb = brargb ? '#' + brargb : "#000000";
                    oCellstyle.border[key] = [cellstyle['border'][key]['style'], obrargb];
                  } else if (bgargb && bgargb.length == 8) {
                    let obrargb = brargb ? '#' + brargb.slice(2) : "#000000";
                    oCellstyle.border[key] = [cellstyle['border'][key]['style'], obrargb];
                  } else {
                    oCellstyle.border[key] = brargb ? ['thin', `${brargb.slice(2)}`] : ['thin', '#000']
                  }
                }
              }
            }
            //对齐
            if (cellstyle['alignment']) {
              let align = cellstyle['alignment']['horizontal'];
              oCellstyle.align = align ? align : 'center';
              let valign = cellstyle['alignment']['vertical'];
              oCellstyle.valign = (!valign || valign == 'center') ? 'middle' : valign;
            }
            //  else {
            //   oCellstyle.align = 'center'
            //   oCellstyle.valign = 'middle'
            // }
            cells[j].style = styleIndex;
            o.styles[styleIndex] = oCellstyle;
            styleIndex++;
          } else {
            cells[j].style = styleIndex;
            o.styles[styleIndex] = {
              align: 'center',
              valign: 'middle',
            }
            styleIndex++;
          }
        });

        o.rows[i] = {
          cells: cells
        };
      });
      //获取合并单元格
      if (ws["!merges"]) {
        let merges = ws["!merges"];
        merges.forEach(item => {
          let rMerge = item.e.r - item.s.r;
          let cMerge = item.e.c - item.s.c;
          let range = XLSX.utils.encode_range(item);
          if (o.rows[item.s.r]["cells"][item.s.c]) {
            o.rows[item.s.r]["cells"][item.s.c].merge = [rMerge, cMerge];
            o.merges.push(range);
          }
        });
      }
      //获取列宽度
      if (ws["!cols"]) {
        let cols = ws["!cols"];
        cols.forEach((item, index) => {
          o.cols[index] = {};
          o.cols[index]["width"] = item.wpx;
        })
      }

      out.push(o);
    });
    return out;
  },
  //data -> excel
  xtos(sdata) {
    var out = XLSX.utils.book_new();
    sdata.forEach(function (xws) {
      var aoa = [
        []
      ];
      var rowobj = xws.rows;
      for (var ri = 0; ri < rowobj.len; ++ri) {
        var row = rowobj[ri];
        if (!row) continue;
        aoa[ri] = [];
        Object.keys(row.cells).forEach(function (k) {
          var idx = +k;
          if (isNaN(idx)) return;
          aoa[ri][idx] = row.cells[k].text;
        });
      }
      var ws = XLSX.utils.aoa_to_sheet(aoa);
      XLSX.utils.book_append_sheet(out, ws, xws.name);
    });
    return out;
  },
}

export default Exchange;
