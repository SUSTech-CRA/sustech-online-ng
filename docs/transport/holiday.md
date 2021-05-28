# 🚌校园巴士 - 节假日 (2021年5月27日更新)

<a data-fancybox title="" href="https://cdn.jsdelivr.net/gh/sustc/sustech-online-ng@master/docs/transport/busline2.png">![](./busline2.png)</a>

## 欣园 → 工学院（共58班）

<ClientOnly>

<div id="bus-table-hl2rb">
    <table class="dataTable" id="holi-bus-hl2rb">
    </table>
</div>

</ClientOnly>

## 工学院 → 欣园（共58班）

<ClientOnly>
<div id="bus-table-rb2hl">
    <table class="dataTable" id="holi-bus-rb2hl">
    </table>
</div>
</ClientOnly>

## 参考文献

* 2021年5月27日 `校园服务办公室 <ocs@sustech.edu.cn>` 邮件《关于调整校园巴士节假日班次的通知 Notice on Adjustment of Campus Bus Schedule during Weekends/Holidays 【2021】17号》
    * [下载链接-中文](https://cdn.jsdelivr.net/gh/sustc/sustech-online-ng@master/docs/transport/Campus_Bus_Schedule_2021_05_CN.pdf)（右键 / 长按保存）
    * [Download-English](https://cdn.jsdelivr.net/gh/sustc/sustech-online-ng@master/docs/transport/Campus_Bus_Schedule_2021_05_EN.pdf)（Right click / long press to save）

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
var busdata_hl2rb= [
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
    ["22:00","",""],
];


// 科研楼 → 欣园
var busdata_rb2hl = [
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
    ["22:20","",""],
];


function build_all_table() {
    if ($.fn.DataTable.isDataTable('#hl2rb')) {
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
            { title: "平时/高峰", "orderable": false },
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

    // high land - research building
    var tmp = update_bus_status(busdata_hl2rb);
    busdata_hl2rb = tmp.now_table;
    var now_bus_row_hl2rb = tmp.row;
    var ins_table_hl2rb = $('#holi-bus-hl2rb').DataTable($.extend(true, { data: busdata_hl2rb }, dtb_config));
    var now_bus_offset = $(ins_table_hl2rb.row(Math.min(now_bus_row_hl2rb, busdata_hl2rb.length)).node()).offset().top - $(ins_table_hl2rb.row(0).node()).offset().top;
    $("#bus-table-hl2rb .dataTables_scrollBody").scrollTop(now_bus_offset);

    // research building - high land
    var tmp = update_bus_status(busdata_rb2hl);
    busdata_rb2hl = tmp.now_table;
    var now_bus_row_rb2hl = tmp.row;
    var ins_table_rb2hl = $('#holi-bus-rb2hl').DataTable($.extend(true, { data: busdata_rb2hl }, dtb_config));
    var now_bus_offset = $(ins_table_rb2hl.row(Math.min(now_bus_row_rb2hl, busdata_rb2hl.length)).node()).offset().top - $(ins_table_rb2hl.row(0).node()).offset().top;
    $("#bus-table-rb2hl .dataTables_scrollBody").scrollTop(now_bus_offset);

}

document.addEventListener('DOMContentLoaded', build_all_table, false);

$(document).ready(function () {
    build_all_table();
});
    }
  }
</script>
