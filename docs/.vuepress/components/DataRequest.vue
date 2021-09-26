<template>
  <slot :data="data"></slot>
</template>
<script>
  export function fetchJSONData(url) {
    return new Promise(function (resolve, reject) {
      let xhr = new XMLHttpRequest();
      xhr.open("GET", url);
      xhr.onload = function () {
        if (this.status == 200 && this.status < 300) {
          let data = JSON.parse(xhr.response);
          resolve(data);
        } else {
          reject({
            status: this.status,
            statusText: xhr.statusText,
          });
        }
      };
      xhr.onerror = function () {
        reject({
          status: this.status,
          statusText: xhr.statusText,
        });
      };
      xhr.send();
    });
  }
  export default {
    data() {
      return {
        data: null,
      };
    },
    props: {
      path: { type: String },
    },
    mounted() {
      if (this.path)
        return fetchJSONData(this.path).then((data) => {
          this.data = data;
        });
    },
    watch: {
      path(val) {
        if (this.path)
          return fetchJSONData(this.path).then((data) => {
            this.data = data;
          });
      },
    },
  };
</script>