# 🚌校园巴士 - 节假日 (2021年6月18日更新)

<a data-fancybox title="" href="https://mirrors.sustech.edu.cn/git/sustech-online/sustech-online-ng/-/raw/master/docs/transport/busline2.png">![](./busline2.png)</a>

## 快速跳转
* [1路 下行 欣园 → 工学院](#_1路-欣园-→-工学院-共58班)
* [1路 上行 工学院 → 欣园](#_1路-工学院-→-欣园-共58班)

节假日仅 **1路** 运行。

## 1路 欣园 → 工学院（共58班）

<!-- <ClientOnly> -->

<!-- 欣园到工学院 -->
<div id="bus-table-hl2coe">
    <table class="dataTable" id="holi-bus-hl2coe">
    </table>
</div>
<!-- </ClientOnly> -->

## 1路 工学院 → 欣园（共58班）

<!-- 工学院到欣园 -->
<div id="bus-table-coe2hl">
    <table class="dataTable" id="holi-bus-coe2hl">
    </table>
</div>
<!-- </ClientOnly> -->

## 参考文献

* 2021年6月18日 `校园服务办公室 <ocs@sustech.edu.cn>` 邮件《【关于调整校园巴士运行班次及线路的通知 Notice on Adjustment of Campus Bus Schedule and Routes【2021】26号》
    * [下载链接-中文](https://mirrors.sustech.edu.cn/git/sustech-online/sustech-online-ng/-/raw/master/docs/transport/Campus_Bus_Schedule_2021_06_CN.pdf)（右键 / 长按保存）
    * [Download-English](https://mirrors.sustech.edu.cn/git/sustech-online/sustech-online-ng/-/raw/master/docs/transport/Campus_Bus_Schedule_2021_06_EN.pdf)（Right click / long press to save）

<script>
  export default {
    mounted () {
    function getTime(MinBefore) {
        // 获取x分钟前的时间
        var date = new Date();
        date.setMinutes(date.getMinutes() - MinBefore);
        var h = date.getHours();
        var hour = (h < 10) ? "0" + h : h;
        var m = date.getMinutes();
        var min = (m < 10) ? "0" + m : m;
        return hour + ":" + min;
    }

    function update_bus_status(bus_time_table) {
        var now_20 = getTime(20);
        var now = getTime(0);
        var now_row_index = 0;
        for (var i = 0, len = bus_time_table.length; i < len; i++) {
            if (bus_time_table[i][0] < now_20) {
                bus_time_table[i][2] = "已到达";
                now_row_index = i;
            } else if (bus_time_table[i][0] < now) {
                bus_time_table[i][2] = "在途中";
            } else {
                bus_time_table[i][2] = "未发车";
            }
        }
        return { "row": now_row_index, "now_table": bus_time_table }
    }

    // 欣园 → 科研楼
    var bus_data_json = {
        "coe2hl":[
            ["07:20","",""],
            ["07:40","",""],
            ["08:00","",""],
            ["08:20","",""],
            ["08:40","",""],
            ["09:00","",""],
            ["09:20","",""],
            ["09:40","",""],
            ["10:00","",""],
            ["10:20","",""],
            ["10:40","",""],
            ["11:00","",""],
            ["11:10","",""],
            ["11:20","",""],
            ["11:30","",""],
            ["11:40","",""],
            ["11:50","",""],
            ["12:00","",""],
            ["12:10","",""],
            ["12:20","",""],
            ["12:30","",""],
            ["12:40","",""],
            ["12:50","",""],
            ["13:00","",""],
            ["13:20","",""],
            ["13:40","",""],
            ["14:00","",""],
            ["14:20","",""],
            ["14:40","",""],
            ["15:00","",""],
            ["15:20","",""],
            ["15:40","",""],
            ["16:00","",""],
            ["16:20","",""],
            ["16:40","",""],
            ["17:00","",""],
            ["17:10","",""],
            ["17:20","",""],
            ["17:30","",""],
            ["17:40","",""],
            ["17:50","",""],
            ["18:00","",""],
            ["18:10","",""],
            ["18:20","",""],
            ["18:30","",""],
            ["18:40","",""],
            ["18:50","",""],
            ["19:00","",""],
            ["19:20","",""],
            ["19:40","",""],
            ["20:00","",""],
            ["20:20","",""],
            ["20:40","",""],
            ["21:00","",""],
            ["21:20","",""],
            ["21:40","",""],
            ["22:00","",""],
            ["22:20","",""],],
        "hl2coe":[
            ["07:00","",""],
            ["07:20","",""],
            ["07:40","",""],
            ["08:00","",""],
            ["08:20","",""],
            ["08:40","",""],
            ["09:00","",""],
            ["09:20","",""],
            ["09:40","",""],
            ["10:00","",""],
            ["10:20","",""],
            ["10:40","",""],
            ["11:00","",""],
            ["11:10","",""],
            ["11:20","",""],
            ["11:30","",""],
            ["11:40","",""],
            ["11:50","",""],
            ["12:00","",""],
            ["12:10","",""],
            ["12:20","",""],
            ["12:30","",""],
            ["12:40","",""],
            ["12:50","",""],
            ["13:00","",""],
            ["13:20","",""],
            ["13:40","",""],
            ["14:00","",""],
            ["14:20","",""],
            ["14:40","",""],
            ["15:00","",""],
            ["15:20","",""],
            ["15:40","",""],
            ["16:00","",""],
            ["16:20","",""],
            ["16:40","",""],
            ["17:00","",""],
            ["17:10","",""],
            ["17:20","",""],
            ["17:30","",""],
            ["17:40","",""],
            ["17:50","",""],
            ["18:00","",""],
            ["18:10","",""],
            ["18:20","",""],
            ["18:30","",""],
            ["18:40","",""],
            ["18:50","",""],
            ["19:00","",""],
            ["19:20","",""],
            ["19:40","",""],
            ["20:00","",""],
            ["20:20","",""],
            ["20:40","",""],
            ["21:00","",""],
            ["21:20","",""],
            ["21:40","",""],
            ["22:00","",""],],
    };

    function build_all_table() {
        if ($.fn.DataTable.isDataTable('#hl2coe')) {
            return;
        }

        var dtb_config = {
            scrollY: 300,
            paging: false,
            searching: false,
            bFilter: false,
            info: false,
            columns: [
                { title: "发车时间" },
                { title: "平时/高峰", "orderable": false, "visible": false},
                // 前端隐藏高峰列，可能以后要用。
                { title: "状态", "orderable": false },
            ],
            rowCallback: function (row, data, index) {
                if (data[2] == "已到达") {
                    $('td', row).css('background-color', '#003f43'); // SUSTech dark green
                    $('td', row).css('color', '#FFFFFF');
                }
                else if (data[2] == "未发车") {
                    $('td', row).css('background-color', '#FFFFFF'); // SUSTech dark green
                    $('td', row).css('color', '#2c3e50');
                }
                else if (data[2] == "在途中") {
                    $('td', row).css('background-color', '#ed6c00'); // SUSTech orange
                    $('td', row).each(function () {
                        $(this).html('<b>' + $(this).text() + '</b>');
                    });
                }
            }
        }

        var busdata_hl2coe; // high land - COE
        var busdata_coe2hl; // COE - high land

        // high land - COE
        var tmp = update_bus_status(bus_data_json.hl2coe);
        busdata_hl2coe = tmp.now_table;
        var now_bus_row_hl2coe = tmp.row;
        var ins_table_hl2coe = $('#holi-bus-hl2coe').DataTable($.extend(true, { data: busdata_hl2coe }, dtb_config));
        var now_bus_offset = $(ins_table_hl2coe.row(Math.min(now_bus_row_hl2coe, busdata_hl2coe.length)).node()).offset().top - $(ins_table_hl2coe.row(0).node()).offset().top;
        $("#bus-table-hl2coe .dataTables_scrollBody").scrollTop(now_bus_offset);

        // COE - high land
        var tmp = update_bus_status(bus_data_json.coe2hl);
        busdata_coe2hl = tmp.now_table;
        var now_bus_row_coe2hl = tmp.row;
        var ins_table_coe2hl = $('#holi-bus-coe2hl').DataTable($.extend(true, { data: busdata_coe2hl }, dtb_config));
        var now_bus_offset = $(ins_table_coe2hl.row(Math.min(now_bus_row_coe2hl, busdata_coe2hl.length)).node()).offset().top - $(ins_table_coe2hl.row(0).node()).offset().top;
        $("#bus-table-coe2hl .dataTables_scrollBody").scrollTop(now_bus_offset);

    }

    document.addEventListener('DOMContentLoaded', build_all_table, false);

    $(document).ready(function () {
        build_all_table();
    });
    }
  }
</script>
