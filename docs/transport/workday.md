# 🚌校园巴士 - 工作日 (2021年6月18日更新)

<a data-fancybox title="" href="https://mirrors.sustech.edu.cn/git/sustech-online/sustech-online-ng/-/raw/master/docs/transport/busline2.png">![](./busline2.png)</a>

## 快速跳转
* [1路 下行 欣园 → 工学院](#_1路-欣园-→-工学院-共109班)
* [1路 上行 工学院 → 欣园](#_1路-工学院-→-欣园-共98班)
* [2路 下行 欣园 → 科研楼](#_2路-欣园-→-科研楼-共71班)
* [2路 上行 科研楼 → 欣园](#_2路-科研楼-→-欣园-共85班)
* [智园 → 教工食堂 → 荔园](#智园-→-教工食堂-→-荔园-共2班)

## 1路 欣园 → 工学院（共109班）

<!-- <ClientOnly> -->

<!-- 欣园到工学院 -->
<div id="bus-table-hl2coe">
    <table class="dataTable" id="work-bus-hl2coe">
    </table>
</div>
<!-- </ClientOnly> -->

## 1路 工学院 → 欣园（共98班）

<!-- 工学院到欣园 -->
<div id="bus-table-coe2hl">
    <table class="dataTable" id="work-bus-coe2hl">
    </table>
</div>
<!-- </ClientOnly> -->

## 2路 欣园 → 科研楼（共71班）

<!-- 欣园到科研楼 -->
<div id="bus-table-hl2rb">
    <table class="dataTable" id="work-bus-hl2rb">
    </table>
</div>
<!-- </ClientOnly> -->

## 2路 科研楼 → 欣园（共85班）

<!-- 科研楼到欣园 -->
<div id="bus-table-rb2hl">
    <table class="dataTable" id="work-bus-rb2hl">
    </table>
</div>
<!-- </ClientOnly> -->

## 智园 → 教工食堂 → 荔园（共2班）

<!-- <ClientOnly> -->
<div id="bus-table-ip2lh">
    <table class="dataTable" id="work-bus-ip2lh">
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
        "rb2hl": [
            ["07:35","",""],
            ["07:43","",""],
            ["07:55","",""],
            ["08:13","",""],
            ["08:22","",""],
            ["08:28","",""],
            ["08:34","",""],
            ["08:38","",""],
            ["08:48","",""],
            ["08:57","",""],
            ["09:03","",""],
            ["09:13","",""],
            ["09:33","",""],
            ["09:35","",""],
            ["09:43","",""],
            ["09:46","",""],
            ["09:53","",""],
            ["09:56","",""],
            ["10:03","",""],
            ["10:06","",""],
            ["10:15","",""],
            ["10:25","",""],
            ["10:35","",""],
            ["10:45","",""],
            ["10:55","",""],
            ["11:05","",""],
            ["11:15","",""],
            ["11:25","",""],
            ["11:35","",""],
            ["11:45","",""],
            ["11:55","",""],
            ["12:05","",""],
            ["12:15","",""],
            ["12:25","",""],
            ["12:33","",""],
            ["12:36","",""],
            ["12:50","",""],
            ["13:05","",""],
            ["13:15","",""],
            ["13:25","",""],
            ["13:33","",""],
            ["13:36","",""],
            ["13:45","",""],
            ["13:53","",""],
            ["13:56","",""],
            ["14:15","",""],
            ["14:25","",""],
            ["14:35","",""],
            ["14:45","",""],
            ["14:55","",""],
            ["15:10","",""],
            ["15:30","",""],
            ["15:50","",""],
            ["16:03","",""],
            ["16:06","",""],
            ["16:20","",""],
            ["16:40","",""],
            ["17:10","",""],
            ["17:20","",""],
            ["17:35","",""],
            ["17:45","",""],
            ["17:55","",""],
            ["18:05","",""],
            ["18:13","",""],
            ["18:16","",""],
            ["18:23","",""],
            ["18:26","",""],
            ["18:40","",""],
            ["19:05","",""],
            ["19:15","",""],
            ["19:25","",""],
            ["19:35","",""],
            ["19:45","",""],
            ["19:55","",""],
            ["20:05","",""],
            ["20:25","",""],
            ["20:45","",""],
            ["20:55","",""],
            ["21:03","",""],
            ["21:10","",""],
            ["21:40","",""],
            ["21:53","",""],
            ["21:56","",""],
            ["22:10","",""],
            ["22:30","",""]
        ],
        "hl2rb":[
            ["07:32","",""],
            ["07:36","",""],
            ["07:42","",""],
            ["07:45","",""],
            ["07:51","",""],
            ["07:54","",""],
            ["07:57","",""],
            ["08:10","",""],
            ["08:18","",""],
            ["08:24","",""],
            ["08:30","",""],
            ["08:48","",""],
            ["08:54","",""],
            ["08:57","",""],
            ["09:13","",""],
            ["09:23","",""],
            ["09:26","",""],
            ["09:33","",""],
            ["09:36","",""],
            ["09:38","",""],
            ["09:43","",""],
            ["09:48","",""],
            ["09:53","",""],
            ["09:55","",""],
            ["09:58","",""],
            ["10:05","",""],
            ["10:15","",""],
            ["10:25","",""],
            ["10:35","",""],
            ["10:45","",""],
            ["10:55","",""],
            ["11:10","",""],
            ["11:30","",""],
            ["11:40","",""],
            ["11:55","",""],
            ["12:05","",""],
            ["12:15","",""],
            ["12:25","",""],
            ["12:35","",""],
            ["12:45","",""],
            ["13:05","",""],
            ["13:23","",""],
            ["13:26","",""],
            ["13:33","",""],
            ["13:36","",""],
            ["13:45","",""],
            ["13:55","",""],
            ["14:10","",""],
            ["14:30","",""],
            ["15:10","",""],
            ["15:20","",""],
            ["15:40","",""],
            ["15:53","",""],
            ["15:56","",""],
            ["16:05","",""],
            ["16:20","",""],
            ["16:40","",""],
            ["17:00","",""],
            ["17:20","",""],
            ["17:26","",""],
            ["17:36","",""],
            ["17:46","",""],
            ["17:53","",""],
            ["18:06","",""],
            ["18:16","",""],
            ["18:23","",""],
            ["18:26","",""],
            ["18:35","",""],
            ["18:50","",""],
            ["19:05","",""],
            ["19:15","",""]
        ],
        "coe2hl":[
            ["07:20","",""],
            ["07:25","",""],
            ["07:30","",""],
            ["07:40","",""],
            ["07:46","",""],
            ["07:50","",""],
            ["08:00","",""],
            ["08:05","",""],
            ["08:10","",""],
            ["08:15","",""],
            ["08:20","",""],
            ["08:25","",""],
            ["08:32","",""],
            ["08:36","",""],
            ["08:42","",""],
            ["08:45","",""],
            ["08:50","",""],
            ["08:55","",""],
            ["09:00","",""],
            ["09:05","",""],
            ["09:10","",""],
            ["09:15","",""],
            ["09:20","",""],
            ["09:25","",""],
            ["09:30","",""],
            ["09:40","",""],
            ["09:50","",""],
            ["10:00","",""],
            ["10:10","",""],
            ["10:20","",""],
            ["10:30","",""],
            ["10:40","",""],
            ["10:50","",""],
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
            ["12:45","",""],
            ["12:55","",""],
            ["13:00","",""],
            ["13:10","",""],
            ["13:20","",""],
            ["13:40","",""],
            ["13:50","",""],
            ["14:00","",""],
            ["14:05","",""],
            ["14:10","",""],
            ["14:20","",""],
            ["14:30","",""],
            ["14:40","",""],
            ["14:50","",""],
            ["15:00","",""],
            ["15:20","",""],
            ["15:40","",""],
            ["15:45","",""],
            ["15:55","",""],
            ["16:00","",""],
            ["16:10","",""],
            ["16:30","",""],
            ["16:50","",""],
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
            ["18:35","",""],
            ["18:50","",""],
            ["19:00","",""],
            ["19:10","",""],
            ["19:20","",""],
            ["19:30","",""],
            ["19:40","",""],
            ["19:50","",""],
            ["20:00","",""],
            ["20:10","",""],
            ["20:20","",""],
            ["20:30","",""],
            ["20:50","",""],
            ["21:00","",""],
            ["21:20","",""],
            ["21:30","",""],
            ["21:50","",""],
            ["22:00","",""],
            ["22:15","",""],
            ["22:45","",""],
            ["23:00","",""]],
        "hl2coe":[
            ["07:00","",""],
            ["07:05","",""],
            ["07:10","",""],
            ["07:15","",""],
            ["07:20","",""],
            ["07:23","",""],
            ["07:26","",""],
            ["07:29","",""],
            ["07:39","",""],
            ["07:48","",""],
            ["08:00","",""],
            ["08:05","",""],
            ["08:15","",""],
            ["08:21","",""],
            ["08:27","",""],
            ["08:35","",""],
            ["08:40","",""],
            ["08:45","",""],
            ["08:51","",""],
            ["09:00","",""],
            ["09:03","",""],
            ["09:06","",""],
            ["09:10","",""],
            ["09:15","",""],
            ["09:20","",""],
            ["09:25","",""],
            ["09:30","",""],
            ["09:35","",""],
            ["09:40","",""],
            ["09:50","",""],
            ["10:00","",""],
            ["10:10","",""],
            ["10:20","",""],
            ["10:30","",""],
            ["10:40","",""],
            ["10:50","",""],
            ["11:00","",""],
            ["11:20","",""],
            ["11:35","",""],
            ["11:45","",""],
            ["11:50","",""],
            ["12:00","",""],
            ["12:10","",""],
            ["12:20","",""],
            ["12:30","",""],
            ["12:40","",""],
            ["12:50","",""],
            ["12:55","",""],
            ["13:00","",""],
            ["13:10","",""],
            ["13:20","",""],
            ["13:30","",""],
            ["13:40","",""],
            ["13:50","",""],
            ["14:00","",""],
            ["14:20","",""],
            ["14:30","",""],
            ["14:40","",""],
            ["14:50","",""],
            ["15:00","",""],
            ["15:30","",""],
            ["15:35","",""],
            ["15:50","",""],
            ["16:00","",""],
            ["16:10","",""],
            ["16:30","",""],
            ["16:50","",""],
            ["17:10","",""],
            ["17:15","",""],
            ["17:25","",""],
            ["17:30","",""],
            ["17:35","",""],
            ["17:40","",""],
            ["17:45","",""],
            ["17:50","",""],
            ["17:55","",""],
            ["18:00","",""],
            ["18:05","",""],
            ["18:10","",""],
            ["18:15","",""],
            ["18:20","",""],
            ["18:30","",""],
            ["18:40","",""],
            ["18:45","",""],
            ["18:55","",""],
            ["19:00","",""],
            ["19:10","",""],
            ["19:20","",""],
            ["19:25","",""],
            ["19:30","",""],
            ["19:35","",""],
            ["19:40","",""],
            ["19:50","",""],
            ["20:00","",""],
            ["20:10","",""],
            ["20:20","",""],
            ["20:30","",""],
            ["20:40","",""],
            ["20:50","",""],
            ["21:00","",""],
            ["21:10","",""],
            ["21:20","",""],
            ["21:30","",""],
            ["21:40","",""],
            ["21:50","",""],
            ["22:00","",""],
            ["22:15","",""],
            ["22:30","",""],
            ["22:40","",""]],
        "ip2lh" : [["11:50", "", ""],["17:45", "", ""]]
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

        var busdata_hl2rb; // high land - research building
        var busdata_rb2hl; // research building - high land

        var busdata_ip2lh; // i park - lychee hill

        // high land - COE
        var tmp = update_bus_status(bus_data_json.hl2coe);
        busdata_hl2coe = tmp.now_table;
        var now_bus_row_hl2coe = tmp.row;
        var ins_table_hl2coe = $('#work-bus-hl2coe').DataTable($.extend(true, { data: busdata_hl2coe }, dtb_config));
        var now_bus_offset = $(ins_table_hl2coe.row(Math.min(now_bus_row_hl2coe, busdata_hl2coe.length)).node()).offset().top - $(ins_table_hl2coe.row(0).node()).offset().top;
        $("#bus-table-hl2coe .dataTables_scrollBody").scrollTop(now_bus_offset);

        // COE - high land
        var tmp = update_bus_status(bus_data_json.coe2hl);
        busdata_coe2hl = tmp.now_table;
        var now_bus_row_coe2hl = tmp.row;
        var ins_table_coe2hl = $('#work-bus-coe2hl').DataTable($.extend(true, { data: busdata_coe2hl }, dtb_config));
        var now_bus_offset = $(ins_table_coe2hl.row(Math.min(now_bus_row_coe2hl, busdata_coe2hl.length)).node()).offset().top - $(ins_table_coe2hl.row(0).node()).offset().top;
        $("#bus-table-coe2hl .dataTables_scrollBody").scrollTop(now_bus_offset);

        // high land - research building
        var tmp = update_bus_status(bus_data_json.hl2rb);
        busdata_hl2rb = tmp.now_table;
        var now_bus_row_hl2rb = tmp.row;
        var ins_table_hl2rb = $('#work-bus-hl2rb').DataTable($.extend(true, { data: busdata_hl2rb }, dtb_config));
        var now_bus_offset = $(ins_table_hl2rb.row(Math.min(now_bus_row_hl2rb, busdata_hl2rb.length)).node()).offset().top - $(ins_table_hl2rb.row(0).node()).offset().top;
        $("#bus-table-hl2rb .dataTables_scrollBody").scrollTop(now_bus_offset);

        // research building - high land
        var tmp = update_bus_status(bus_data_json.rb2hl);
        busdata_rb2hl = tmp.now_table;
        var now_bus_row_rb2hl = tmp.row;
        var ins_table_rb2hl = $('#work-bus-rb2hl').DataTable($.extend(true, { data: busdata_rb2hl }, dtb_config));
        var now_bus_offset = $(ins_table_rb2hl.row(Math.min(now_bus_row_rb2hl, busdata_rb2hl.length)).node()).offset().top - $(ins_table_rb2hl.row(0).node()).offset().top;
        $("#bus-table-rb2hl .dataTables_scrollBody").scrollTop(now_bus_offset);

        // i park - lychee hill
        var tmp = update_bus_status(bus_data_json.ip2lh);
        busdata_ip2lh = tmp.now_table;
        var now_bus_row_ip2lh = tmp.row;
        var ins_table_ip2lh = $('#work-bus-ip2lh').DataTable($.extend(true, { data: busdata_ip2lh }, dtb_config));
        var now_bus_offset = $(ins_table_ip2lh.row(Math.min(now_bus_row_ip2lh, busdata_ip2lh.length)).node()).offset().top - $(ins_table_ip2lh.row(0).node()).offset().top;
        $("#bus-table-ip2lh .dataTables_scrollBody").scrollTop(now_bus_offset);
    }

    document.addEventListener('DOMContentLoaded', build_all_table, false);

    $(document).ready(function () {
        build_all_table();
    });
    }
  }
</script>
