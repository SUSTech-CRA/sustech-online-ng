<template>

  <div class="map-container" ref="myMap"></div>
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
    map_style_url: "https://mirrors.sustech.edu.cn/osm-tile/styles/osm-street/style.json",
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
      "8447": {"plate": "粤BDF447"},
      "8458": {"plate": "粤BDF458"},
      "8470": {"plate": "粤BDF470"},
      "8471": {"plate": "粤BDF471"},
      "18447": {"plate": "粤BDF447"}
    },
    geojson_line_1: [
      [
        113.9902000608227,
        22.60334446057298,
        0
      ],
      [
        113.9903507353066,
        22.60274690433305,
        0
      ],
      [
        113.9908897685934,
        22.60223280847205,
        0
      ],
      [
        113.9916260097764,
        22.60156692563558,
        0
      ],
      [
        113.9920446448193,
        22.60109135771524,
        0
      ],
      [
        113.9920345671635,
        22.60052003061499,
        0
      ],
      [
        113.9919356057219,
        22.60002742855453,
        0
      ],
      [
        113.9913193648925,
        22.59945330686925,
        0
      ],
      [
        113.9908118273651,
        22.59919305096794,
        0
      ],
      [
        113.9905758993394,
        22.59903425858952,
        0
      ],
      [
        113.9904009525345,
        22.59862018369482,
        0
      ],
      [
        113.9902978490773,
        22.59752639824848,
        0
      ],
      [
        113.9904063277428,
        22.59709615868556,
        0
      ],
      [
        113.9908760621444,
        22.59704147897459,
        0
      ],
      [
        113.9915566904328,
        22.5972455558366,
        0
      ],
      [
        113.9920342333153,
        22.59726814181022,
        0
      ],
      [
        113.9927162086146,
        22.5968173712095,
        0
      ],
      [
        113.9932552142158,
        22.59630326187374,
        0
      ],
      [
        113.9938251162565,
        22.5960599036024,
        0
      ],
      [
        113.9942637689173,
        22.59607116200299,
        0
      ],
      [
        113.9945506236767,
        22.59551917942994,
        0
      ],
      [
        113.9952872316258,
        22.59597241715224,
        0
      ],
      [
        113.9965296425777,
        22.59731692465482,
        0
      ],
      [
        113.9980455511388,
        22.59902110136386,
        0
      ],
      [
        113.9987961352288,
        22.59953364148681,
        0
      ],
      [
        113.9996172189355,
        22.60002130471761,
        0
      ],
      [
        113.9988625272248,
        22.60073512664515,
        0
      ],
      [
        113.998734780645,
        22.60117875994807,
        0
      ],
      [
        113.9987272567012,
        22.60148247090658,
        0
      ],
      [
        113.9984811102924,
        22.60178382602745,
        0
      ],
      [
        113.9982613807302,
        22.6021205004729,
        0
      ],
      [
        113.9980697519452,
        22.60258771673122,
        0
      ],
      [
        113.9980026147617,
        22.60300575140722,
        0
      ],
      [
        113.9979489117119,
        22.60325062940188,
        0
      ],
      [
        113.9978602396981,
        22.6033412591236,
        0
      ],
      [
        113.9968866415579,
        22.6029808956564,
        0
      ],
      [
        113.9962401029074,
        22.60288348203091,
        0
      ],
      [
        113.9955117554291,
        22.60290040283193,
        0
      ],
      [
        113.9950813789864,
        22.60335930509263,
        0
      ],
      [
        113.9944946598457,
        22.60394737599491,
        0
      ],
      [
        113.9939497003322,
        22.60464554145209,
        0
      ],
      [
        113.9934784038899,
        22.60548092977822,
        0
      ],
      [
        113.995278497141,
        22.60640224097063,
        0
      ],
      [
        113.9953277666447,
        22.60667341560261,
        0
      ],
      [
        113.9964905851169,
        22.6063775771138,
        0
      ],
      [
        113.9977156537446,
        22.60596002561628,
        0
      ],
      [
        113.9983207115444,
        22.60613169032316,
        0
      ],
      [
        113.9986648706885,
        22.60659923685179,
        0
      ],
      [
        113.9988979465801,
        22.60815331611633,
        0
      ],
      [
        113.9981618912118,
        22.60975341767644,
        0
      ],
      [
        113.9976555155949,
        22.61051444868976,
        0
      ],
      [
        113.9973489079054,
        22.61067741494136,
        0
      ]
    ],
    geojson_line_2: [ [ 113.991459678304494, 22.599604921099228 ], [ 113.991896923307195, 22.599936617485952 ], [ 113.992010569899804, 22.6005318195689 ], [ 113.991917242336896, 22.60102266627295 ], [ 113.991719622194296, 22.601431625928001 ], [ 113.991526274764496, 22.601612498395962 ], [ 113.992045849875581, 22.60262745159568 ], [ 113.992339522764453, 22.602968084896109 ], [ 113.992798857282978, 22.603280910653833 ], [ 113.99298710913483, 22.60350336409337 ], [ 113.993853067653333, 22.603677155592816 ], [ 113.994199451060737, 22.604268045049292 ], [ 113.993864148579476, 22.604784676421257 ], [ 113.993478403889895, 22.605480929778221 ], [ 113.995278497141001, 22.606402240970631 ], [ 113.995327766644706, 22.606673415602611 ], [ 113.996490585116902, 22.6063775771138 ], [ 113.997715653744606, 22.60596002561628 ], [ 113.998320711544395, 22.60613169032316 ], [ 113.998664870688501, 22.606599236851789 ], [ 113.998897946580101, 22.608153316116329 ], [ 113.998161891211794, 22.609753417676441 ], [ 113.9976555155949, 22.610514448689759 ], [ 113.997348907905405, 22.61067741494136 ] ],
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
          "geometry": {"type": "Point", "coordinates": [113.99289, 22.60532]},
          "properties": {"name": "学生宿舍北 Student Dormitory N."}
        },
        {
          "type": "Feature",
          "geometry": {"type": "Point", "coordinates": [113.994041, 22.604431]},
          "properties": {"name": "学生宿舍南 Student Dormitory S."}
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
    map: []
  }),

  async created() {
    //fetch bus location (current no need)
    // const realtime_location_api_data = await axios.get(`https://bus.sustcra.com/api/v1/bus/monitor_osm/`)
    // this.bus_location_data_api = realtime_location_api_data.data;
    // console.log("fetch complete")

  },


  //update data
  methods: {
    async fetch_bus() {
      const realtime_location_api_data = await axios.get(`https://bus.sustcra.com/api/v2/monitor_osm/`)
      this.bus_location_data_api = realtime_location_api_data.data;
      const d = new Date();
      console.log("bus location data fetched at " + parseInt(d.getTime() / 1000,));
      //console log the diff of report time and display time
      if (typeof this.bus_location_data_api[0].time_rt != "undefined") {
        console.log("The clock drift is " + parseInt(d.getTime() / 1000 - this.bus_location_data_api[0].time_rt) + " seconds");
      }
      this.update_location()
    },
    update_location: function () {
      this.display_data = [];
      this.bus_marker_arr.forEach((marker) => marker.remove())
      let i;
      for (i = 0; i < this.bus_location_data_api.length; i++) {
        if ((this.bus_location_data_api[i].time_rt-this.bus_location_data_api[i].time_mt)<300) {

          // create a DOM element for the marker

          //line1
          var bus_marker_l1 = document.createElement('div');
          bus_marker_l1.className = 'marker';
          bus_marker_l1.style.backgroundImage = 'url(https://bus.sustcra.com/bus-top-line1.png)';
          bus_marker_l1.style.width = 35 + 'px';
          bus_marker_l1.style.height = 35 + 'px';
          bus_marker_l1.style.backgroundSize = 'cover';

          //line2
          var bus_marker_l2 = document.createElement('div');
          bus_marker_l2.className = 'marker';
          bus_marker_l2.style.backgroundImage = 'url(https://bus.sustcra.com/bus-top-line2.png)';
          bus_marker_l2.style.width = 35 + 'px';
          bus_marker_l2.style.height = 35 + 'px';
          bus_marker_l2.style.backgroundSize = 'cover';

          var bus_marker = document.createElement('div');
          bus_marker.className = 'marker';
          bus_marker.style.backgroundImage = 'url(https://bus.sustcra.com/bus-top-view.png)';
          bus_marker.style.width = 35 + 'px';
          bus_marker.style.height = 35 + 'px';
          bus_marker.style.backgroundSize = 'cover';


          // add marker to map
          // if (this.bus_location_data_api[i].route_flag === 0) {
          // var marker = new maplibre.Marker(bus_marker_l1)
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
          // } else {
          //   var marker = new maplibre.Marker(bus_marker_l2)
          //       .setLngLat([this.bus_location_data_api[i].lng, this.bus_location_data_api[i].lat])
          //       .setRotation(parseInt(this.bus_location_data_api[i].course))
          //       .setPopup(
          //           new maplibre.Popup({offset: 25}) // add popups
          //               .setHTML(
          //                   '<p class="car-plate">' +
          //                   'Plate: <b>' + this.bus_plate_hash[this.bus_location_data_api[i].id].plate +
          //                   '</b></p><p>' +
          //                   'Speed: <b>' + this.bus_location_data_api[i].speed + "km/h" +
          //                   '</b></p>'
          //               )
          //       )
          //       .addTo(this.map);
          // }

          var marker = new maplibre.Marker(bus_marker)
              .setLngLat([this.bus_location_data_api[i].lng, this.bus_location_data_api[i].lat])
              .setRotation(parseInt(this.bus_location_data_api[i].course))
              .setPopup(
                  new maplibre.Popup({offset: 25}) // add popups
                      .setHTML(
                          '<p class="car-plate">' +
                          'Plate: <b>' + this.bus_plate_hash[this.bus_location_data_api[i].id].plate +
                          '</b></p><p>' +
                          'Speed: <b>' + this.bus_location_data_api[i].speed + "km/h" +
                          '</b></p>'
                      )
              )
              .addTo(this.map);

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
            this.map.addImage('custom-marker', image);

            this.map.addSource('stations', {
              'type': 'geojson',
              'data': this.stations_geojson
            });

            this.map.addLayer({
              'id': 'bus-station',
              'type': 'symbol',
              'source': 'stations',
              'layout': {
                'icon-size': 0.075,
                'icon-image': 'custom-marker',
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
          });


    });


    await this.fetch_bus();

    //refresh timer

    const timer = setInterval(() => {
      this.refresh();
    }, 5000);


  }
};
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style src="maplibre-gl/dist/maplibre-gl.css"></style>
<style scoped>
/* @import 'https://code.bdstatic.com/npm/maplibre-gl@1.15.2/dist/maplibre-gl.css'; */
/* @import 'maplibre-gl/dist/maplibre-gl.css'; */
/* https://webpack.js.org/loaders/sass-loader/#resolving-import-at-rules */

.map-container {
  height: 400px;
  width: 100%;
}

</style>
