<template>
  <div class="container">
    <ins class="adsbygoogle"
         style="display:block; text-align:center;"
         data-ad-layout="in-article"
         data-ad-format="fluid"
         data-ad-client="ca-pub-9039393129169217"
         data-ad-slot="9835965831"></ins>
  </div>
</template>


<script>

export default {
  name: "adsense-inline",
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


