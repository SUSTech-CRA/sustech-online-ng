<template>

  <div class="map-container" ref="myMap"></div>
  <span>Time drift: {{ time_difference }} sec.</span>
  <!--  <div id="map-style-menu">-->
  <!--    <input id="osm-street" type="radio" name="rtoggle" value="light">-->
  <!--    <label for="osm-street">light</label>-->
  <!--    <input id="osm-blue" type="radio" name="rtoggle" value="dark">-->
  <!--    <label for="osm-blue">dark</label>-->
  <!--  </div>-->
</template>

<script>
import maplibre from 'maplibre-gl';
import axios from "axios";


export default {
  name: "MyMap",

  data: () => ({
    map_style_url: "https://mirrors.sustech.edu.cn/osm-tile/styles/osm-bright/style.json",
    map_text_colour: "#000000",
    bus_location_data_api: [],
    bus_location_data_display: [],
    bus_plate_hash: {
      "298": {"plate": "粤BDF298"},
      "363": {"plate": "粤BDF363"},
      "8040": {"plate": "粤BDF040"},
      "8147": {"plate": "粤BDF147"},
      "8267": {"plate": "粤BDF267"},
      "8330": {"plate": "粤BDF330"},
      "8335": {"plate": "粤BDF335"},
      "8338": {"plate": "粤BDF338"},
      "8345": {"plate": "粤BDF345"},
      "8365": {"plate": "粤BDF365"},
      "8371": {"plate": "粤BDF371"},
      "8411": {"plate": "粤BDF411"},
      "8421": {"plate": "粤BDF421"},
      "8430": {"plate": "粤BDF430"},
      "8447": {"plate": "粤BDE447"},
      "8458": {"plate": "粤BDF458"},
      "8470": {"plate": "粤BDF470"},
      "8471": {"plate": "粤BDF471"},
      "18447": {"plate": "粤BDF447"}
    },
    geojson_line_1: [[113.99739584160139,22.610765716856296],[113.99770244929088,22.610602750604695],[113.99771094950285,22.61059767778233],[113.99771890653385,22.610591789421974],[113.99772624241524,22.61058514322198],[113.99773288526481,22.610577804306548],[113.99773876999119,22.610569844587616],[113.99824514560808,22.609808813574297],[113.998249208217,22.609802159245984],[113.99825274007058,22.60979520864264],[113.99898879543889,22.60819510708253],[113.99899240486543,22.608186143427105],[113.99899513228698,22.608176873246407],[113.99899695223624,22.60816738310082],[113.9989978477194,22.608157761604655],[113.99899781037489,22.60814809859871],[113.99899684055141,22.608138484311375],[113.99876376465981,22.606584405046835],[113.99876186005746,22.60657488398115],[113.99875904105679,22.60656559250995],[113.9987553342348,22.606556618231554],[113.99875077453878,22.606548045753847],[113.9987454049567,22.606539955896604],[113.99840124581259,22.606072409367975],[113.99839530892635,22.606065092796133],[113.9983887097732,22.60605836746942],[113.99838150693964,22.606052293094507],[113.9983737643716,22.606046923598996],[113.99836555080671,22.606042306652647],[113.99835693916405,22.60603848324417],[113.99834800589677,22.606035487317342],[113.99774294809698,22.605863822610463],[113.99773312637,22.605861563911226],[113.99772312717697,22.605860305268262],[113.99771305207776,22.60586005946536],[113.99770300340316,22.605860828999095],[113.99769308321561,22.605862606053456],[113.9976833922725,22.605865372579256],[113.996462081496,22.60628164325351],[113.99540699384544,22.60655007340282],[113.99537688636465,22.60638436471066],[113.99537457846512,22.606374521317747],[113.99537128843397,22.606364961271755],[113.99536704990152,22.60635578229431],[113.99536190619351,22.606347078211808],[113.99535590988829,22.606338937996323],[113.99534912227939,22.606331444856142],[113.99534161274892,22.60632467538524],[113.99533345805837,22.60631869878032],[113.995324741564,22.606313576133513],[113.99531555236477,22.60630935980789],[113.99491868014185,22.60615102642152],[113.99446803578164,22.605922922486105],[113.993628105381,22.605432281601264],[113.99361436378835,22.60541624974317],[113.99361283376653,22.605399929510398],[113.99403523011212,22.604697356220907],[113.99427914343141,22.604297776694622],[113.99454570612934,22.60407119840138],[113.99455101208882,22.604066349285663],[113.99481121659123,22.60381079129223],[113.99481565952753,22.603806137576637],[113.99515576701069,22.603426136652367],[113.99549648383878,22.60304833084697],[113.99570726599393,22.60298417975627],[113.99623267681147,22.60298349183956],[113.99686127008054,22.603078201644227],[113.99770971150042,22.60339811537432],[113.9977201426685,22.603401409146592],[113.99773087118898,22.603403543871796],[113.99774176868631,22.603404494006192],[113.99787229266123,22.603408704456996],[113.99788215074415,22.603408536156227],[113.9978919443383,22.60340739789566],[113.99790157824009,22.603405300740327],[113.99791095879819,22.603402265076713],[113.9979199948241,22.603398320414538],[113.9979285984785,22.60339350509991],[113.99793668612513,22.60338786594256],[113.99794417914393,22.60338145776082],[113.9980199672584,22.603309880097154],[113.99802683618526,22.603302715227613],[113.99803296099675,22.603294904709315],[113.99803828135273,22.603286525489548],[113.99804274483841,22.603277660118295],[113.9980463074806,22.603268395934986],[113.99804893418107,22.603258824208055],[113.99810024403767,22.60302739683338],[113.99810134953593,22.603021608404344],[113.99816665521513,22.602614977726315],[113.99835030416712,22.60216721735362],[113.99856193554633,22.601842951121434],[113.99880470491176,22.601545730488308],[113.99881031760918,22.601538156502247],[113.99881519216395,22.60153008765145],[113.99881928525701,22.6015215956419],[113.99882256051407,22.601512755940064],[113.99882498882864,22.601503647102295],[113.9988265486209,22.601494350076678],[113.99882722602932,22.60148494748368],[113.9988344317295,22.601194082723367],[113.99895072783376,22.600790214181995],[113.9990602569799,22.600602634774226],[113.99921879840926,22.600476730796977],[113.99919877407567,22.60043325336671],[113.99912215529531,22.600408139732792],[113.99802751236375,22.600038565633355],[113.99775839514615,22.599792681543633],[113.99730187808832,22.598960946075003],[113.99590977592047,22.5977773063799],[113.99576459924215,22.59751983095157],[113.99543299558397,22.59717440812865],[113.9951938686417,22.5966914370548],[113.99501583215859,22.59639577584673],[113.99463229185628,22.596104860560743],[113.99420385593578,22.595969591352997],[113.99382768199821,22.59595993652297],[113.9938169603822,22.59596023674876],[113.99380633259398,22.59596168357378],[113.99379592089899,22.59596426035329],[113.99378584507669,22.595967937443213],[113.99321594303598,22.596211295714554],[113.99320787618828,22.59621517605677],[113.99320018866534,22.59621976224022],[113.99319294206812,22.596225017515316],[113.9931861944644,22.596230899770962],[113.99265363550316,22.596738860232236],[113.99200633643709,22.59716671060916],[113.99157366427197,22.5971462468509],[113.99090478252046,22.5969456920235],[113.99089489978897,22.59694326928491],[113.99088482201618,22.596941863390235],[113.9908746535454,22.596941488895837],[113.99086449965898,22.596942149679155],[113.99039476525739,22.596996829390125],[113.99038484213679,22.596998494112995],[113.99037513653565,22.597001147588333],[113.99036574671312,22.59700476295245],[113.99035676773141,22.597009303603546],[113.99034829049342,22.59701472357223],[113.99034040082233,22.597020967986946],[113.99033317859293,22.597027973629473],[113.99032669692278,22.59703566957495],[113.99032102143205,22.597043977909916],[113.99031620957922,22.597052814521092],[113.9903123100793,22.597062089946967],[113.99030936241067,22.59707171028347],[113.99020088374516,22.59750194984639],[113.99019873660492,22.597513104722935],[113.99019786842672,22.597524431141103],[113.99019829041364,22.59753578294312],[113.99030139387085,22.59862956838946],[113.99030286538937,22.59863964935582],[113.9903053549666,22.598649528285655],[113.99030883676294,22.59865910264432],[113.99048378356784,22.59907317753902],[113.99048795907763,22.599081866470787],[113.99049295183752,22.59909011297101],[113.99049871544861,22.599097840402962],[113.99050519634824,22.599104976953754],[113.99051233430787,22.599111456301692],[113.99052006299269,22.59911721823263],[113.99075599101839,22.599276010611053],[113.99076619844251,22.59928203412041],[113.99126127611241,22.599535900836155],[113.9917686585336,22.6000105337692],[113.99191211157755,22.60053218120178],[113.99183362959826,22.601016496848214],[113.99144872111891,22.60153952301182],[113.99077751816642,22.602118998056795],[113.99045237812743,22.602377905865616],[113.9904454049912,22.602384007276413],[113.99043902651476,22.60239072790739],[113.99010219314502,22.60332391993846]],
    geojson_line_2: [[113.991459678304494, 22.599604921099228], [113.991896923307195, 22.599936617485952], [113.992010569899804, 22.6005318195689], [113.991917242336896, 22.60102266627295], [113.991719622194296, 22.601431625928001], [113.991526274764496, 22.601612498395962], [113.992045849875581, 22.60262745159568], [113.992339522764453, 22.602968084896109], [113.992798857282978, 22.603280910653833], [113.99298710913483, 22.60350336409337], [113.993853067653333, 22.603677155592816], [113.994199451060737, 22.604268045049292], [113.993864148579476, 22.604784676421257], [113.993478403889895, 22.605480929778221], [113.995278497141001, 22.606402240970631], [113.995327766644706, 22.606673415602611], [113.996490585116902, 22.6063775771138], [113.997715653744606, 22.60596002561628], [113.998320711544395, 22.60613169032316], [113.998664870688501, 22.606599236851789], [113.998897946580101, 22.608153316116329], [113.998161891211794, 22.609753417676441], [113.9976555155949, 22.610514448689759], [113.997348907905405, 22.61067741494136]],
    bldg_geojson: {},
    gate_geojson: {},
    stations_geojson: {
      "type": "FeatureCollection", "features": [
        {
          "type": "Feature",
          "geometry": {"type": "Point", "coordinates": [113.99020, 22.60336]},
          "properties": {"name": "工学院 COE"}
        },
        {
          "type": "Feature",
          "geometry": {"type": "Point", "coordinates": [113.99153, 22.599643]},
          "properties": {"name": "科研楼 Research Building"}
        },
        {
          "type": "Feature",
          "geometry": {"type": "Point", "coordinates": [113.990399, 22.597132]},
          "properties": {"name": "七号门 Gate7"}
        },
        {
          "type": "Feature",
          "geometry": {"type": "Point", "coordinates": [113.992403, 22.597011]},
          "properties": {"name": "行政楼 Administration Building"}
        },
        {
          "type": "Feature",
          "geometry": {"type": "Point", "coordinates": [113.99440,22.59618]},
          "properties": {"name": "1号门 Gate1 (下行DN)"}
        },
        {
          "type": "Feature",
          "geometry": {"type": "Point", "coordinates": [113.99381,22.59604]},
          "properties": {"name": "1号门 Gate1 (上行UP)"}
        },
        {
          "type": "Feature",
          "geometry": {"type": "Point", "coordinates": [113.99585,22.59788]},
          "properties": {"name": "商学院 Business School"}
        },
        {
          "type": "Feature",
          "geometry": {"type": "Point", "coordinates": [113.99878,22.60041]},
          "properties": {"name": "3号门 Gate3"}
        },
        {
          "type": "Feature",
          "geometry": {"type": "Point", "coordinates": [113.998329, 22.601975]},
          "properties": {"name": "专家公寓 Guest Houses"}
        },
        {
          "type": "Feature",
          "geometry": {"type": "Point", "coordinates": [113.997811, 22.603325]},
          "properties": {"name": "教工餐厅 Faculty Cafteria"}
        },
        {
          "type": "Feature",
          "geometry": {"type": "Point", "coordinates": [113.995981, 22.60293]},
          "properties": {"name": "社康中心 C.Health.Center"}
        },
        {
          "type": "Feature",
          "geometry": {"type": "Point", "coordinates": [113.993824, 22.604854]},
          "properties": {"name": "学生宿舍 Stu. Dormitories"}
        },
        {
          "type": "Feature",
          "geometry": {"type": "Point", "coordinates": [113.995238, 22.606518]},
          "properties": {"name": "荔园 Lychee Hill"}
        },
        {
          "type": "Feature",
          "geometry": {"type": "Point", "coordinates": [113.996732, 22.606278]},
          "properties": {"name": "创园 Chuang Yuan"}
        },
        {
          "type": "Feature",
          "geometry": {"type": "Point", "coordinates": [113.998372, 22.606102]},
          "properties": {"name": "慧园 Hui Yuan"}
        },
        {
          "type": "Feature",
          "geometry": {"type": "Point", "coordinates": [113.997473, 22.610667]},
          "properties": {"name": "欣园 Joy Highland"}
        }
      ]
    },
    bus_marker_arr: [],
    map: [],
    time_difference: 0,
    timer: {}
  }),

  async created() {
    //fetch bus location (current no need)
    // const realtime_location_api_data = await axios.get(`https://bus.sustcra.com/api/v1/bus/monitor_osm/`)
    // this.bus_location_data_api = realtime_location_api_data.data;
    // console.log("fetch complete")

    // fetch geojson
    const bldg_geojson = await axios.get(`https://bus.sustcra.com/geojson/sustech_bldg.json`)
    this.bldg_geojson = bldg_geojson.data;
    const gate_geojson = await axios.get(`https://bus.sustcra.com/geojson/sustech_gate.json`)
    this.gate_geojson = gate_geojson.data;
    console.log("Fetch geojson of sustech complete")

  },


  //update data
  methods: {
    async fetch_bus() {
      const realtime_location_api_data = await axios.get(`https://bus.sustcra.com/api/v2/monitor_osm/`)
      this.bus_location_data_api = realtime_location_api_data.data;
      const d = new Date();
      console.log("bus location data fetched at " + parseInt(d.getTime() / 1000,));
      //console log the diff of report time and display time
      if (typeof this.bus_location_data_api[0].time_mt != "undefined") {
        this.time_difference = parseInt(d.getTime() / 1000 - this.bus_location_data_api[0].time_mt);
        // log current time and report time
        console.log("The clock drift is " + this.time_difference + " seconds");
      }
      this.update_location()
    },
    calculateBusAngle(lat1, lon1, lat2, lon2) {
      const dLon = (lon2 - lon1);

      const y = Math.sin(dLon) * Math.cos(lat2);
      const x = Math.cos(lat1) * Math.sin(lat2) - Math.sin(lat1)
          * Math.cos(lat2) * Math.cos(dLon);

      let brng = Math.atan2(y, x);

      brng = brng * (180 / Math.PI);
      brng = (brng + 360) % 360;
      brng = 360 - brng; // 如果需要顺时针度数，请移除此行

      return brng;
    },
    findNearestPointOnSegment(point, segmentStart, segmentEnd) {
      const A = point[0] - segmentStart[0];
      const B = point[1] - segmentStart[1];
      const C = segmentEnd[0] - segmentStart[0];
      const D = segmentEnd[1] - segmentStart[1];

      const dot = A * C + B * D;
      const len_sq = C * C + D * D;
      const param = (len_sq !== 0) ? dot / len_sq : -1;

      let xx, yy;

      if (param < 0) {
        xx = segmentStart[0];
        yy = segmentStart[1];
      } else if (param > 1) {
        xx = segmentEnd[0];
        yy = segmentEnd[1];
      } else {
        xx = segmentStart[0] + param * C;
        yy = segmentStart[1] + param * D;
      }

      return [xx, yy];
    },
    findNearestSegment(busLocation, geojsonLine) {
      let closestSegment = [geojsonLine[0], geojsonLine[1]];
      let minDistance = Number.MAX_VALUE;

      for (let i = 0; i < geojsonLine.length - 1; i++) {
        const point1 = geojsonLine[i];
        const point2 = geojsonLine[i + 1];
        const distance = this.calculateDistance(busLocation, this.findNearestPointOnSegment(busLocation, point1, point2));

        if (distance < minDistance) {
          minDistance = distance;
          closestSegment = [point1, point2];
        }
      }

      return closestSegment;
    },
    calculateDistance(point1, point2) {
      return Math.sqrt(Math.pow(point2[0] - point1[0], 2) + Math.pow(point2[1] - point1[1], 2));
    },
    update_location: function () {
      this.display_data = [];
      this.bus_marker_arr.forEach((marker) => marker.remove())
      let i;
      for (i = 0; i < this.bus_location_data_api.length; i++) {
        // if current time - report time < 300s, then display
        if (parseInt(new Date().getTime() / 1000) - this.bus_location_data_api[i].time_mt < 300) {
          const busLocation = [this.bus_location_data_api[i].lng, this.bus_location_data_api[i].lat];
          if (this.bus_location_data_api[i].route_code.slice(-1) === '1') { //XYBS1
            this.bus_location_data_api[i].route_geojson = this.geojson_line_1
          } else { //XYBS2
            this.bus_location_data_api[i].route_geojson = this.geojson_line_2
          }
          const closestSegment = this.findNearestSegment(busLocation, this.bus_location_data_api[i].route_geojson);
          const busHeadingAngle = this.calculateBusAngle(busLocation[1], busLocation[0], closestSegment[1][1], closestSegment[1][0]);


          // create a DOM element for the marker

          //up direction (0)
          var bus_marker_up = document.createElement('div');
          bus_marker_up.className = 'marker';
          bus_marker_up.style.backgroundImage = 'url(https://bus.sustcra.com/bus-top-view.png)';
          bus_marker_up.style.width = '30px';
          bus_marker_up.style.height = '30px';
          bus_marker_up.style.backgroundSize = 'cover';

          //down direction (1)
          var bus_marker_down = document.createElement('div');
          bus_marker_down.className = 'marker';
          bus_marker_down.style.backgroundImage = 'url(https://bus.sustcra.com/bus-top-view.png)';
          bus_marker_down.style.width = '30px';
          bus_marker_down.style.height = '30px';
          bus_marker_down.style.backgroundSize = 'cover';
          bus_marker_down.style.cursor = "pointer";

          // var bus_marker = document.createElement('div');
          // bus_marker.className = 'marker';
          // bus_marker.style.backgroundImage = 'url(https://bus.sustcra.com/bus-top-view.png)';
          // bus_marker.style.width = 35 + 'px';
          // bus_marker.style.height = 35 + 'px';
          // bus_marker.style.backgroundSize = 'cover';
          // bus_marker_up.style.cursor = "pointer";


          // add marker to map
          if (this.bus_location_data_api[i].route_dir === 0) { //up
            // console.log(busHeadingAngle)
            this.bus_location_data_api[i].course = busHeadingAngle - 180
            this.bus_location_data_api[i].route_dir_text = '上行UP'
            var marker = new maplibre.Marker({element: bus_marker_up})
              .setLngLat([this.bus_location_data_api[i].lng, this.bus_location_data_api[i].lat])
              .setRotation(parseInt(this.bus_location_data_api[i].course))
              .setPopup(
                  new maplibre.Popup({offset: 20}) // add popups
                      .setHTML(
                          '<div style="line-height: 1.2;">' + // 设置外层 div 的行距
                          '<p class="car-plate" style="margin: 0; line-height: 1.2;">' + // 为每个 p 标签设置行距和边距
                          'Plate: <b>' + this.bus_location_data_api[i].id +
                          '</b></p><p style="margin: 0; line-height: 1.2;">' +
                          'Speed: <b>' + this.bus_location_data_api[i].speed + " km/h" +
                          '</b></p><p style="margin: 0; line-height: 1.2;">' + 'Line <b>' + this.bus_location_data_api[i].route_code.slice(-1) + ' ' + this.bus_location_data_api[i].route_dir_text +
                          '</b></p>' +
                          '</div>'
                      )
              )
              .addTo(this.map);
          } else {
            this.bus_location_data_api[i].course = busHeadingAngle
            this.bus_location_data_api[i].route_dir_text = '下行DOWN'
            var marker = new maplibre.Marker({element: bus_marker_down})
                .setLngLat([this.bus_location_data_api[i].lng, this.bus_location_data_api[i].lat])
                .setRotation(parseInt(this.bus_location_data_api[i].course))
                .setPopup(
                    new maplibre.Popup({offset: 20}) // add popups
                        .setHTML(
                            '<div style="line-height: 1.2;">' + // 设置外层 div 的行距
                            '<p class="car-plate" style="margin: 0; line-height: 1.2;">' + // 为每个 p 标签设置行距和边距
                            'Plate: <b>' + this.bus_location_data_api[i].id +
                            '</b></p><p style="margin: 0; line-height: 1.2;">' +
                            'Speed: <b>' + this.bus_location_data_api[i].speed + " km/h" +
                            '</b></p><p style="margin: 0; line-height: 1.2;">' + 'Line <b>' + this.bus_location_data_api[i].route_code.slice(-1) + ' ' + this.bus_location_data_api[i].route_dir_text +
                            '</b></p>' +
                            '</div>'
                        )
                )
                .addTo(this.map);
          }

          // var marker = new maplibre.Marker(bus_marker)
          //     .setLngLat([this.bus_location_data_api[i].lng, this.bus_location_data_api[i].lat])
          //     .setRotation(parseInt(this.bus_location_data_api[i].course))
          //     .setPopup(
          //         new maplibre.Popup({offset: 25}) // add popups
          //             .setHTML(
          //                 '<p class="car-plate">' +
          //                 'Plate: <b>' + this.bus_plate_hash[this.bus_location_data_api[i].id].plate +
          //                 '</b></p><p>' +
          //                 'Speed: <b>' + this.bus_location_data_api[i].speed + "km/h" +
          //                 '</b></p>'
          //             )
          //     )
          //     .addTo(this.map);


          // var marker = new maplibre.Marker(bus_marker)
          //     .setLngLat([this.bus_location_data_api[i].lng, this.bus_location_data_api[i].lat])
          //     .setRotation(parseInt(this.bus_location_data_api[i].course))
          //     .setPopup(
          //         new maplibre.Popup({offset: 25}) // add popups
          //             .setHTML(
          //                 '<p class="car-plate">' +
          //                 'Plate: <b>' + this.bus_location_data_api[i].id +
          //                 '</b></p><p>' +
          //                 'Speed: <b>' + this.bus_location_data_api[i].speed + "km/h" +
          //                 '</b></p><p>' + 'Next Sta: <b>' + this.bus_location_data_api[i].next_station_string +
          //                 '</b></p>'
          //             )
          //     )
          //     .addTo(this.map);

          this.bus_marker_arr.push(marker)


        }
      }

    },
    async refresh() {
      await this.fetch_bus();
    },


  },

  async mounted() {
    const initialState = {
      lng: 113.99373,
      lat: 22.60308,
      zoom: 14,
    };

    const location_data = {
      bus_location_data: this.bus_location_data,
      geojson_line_1: this.geojson_line_1,
      geojson_line_2: this.geojson_line_2
    }

    //determine day or night
    const userPrefersDark = window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches;
    const userPrefersLight = window.matchMedia && window.matchMedia('(prefers-color-scheme: light)').matches;
    if (await userPrefersDark) {
      console.log("dark mode enabled.")
      this.map_text_colour = "#FFFFFF"
      this.map_style_url = "https://mirrors.sustech.edu.cn/osm-tile/styles/osm-blue/style.json";
    }

    this.map = new maplibre.Map({
      container: this.$refs.myMap,
      style: this.map_style_url,
      center: [initialState.lng, initialState.lat],
      zoom: initialState.zoom
    });
    var nav = new maplibre.NavigationControl();
    this.map.addControl(nav, 'top-left');
    this.map.addControl(new maplibre.FullscreenControl(), 'top-left');

    class MapLockControl {
      onAdd(map) {
        this._map = map;
        this._container = document.createElement('div');
        this._container.className = 'maplibregl-ctrl maplibregl-ctrl-group mapboxgl-ctrl mapboxgl-ctrl-group';

        const button = this._createButton('interaction-lock')
        this._container.appendChild(button);
        // 初始化锁定按钮，默认为锁定
        button.click();
        return this._container;
      }
      onRemove() {
        this._container.parentNode.removeChild(this._container);
        this._map = undefined;
      }
      _createButton(className) {
        const el = window.document.createElement('button')
        el.className = className;
        el.isInteractionEnabled = true;

        el.addEventListener('click', (e) => {
          el.isInteractionEnabled = !el.isInteractionEnabled;
          if (el.isInteractionEnabled) {
            this._map.dragPan.enable();
            this._map.boxZoom.enable();
            this._map.doubleClickZoom.enable();
            this._map.touchZoomRotate.enable();
            this._map.scrollZoom.enable();
            el.innerHTML = '<span class="maplibregl-ctrl-icon mapboxgl-ctrl-icon map-interaction-allow" aria-hidden="true"></span>';
          } else {
            this._map.dragPan.disable();
            this._map.boxZoom.disable();
            this._map.doubleClickZoom.disable();
            this._map.touchZoomRotate.disable();
            this._map.scrollZoom.disable();
            el.innerHTML = '<span class="maplibregl-ctrl-icon mapboxgl-ctrl-icon map-interaction-lock" aria-hidden="true"></span>';
          }
          e.preventDefault();
          e.stopPropagation();
        }, false)
        return el;
      }
    }
    const mapLockControl = new MapLockControl();
    this.map.addControl(mapLockControl, 'top-left');

    // Add geolocate control to the map.
    this.map.addControl(
        new maplibre.GeolocateControl({
          positionOptions: {
            enableHighAccuracy: true
          },
          // When active the map will receive updates to the device's location as it changes.
          trackUserLocation: true,
          // Draw an arrow next to the location dot to indicate which direction the device is heading.
          showUserHeading: true
        })
    );


    this.map.on('load', () => {
      this.map.addSource('line1', {
        'type': 'geojson',
        'data': {
          'type': 'Feature',
          'properties': {},
          'geometry': {
            'type': 'LineString',
            'coordinates': location_data.geojson_line_1
          }
        }
      });

      this.map.addSource('line2', {
        'type': 'geojson',
        'data': {
          'type': 'Feature',
          'properties': {},
          'geometry': {
            'type': 'LineString',
            'coordinates': location_data.geojson_line_2
          }
        }
      });

      this.map.addLayer({
        'id': 'line1',
        'type': 'line',
        'source': 'line1',
        'layout': {
          'line-join': 'round',
          'line-cap': 'round'
        },
        'paint': {
          'line-color': '#f7911d',
          'line-width': 3
          // 'line-dasharray': [1, 2]
        }
      });

      this.map.addLayer({
        'id': 'line2',
        'type': 'line',
        'source': 'line2',
        'layout': {
          'line-join': 'round',
          'line-cap': 'round'
        },
        'paint': {
          'line-color': '#29abe2',
          'line-width': 3
          // 'line-dasharray': [1, 2]
        }
      });

      //add station

      this.map.loadImage(
          'https://bus.sustcra.com/station_icon.png',
          (error, image) => {
            if (error) throw error;
            this.map.addImage('bus-station', image);


            //image of buildings
            this.map.loadImage(
                'https://bus.sustcra.com/bldg_icon.png',
                (error, image) => {
                  this.map.addImage('bldg-icon', image)
                });

            //image of gates
            this.map.loadImage(
                'https://bus.sustcra.com/gate_icon.png',
                (error, image) => {
                  this.map.addImage('gate-icon', image)
                });


            this.map.addSource('stations', {
              'type': 'geojson',
              'data': this.stations_geojson
            });

            this.map.addSource('bldgs', {
              'type': 'geojson',
              'data': this.bldg_geojson
            });

            this.map.addSource('gates', {
              'type': 'geojson',
              'data': this.gate_geojson
            });

            this.map.addLayer({
              'id': 'bus-station',
              'type': 'symbol',
              'source': 'stations',
              'layout': {
                'icon-size': 0.075,
                'icon-image': 'bus-station',
                'text-field': ['get', 'name'],
                // 'text-font': [
                //   'Open Sans Semibold',
                //   'Arial Unicode MS Bold'
                // ],
                'text-size': 10,
                'text-offset': [0, 1.25],
                'text-anchor': 'top'
              },
              "paint": {
                "text-color": this.map_text_colour
              },
              // 'paint': {
              //   'circle-radius': 6,
              //   'circle-color': '#B42222'
              // },
              'filter': ['==', '$type', 'Point']
            });

            this.map.addLayer({
              'id': 'bldgs',
              'type': 'symbol',
              'source': 'bldgs',
              'layout': {
                'icon-size': 0.02,
                'icon-image': 'bldg-icon',
                'text-field': ['get', 'name'],
                'text-size': 9,
                'text-offset': [0, 0.3],
                'text-anchor': 'top'
              },
              "paint": {
                "text-color": this.map_text_colour
              },
              'filter': ['==', '$type', 'Point']
            });

            this.map.addLayer({
              'id': 'gates',
              'type': 'symbol',
              'source': 'gates',
              'layout': {
                'icon-size': 0.05,
                'icon-image': 'gate-icon',
                'text-field': ['get', 'name'],
                'text-size': 10,
                'text-offset': [0, 0.6],
                'text-anchor': 'top'
              },
              "paint": {
                "text-color": this.map_text_colour
              },
              'filter': ['==', '$type', 'Point']
            });


          });


    });


    await this.fetch_bus();

    //refresh timer

    this.timer = setInterval(() => {
      this.refresh();
    }, 5000);


  },

  async unmounted() {
    clearInterval(this.timer);
  }
};
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style src="maplibre-gl/dist/maplibre-gl.css">
</style>
<style scoped>
/* @import 'https://code.bdstatic.com/npm/maplibre-gl@1.15.2/dist/maplibre-gl.css'; */
/* @import 'maplibre-gl/dist/maplibre-gl.css'; */
/* https://webpack.js.org/loaders/sass-loader/#resolving-import-at-rules */

.map-container {
  height: 400px;
  width: 100%;
}

.filter-group {
  font: 12px/20px 'Helvetica Neue', Arial, Helvetica, sans-serif;
  font-weight: 600;
  position: absolute;
  top: 10px;
  right: 10px;
  z-index: 1;
  border-radius: 3px;
  width: 120px;
  color: #fff;
}

.filter-group input[type='checkbox']:first-child + label {
  border-radius: 3px 3px 0 0;
}

.filter-group label:last-child {
  border-radius: 0 0 3px 3px;
  border: none;
}

.filter-group input[type='checkbox'] {
  display: none;
}

.filter-group input[type='checkbox'] + label {
  background-color: #3386c0;
  display: block;
  cursor: pointer;
  padding: 10px;
  border-bottom: 1px solid rgba(0, 0, 0, 0.25);
}

.filter-group input[type='checkbox'] + label {
  background-color: #3386c0;
  text-transform: capitalize;
}

.filter-group input[type='checkbox'] + label:hover,
.filter-group input[type='checkbox']:checked + label {
  background-color: #4ea0da;
}

.filter-group input[type='checkbox']:checked + label:before {
  content: '✔';
  margin-right: 5px;
}
</style>

<style>
.map-interaction-allow {
  background-image: url("data:image/svg+xml;base64,PD94bWwgdmVyc2lvbj0iMS4wIiBzdGFuZGFsb25lPSJubyI/Pgo8IURPQ1RZUEUgc3ZnIFBVQkxJQyAiLS8vVzNDLy9EVEQgU1ZHIDIwMDEwOTA0Ly9FTiIKICJodHRwOi8vd3d3LnczLm9yZy9UUi8yMDAxL1JFQy1TVkctMjAwMTA5MDQvRFREL3N2ZzEwLmR0ZCI+CjxzdmcgdmVyc2lvbj0iMS4wIiB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciCiB3aWR0aD0iNTEyLjAwMDAwMHB0IiBoZWlnaHQ9IjUxMi4wMDAwMDBwdCIgdmlld0JveD0iMCAwIDUxMi4wMDAwMDAgNTEyLjAwMDAwMCIKIHByZXNlcnZlQXNwZWN0UmF0aW89InhNaWRZTWlkIG1lZXQiPgoKPGcgdHJhbnNmb3JtPSJ0cmFuc2xhdGUoMC4wMDAwMDAsNTEyLjAwMDAwMCkgc2NhbGUoMC4xMDAwMDAsLTAuMTAwMDAwKSIKZmlsbD0iIzMzMzMzMyIgc3Ryb2tlPSJub25lIj4KPHBhdGggZD0iTTI0MzAgNDg5OSBjLTQ5MyAtNTcgLTg3NSAtNDQ1IC05MzAgLTk0OCAtMTMgLTEyMyAtNyAtMTc3IDMwIC0yMzQKMzcgLTU4IDk2IC04NyAxNzYgLTg3IDEzNSAxIDIxNCA4MiAyMTQgMjIzIDAgMTgzIDk5IDM4NCAyNDMgNDkzIDI4MSAyMTMgNjk4CjE2MyA5MDIgLTEwOSA1NyAtNzUgNzYgLTExMSAxMDYgLTIwMiAyMiAtNjcgMjMgLTg0IDI3IC00NTIgbDMgLTM4MiAtOTE4IC0zCi05MTggLTMgLTg1IC0zMSBjLTE2MyAtNTggLTI4OCAtMTY5IC0zNTkgLTMxNyAtNjkgLTE0NSAtNjYgLTkyIC02NiAtMTE0MiAwCi04NzQgMSAtOTU1IDE4IC0xMDE1IDYxIC0yMjYgMjMxIC0zOTYgNDU3IC00NTcgNjAgLTE3IDE1MSAtMTggMTIzMCAtMTggMTA3OQowIDExNzAgMSAxMjMwIDE4IDIyNiA2MSAzOTYgMjMxIDQ1NyA0NTcgMTcgNjAgMTggMTQxIDE4IDEwMjUgbDAgOTYwIC0yNyA4MApjLTQ5IDE0NSAtMTM3IDI2MiAtMjU3IDM0MiAtNjkgNDYgLTE5NiA5MCAtMjgzIDk5IGwtNjggNyAwIDMyOSBjMCAxODEgLTUKMzcyIC0xMSA0MjUgLTU2IDUwNSAtNDM3IDg4NiAtOTQyIDk0MiAtMTA3IDEyIC0xMzkgMTIgLTI0NyAweiBtMTI5NSAtMjE0OApjNTAgLTIyIDkxIC02OSAxMDUgLTExOSA2IC0yNCAxMCAtMzQ3IDEwIC05MzMgbDAgLTg5NSAtMjcgLTU1IGMtMjMgLTQ1IC0zNwotNTkgLTgyIC04MSBsLTU1IC0yOCAtMTExNSAwIC0xMTE2IDAgLTUxIDI0IGMtNTMgMjUgLTgzIDU4IC0xMDIgMTE1IC0xNiA0NQotMTcgMTc5OCAtMiAxODUzIDE0IDUwIDU1IDk3IDEwNSAxMTkgMzggMTggOTUgMTkgMTE2NSAxOSAxMDcwIDAgMTEyNyAtMQoxMTY1IC0xOXoiLz4KPHBhdGggZD0iTTI0ODcgMjM0MCBjLTIyMiAtMzkgLTM4MyAtMjYyIC0zNDcgLTQ4MiAxOCAtMTE0IDk1IC0yMzQgMTgxIC0yODUKbDI5IC0xNyAwIC0xNjkgYzAgLTE0NSAzIC0xNzMgMTkgLTIwNSAzOSAtNzUgMTAxIC0xMTIgMTkxIC0xMTIgOTAgMCAxNTIgMzcKMTkxIDExMiAxNiAzMiAxOSA2MCAxOSAyMDUgbDAgMTY4IDQ1IDMwIGMxNTYgMTA1IDIxNCAzMzAgMTMwIDUxMiAtNzkgMTc0Ci0yNzEgMjc2IC00NTggMjQzeiIvPgo8L2c+Cjwvc3ZnPgo=");
  background-size: 86% 86%;
}

.map-interaction-lock {
  background-image: url("data:image/svg+xml;base64,PD94bWwgdmVyc2lvbj0iMS4wIiBzdGFuZGFsb25lPSJubyI/Pgo8IURPQ1RZUEUgc3ZnIFBVQkxJQyAiLS8vVzNDLy9EVEQgU1ZHIDIwMDEwOTA0Ly9FTiIKICJodHRwOi8vd3d3LnczLm9yZy9UUi8yMDAxL1JFQy1TVkctMjAwMTA5MDQvRFREL3N2ZzEwLmR0ZCI+CjxzdmcgdmVyc2lvbj0iMS4wIiB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciCiB3aWR0aD0iNTEyLjAwMDAwMHB0IiBoZWlnaHQ9IjUxMi4wMDAwMDBwdCIgdmlld0JveD0iMCAwIDUxMi4wMDAwMDAgNTEyLjAwMDAwMCIKIHByZXNlcnZlQXNwZWN0UmF0aW89InhNaWRZTWlkIG1lZXQiPgoKPGcgdHJhbnNmb3JtPSJ0cmFuc2xhdGUoMC4wMDAwMDAsNTEyLjAwMDAwMCkgc2NhbGUoMC4xMDAwMDAsLTAuMTAwMDAwKSIKZmlsbD0iIzMzMzMzMyIgc3Ryb2tlPSJub25lIj4KPHBhdGggZD0iTTIzNzAgNTEwNSBjLTQ0MSAtNjkgLTgyNiAtMzk0IC05NjUgLTgxNSAtNTMgLTE2MSAtNTcgLTE5NSAtNjIKLTU0NiBsLTUgLTMzMSAtNzEgLTYgYy0yNTcgLTIwIC00OTcgLTE5OSAtNjA0IC00NTIgLTU0IC0xMjcgLTU0IC0xMjEgLTUxCi0xMjg1IGwzIC0xMDc1IDIzIC03MCBjODQgLTI1MCAyNTYgLTQyMCA1MDIgLTQ5NyBsNzUgLTIzIDEzNDUgMCAxMzQ1IDAgNzUKMjMgYzI0OCA3OSA0MTcgMjQ2IDUwMiA0OTcgbDIzIDcwIDMgMTA3NSBjMyAxMjI3IDcgMTE2MyAtNzkgMTMzOCAtNDIgODcgLTYzCjExNiAtMTMyIDE4NSAtNDUgNDUgLTExMSA5OSAtMTQ3IDEyMCAtODQgNDggLTIwNiA4NyAtMjk3IDk0IGwtNzMgNiAwIDI4MQpjLTEgMjk3IC03IDM4MiAtNDEgNTEwIC0xNTcgNjA3IC03NTEgOTk3IC0xMzY5IDkwMXogbTQxNSAtNTA5IGMyMDQgLTY5IDM2NwotMjE5IDQ0OSAtNDE0IDQ5IC0xMTUgNTYgLTE3OSA1NiAtNDg4IGwwIC0yODQgLTczMSAwIC03MzAgMCAzIDMxOCAzIDMxNyAyOAo4MCBjODggMjUyIDI4OCA0MzMgNTQyIDQ5MSA5OSAyMyAyODIgMTMgMzgwIC0yMHogbTEwODYgLTE2ODcgYzU2IC0yNiAxMDUKLTc1IDEyOCAtMTI5IGwyMSAtNDkgLTIgLTEwMzkgLTMgLTEwMzkgLTMwIC00OSBjLTE5IC0zMCAtNDkgLTYwIC03OSAtNzkKbC00OSAtMzAgLTEyOTcgMCAtMTI5NyAwIC00OSAzMCBjLTMwIDE5IC02MCA0OSAtNzkgNzkgbC0zMCA0OSAtMyAxMDM2IGMtMgo5MzYgLTEgMTA0MCAxNCAxMDc5IDMwIDgwIDk0IDEzNSAxNzYgMTUxIDI0IDUgNjA2IDggMTI5MyA4IDExMzAgLTIgMTI1MyAtNAoxMjg2IC0xOHoiLz4KPHBhdGggZD0iTTI0NjUgMjQyOCBjLTg5IC0xNyAtMTg0IC03MCAtMjUzIC0xNDIgLTIwNCAtMjEyIC0xODEgLTUzMyA1MSAtNzE2Cmw1NyAtNDUgMCAtMTgzIGMwIC0yMDYgOSAtMjQzIDc4IC0zMDMgNTAgLTQ0IDkxIC01OSAxNjQgLTU5IDc2IDAgMTM0IDI2IDE4MQo4MSA1MCA1NyA1NyA5NSA1NyAyOTAgbDAgMTc0IDU3IDQ1IGMyMzEgMTgyIDI1NSA1MDQgNTMgNzE0IC0xMTkgMTI0IC0yNzgKMTc2IC00NDUgMTQ0eiIvPgo8L2c+Cjwvc3ZnPgo=");
  background-size: 80% 80%;
}

.popup-content {
  line-height: 1.2;
}
</style>
