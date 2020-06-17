# 📅校历
## 2019-2020 秋季学期

<img class="calender-camp" src="./pic/192001.jpg">

## 2019-2020 春季学期、夏季学期

<img class="calender-camp" src="./pic/192023.jpg">


<client-only>
<link href="https://cdn.bootcss.com/imageviewer/1.1.0/viewer.min.css" rel="stylesheet">
<script type="text/javascript">

    function init_viewer(){
        $.getScript("https://cdn.bootcss.com/imageviewer/1.1.0/viewer.min.js", function(){
            var $image = $('.calender-camp');

            $image.viewer({
            backdrop: true,
            rotatable: false,
            scalable: false,
            });
        });
       
    }

    document.addEventListener('DOMContentLoaded', init_viewer, false);

    $(document).ready(function(){
        init_viewer();
    });

</script>
</client-only>
