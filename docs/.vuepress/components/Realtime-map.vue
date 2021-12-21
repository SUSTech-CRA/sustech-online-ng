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
    bus_location_data_api: [],
    bus_location_data_display: [],
    bus_plate_hash: {"866005041185986":{"plate":866005041185986},"866005041186018":{"plate":"粤BDF267"},"866005041186034":{"plate":"粤BDF458"},"866005041187107":{"plate":866005041187107},"866005041187859":{"plate":"粤BDF147"},"866005041187867":{"plate":"粤BDF345"},"866005041189913":{"plate":"粤BDF411"},"866005041189921":{"plate":"粤BDF365"},"866005041189939":{"plate":"粤BDF471"},"866005041189947":{"plate":"粤BDF371"},"866005041189954":{"plate":"粤BDF421"},"866005041189962":{"plate":"粤BDF330"},"866005041189970":{"plate":"粤BDF470"},"866005041189988":{"plate":"粤BDF335"},"866005041190093":{"plate":"粤BDF040"},"866005041200116":{"plate":866005041200116},"866005041200173":{"plate":"粤BDE447"},"866005041200199":{"plate":"粤BDF430"}},
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
    geojson_line_2: [
      [
        113.9914596783045,
        22.59960492109923,
        0
      ],
      [
        113.9918969233072,
        22.59993661748595,
        0
      ],
      [
        113.9920105698998,
        22.6005318195689,
        0
      ],
      [
        113.9919172423369,
        22.60102266627295,
        0
      ],
      [
        113.9917196221943,
        22.601431625928,
        0
      ],
      [
        113.9912862193332,
        22.60181812810236,
        0
      ],
      [
        113.9909041713777,
        22.60213330809864,
        0
      ],
      [
        113.9904804856139,
        22.60253483338519,
        0
      ],
      [
        113.9903330314688,
        22.60277899659393,
        0
      ],
      [
        113.9900477774609,
        22.60433153499769,
        0
      ],
      [
        113.9900962409839,
        22.60464254738627,
        0
      ],
      [
        113.9903161120924,
        22.60505460565142,
        0
      ],
      [
        113.9915641615897,
        22.60511717356275,
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
      const realtime_location_api_data = await axios.get(`https://bus.sustcra.com/api/v1/bus/monitor_osm/`)
      this.bus_location_data_api = realtime_location_api_data.data;
      const d = new Date();
      console.log("bus location data fetched at " + d.getTime())
      // console.log(this.bus_location_data_api)
      this.update_location()
    },
    update_location: function () {
      this.display_data = [];
      this.bus_marker_arr.forEach((marker) => marker.remove())
      let i;
      for (i = 0; i < this.bus_location_data_api.length; i++) {
        if (parseInt(this.bus_location_data_api[i].acc) === 1) {

          // create a DOM element for the marker
          var el = document.createElement('div');
          el.className = 'marker';
          el.style.backgroundImage = 'url(https://bus.sustcra.com/bus-top-view.png)';
          el.style.width = 35 + 'px';
          el.style.height = 35 + 'px';
          el.style.backgroundSize = 'cover';


          // add marker to map
          var marker = new maplibre.Marker(el)
              .setLngLat([this.bus_location_data_api[i].lng, this.bus_location_data_api[i].lat])
              .setRotation(parseInt(this.bus_location_data_api[i].course))
              .setPopup(
                  new maplibre.Popup({offset: 25}) // add popups
                      .setHTML(
                          '<p class="car-plate">' +
                          'Plate: <b>' + this.bus_plate_hash[this.bus_location_data_api[i].imei].plate +
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
    if(await userPrefersDark){
      console.log("dark mode enabled.")
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
          'line-color': '#29abe2',
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
          'line-color': '#f7911d',
          'line-width': 3
          // 'line-dasharray': [1, 2]
        }
      });


    });


    this.fetch_bus()

    //refresh timer

    const timer = setInterval(() => {
      this.refresh();
    }, 5000);


  }
};
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped src="maplibre-gl/dist/maplibre-gl.css"></style>
<style scoped>
/* @import 'https://code.bdstatic.com/npm/maplibre-gl@1.15.2/dist/maplibre-gl.css'; */
/* @import 'maplibre-gl/dist/maplibre-gl.css'; */
/* https://webpack.js.org/loaders/sass-loader/#resolving-import-at-rules */

.map-container {
  height: 400px;
  width: 100%;
}

</style>