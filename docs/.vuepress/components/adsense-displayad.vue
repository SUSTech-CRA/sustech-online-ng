<template>
  <div class="container">
    <ins class="adsbygoogle"
         style="display:block;min-width:300px;max-width:970px;width:100%;height:103px"
         data-ad-client="ca-pub-9039393129169217"
         data-ad-slot="6679712662"></ins>
  </div>
</template>


<script>

export default {
  name: "adsense-displayad",
  mounted() {
    this.adsenseAddLoad();
  },

  methods: {
    adsenseAddLoad() {
      let inlineScript = document.createElement("script");
      inlineScript.type = "text/javascript";
      inlineScript.text = '(adsbygoogle = window.adsbygoogle || []).push({});'
      document.getElementsByTagName('body')[0].appendChild(inlineScript);
    }
  }
}
</script>


