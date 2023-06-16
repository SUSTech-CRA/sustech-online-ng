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
    geojson_line_1: [
      [113.99739584160139, 22.610765716856296],
      [113.99770244929088, 22.610602750604695],
      [113.99771094950285, 22.61059767778233],
      [113.99771890653385, 22.610591789421974],
      [113.99772624241524, 22.61058514322198],
      [113.99773288526481, 22.610577804306548],
      [113.99773876999119, 22.610569844587616],
      [113.99824514560808, 22.609808813574297],
      [113.998249208217, 22.609802159245984],
      [113.99825274007058, 22.60979520864264],
      [113.99898879543889, 22.60819510708253],
      [113.99899240486543, 22.608186143427105],
      [113.99899513228698, 22.608176873246407],
      [113.99899695223624, 22.60816738310082],
      [113.9989978477194, 22.608157761604655],
      [113.99899781037489, 22.60814809859871],
      [113.99899684055141, 22.608138484311375],
      [113.99876376465981, 22.606584405046835],
      [113.99876186005746, 22.60657488398115],
      [113.99875904105679, 22.60656559250995],
      [113.9987553342348, 22.606556618231554],
      [113.99875077453878, 22.606548045753847],
      [113.9987454049567, 22.606539955896604],
      [113.99840124581259, 22.606072409367975],
      [113.99839530892635, 22.606065092796133],
      [113.9983887097732, 22.60605836746942],
      [113.99838150693964, 22.606052293094507],
      [113.9983737643716, 22.606046923598996],
      [113.99836555080671, 22.606042306652647],
      [113.99835693916405, 22.60603848324417],
      [113.99834800589677, 22.606035487317342],
      [113.99774294809698, 22.605863822610463],
      [113.99773312637, 22.605861563911226],
      [113.99772312717697, 22.605860305268262],
      [113.99771305207776, 22.60586005946536],
      [113.99770300340316, 22.605860828999095],
      [113.99769308321561, 22.605862606053456],
      [113.9976833922725, 22.605865372579256],
      [113.996462081496, 22.60628164325351],
      [113.99540699384544, 22.60655007340282],
      [113.99537688636465, 22.60638436471066],
      [113.99537457846512, 22.606374521317747],
      [113.99537128843397, 22.606364961271755],
      [113.99536704990152, 22.60635578229431],
      [113.99536190619351, 22.606347078211808],
      [113.99535590988829, 22.606338937996323],
      [113.99534912227939, 22.606331444856142],
      [113.99534161274892, 22.60632467538524],
      [113.99533345805837, 22.60631869878032],
      [113.995324741564, 22.606313576133513],
      [113.99531555236477, 22.60630935980789],
      [113.99491868014185, 22.60615102642152],
      [113.99446803578164, 22.605922922486105],
      [113.993628105381, 22.605432281601264],
      [113.99361436378835, 22.60541624974317],
      [113.99361283376653, 22.605399929510398],
      [113.99403523011212, 22.604697356220907],
      [113.99427914343141, 22.604297776694622],
      [113.99454570612934, 22.60407119840138],
      [113.99455101208882, 22.604066349285663],
      [113.99481121659123, 22.60381079129223],
      [113.99481565952753, 22.603806137576637],
      [113.99515576701069, 22.603426136652367],
      [113.99549648383878, 22.60304833084697],
      [113.99570726599393, 22.60298417975627],
      [113.99623267681147, 22.60298349183956],
      [113.99686127008054, 22.603078201644227],
      [113.99770971150042, 22.60339811537432],
      [113.9977201426685, 22.603401409146592],
      [113.99773087118898, 22.603403543871796],
      [113.99774176868631, 22.603404494006192],
      [113.99787229266123, 22.603408704456996],
      [113.99788215074415, 22.603408536156227],
      [113.9978919443383, 22.60340739789566],
      [113.99790157824009, 22.603405300740327],
      [113.99791095879819, 22.603402265076713],
      [113.9979199948241, 22.603398320414538],
      [113.9979285984785, 22.60339350509991],
      [113.99793668612513, 22.60338786594256],
      [113.99794417914393, 22.60338145776082],
      [113.9980199672584, 22.603309880097154],
      [113.99802683618526, 22.603302715227613],
      [113.99803296099675, 22.603294904709315],
      [113.99803828135273, 22.603286525489548],
      [113.99804274483841, 22.603277660118295],
      [113.9980463074806, 22.603268395934986],
      [113.99804893418107, 22.603258824208055],
      [113.99810024403767, 22.60302739683338],
      [113.99810134953593, 22.603021608404344],
      [113.99816665521513, 22.602614977726315],
      [113.99835030416712, 22.60216721735362],
      [113.99856193554633, 22.601842951121434],
      [113.99880470491176, 22.601545730488308],
      [113.99881031760918, 22.601538156502247],
      [113.99881519216395, 22.60153008765145],
      [113.99881928525701, 22.6015215956419],
      [113.99882256051407, 22.601512755940064],
      [113.99882498882864, 22.601503647102295],
      [113.9988265486209, 22.601494350076678],
      [113.99882722602932, 22.60148494748368],
      [113.9988344317295, 22.601194082723367],
      [113.99895072783376, 22.600790214181995],
      [113.99965135994073, 22.60015739690114],
      [113.9997487439255, 22.600094924156195],
      [113.99975662585287, 22.600089311655786],
      [113.99976392845348, 22.6000829636668],
      [113.99977058335678, 22.600075939622243],
      [113.99977652825628, 22.600068305284697],
      [113.99978170749289, 22.600060132130594],
      [113.99978607257604, 22.600051496681044],
      [113.99978958263767, 22.600042479785387],
      [113.99979220481484, 22.60003316586426],
      [113.99979391455744, 22.600023642119194],
      [113.99979469585801, 22.60001399771619],
      [113.99979454140164, 22.600004322950916],
      [113.9997934526344, 22.599994708403305],
      [113.9997914397499, 22.5999852440895],
      [113.99978852159374, 22.599976018619078],
      [113.99978472548715, 22.599967118365456],
      [113.99978008697113, 22.5999586266572],
      [113.99977464947378, 22.599950622997884],
      [113.99976846390364, 22.599943182321713],
      [113.99976158817306, 22.599936374291982],
      [113.99975408665603, 22.59993026264882],
      [113.99974602958545, 22.59992490461245],
      [113.99973749239562, 22.59992035034746],
      [113.9997285550159, 22.599916642493127],
      [113.99931433242868, 22.59976784741106],
      [113.9988527029684, 22.59945117882353],
      [113.99885252734994, 22.599451058627373],
      [113.99811209682619, 22.59894545191823],
      [113.99660435988763, 22.59725046170577],
      [113.9966030867808, 22.597249057512315],
      [113.99536067582889, 22.595904550009735],
      [113.9953541984203, 22.59589815108709],
      [113.99534716583669, 22.59589236785265],
      [113.99533963638028, 22.595887248251184],
      [113.99460302843119, 22.595434010528884],
      [113.99459456469982, 22.595429350779234],
      [113.99458569078772, 22.595425529562213],
      [113.9945764895311, 22.59542258254812],
      [113.99456704682186, 22.595420537246756],
      [113.99455745080581, 22.59541941275059],
      [113.99454779105987, 22.59541921955658],
      [113.99453815775585, 22.59541995946815],
      [113.99452864081873, 22.59542162557837],
      [113.99451932908723, 22.595424202334442],
      [113.9945103094845, 22.595427665682845],
      [113.99450166620676, 22.59543198329392],
      [113.99449347993728, 22.59543711486362],
      [113.99448582709327, 22.59544301248976],
      [113.99447877911251, 22.595449621119172],
      [113.99447240178651, 22.59545687906161],
      [113.99446675464631, 22.595464718565623],
      [113.99446189040688, 22.595473066451],
      [113.99420385593578, 22.595969591352997],
      [113.99382768199821, 22.59595993652297],
      [113.9938169603822, 22.59596023674876],
      [113.99380633259398, 22.59596168357378],
      [113.99379592089899, 22.59596426035329],
      [113.99378584507669, 22.595967937443213],
      [113.99321594303598, 22.596211295714554],
      [113.99320787618828, 22.59621517605677],
      [113.99320018866534, 22.59621976224022],
      [113.99319294206812, 22.596225017515316],
      [113.9931861944644, 22.596230899770962],
      [113.99265363550316, 22.596738860232236],
      [113.99200633643709, 22.59716671060916],
      [113.99157366427197, 22.5971462468509],
      [113.99090478252046, 22.5969456920235],
      [113.99089489978897, 22.59694326928491],
      [113.99088482201618, 22.596941863390235],
      [113.9908746535454, 22.596941488895837],
      [113.99086449965898, 22.596942149679155],
      [113.99039476525739, 22.596996829390125],
      [113.99038484213679, 22.596998494112995],
      [113.99037513653565, 22.597001147588333],
      [113.99036574671312, 22.59700476295245],
      [113.99035676773141, 22.597009303603546],
      [113.99034829049342, 22.59701472357223],
      [113.99034040082233, 22.597020967986946],
      [113.99033317859293, 22.597027973629473],
      [113.99032669692278, 22.59703566957495],
      [113.99032102143205, 22.597043977909916],
      [113.99031620957922, 22.597052814521092],
      [113.9903123100793, 22.597062089946967],
      [113.99030936241067, 22.59707171028347],
      [113.99020088374516, 22.59750194984639],
      [113.99019873660492, 22.597513104722935],
      [113.99019786842672, 22.597524431141103],
      [113.99019829041364, 22.59753578294312],
      [113.99030139387085, 22.59862956838946],
      [113.99030286538937, 22.59863964935582],
      [113.9903053549666, 22.598649528285655],
      [113.99030883676294, 22.59865910264432],
      [113.99048378356784, 22.59907317753902],
      [113.99048795907763, 22.599081866470787],
      [113.99049295183752, 22.59909011297101],
      [113.99049871544861, 22.599097840402962],
      [113.99050519634824, 22.599104976953754],
      [113.99051233430787, 22.599111456301692],
      [113.99052006299269, 22.59911721823263],
      [113.99075599101839, 22.599276010611053],
      [113.99076619844251, 22.59928203412041],
      [113.99126127611241, 22.599535900836155],
      [113.9917686585336, 22.6000105337692],
      [113.99191211157755, 22.60053218120178],
      [113.99183362959826, 22.601016496848214],
      [113.99144872111891, 22.60153952301182],
      [113.99077751816642, 22.602118998056795],
      [113.99045237812743, 22.602377905865616],
      [113.9904454049912, 22.602384007276413],
      [113.99043902651476, 22.60239072790739],
      [113.9904332974585, 22.6023980100607],
      [113.99025180113084, 22.60265210491943],
      [113.99024623928223, 22.60266080939295],
      [113.99024160504972, 22.60267004118088],
      [113.99023794788148, 22.602679701778165],
      [113.99023530680027, 22.60268968810428],
      [113.99010219314502, 22.60332391993846]],
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
          "geometry": {"type": "Point", "coordinates": [113.994898, 22.59569]},
          "properties": {"name": "1号门 Gate1"}
        },
        {
          "type": "Feature",
          "geometry": {"type": "Point", "coordinates": [113.99939, 22.599893]},
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
    update_location: function () {
      this.display_data = [];
      this.bus_marker_arr.forEach((marker) => marker.remove())
      let i;
      for (i = 0; i < this.bus_location_data_api.length; i++) {
        // if current time - report time < 300s, then display
        if (parseInt(new Date().getTime() / 1000) - this.bus_location_data_api[i].time_mt < 300) {

          // create a DOM element for the marker

          //up direction (0)
          var bus_marker_up = document.createElement('div');
          bus_marker_up.className = 'marker';
          bus_marker_up.style.backgroundImage = 'url(https://bus.sustcra.com/img/bus-uphill.png)';
          bus_marker_up.style.width = 28 + 'px';
          bus_marker_up.style.height = 28 + 'px';
          bus_marker_up.style.backgroundSize = 'cover';

          //down direction (1)
          var bus_marker_down = document.createElement('div');
          bus_marker_down.className = 'marker';
          bus_marker_down.style.backgroundImage = 'url(https://bus.sustcra.com/img/bus-downhill.png)';
          bus_marker_down.style.width = 28 + 'px';
          bus_marker_down.style.height = 28 + 'px';
          bus_marker_down.style.backgroundSize = 'cover';

          var bus_marker = document.createElement('div');
          bus_marker.className = 'marker';
          bus_marker.style.backgroundImage = 'url(https://bus.sustcra.com/bus-top-view.png)';
          bus_marker.style.width = 35 + 'px';
          bus_marker.style.height = 35 + 'px';
          bus_marker.style.backgroundSize = 'cover';


          // add marker to map
          if (this.bus_location_data_api[i].route_dir === 0) { //up
          var marker = new maplibre.Marker(bus_marker_up)
              .setLngLat([this.bus_location_data_api[i].lng, this.bus_location_data_api[i].lat])
              .setPopup(
                  new maplibre.Popup({offset: 25}) // add popups
                      .setHTML(
                        '<p class="car-plate">' +
                          'Plate: <b>' + this.bus_location_data_api[i].id +
                          '</b></p><p>' +
                          'Speed: <b>' + this.bus_location_data_api[i].speed + "km/h" +
                          '</b></p><p>' + 'Next Sta: <b>' + this.bus_location_data_api[i].next_station_string +
                          '</b></p>'
                      )
              )
              .addTo(this.map);
          } else {
            var marker = new maplibre.Marker(bus_marker_down)
                .setLngLat([this.bus_location_data_api[i].lng, this.bus_location_data_api[i].lat])
                .setPopup(
                    new maplibre.Popup({offset: 25}) // add popups
                        .setHTML(
                          '<p class="car-plate">' +
                          'Plate: <b>' + this.bus_location_data_api[i].id +
                          '</b></p><p>' +
                          'Speed: <b>' + this.bus_location_data_api[i].speed + "km/h" +
                          '</b></p><p>' + 'Next Sta: <b>' + this.bus_location_data_api[i].next_station_string +
                          '</b></p>'
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
