<script>
    let title = "خدمات دیجیتال"
    let title2 = "با میز گرد جهانی شوید"

    let desc = "با این ابزارها کسب و کار خود را جهانی کنید"


    let services_header = "خدمات ما"
    let services = [
        "اینستاگرام ",
        "یوتیوب ",
        "تولید محتوا ",
        "طراحی وب سایت ",
        "سئو ",
        "استراتژی برند ",
    ]



</script>


<section class="parallax overflow-visible wow animate__fadeIn" id="services" data-parallax-background-ratio="0.1" style="background-image: url('images/our-services-17.png');">
    <div class="container">
        <div class="row">
            <div class="col-12 col-xl-7 col-lg-8 col-md-12 md-margin-40px-bottom">
                <div class="row">
                    <div class="col-12 position-relative margin-5-half-rem-bottom sm-margin-7-half-rem-bottom">
                        <span class="alt-font margin-20px-bottom text-gradient-sky-blue-pink d-inline-block text-uppercase font-weight-500 letter-spacing-1px">{title}</span>
                        <h5 class="alt-font font-weight-600 text-extra-dark-gray">{title2}</h5>
                        <p class="w-80 margin-4-half-rem-bottom md-w-100">{desc}</p>
                           </div>
                </div>
            </div>
            <div class="col-12 col-lg-4 col-md-12 offset-xl-1">
                <div class="sticky-top lg-position-relative">
                    <div class="bg-gradient-fast-blue-purple w-100 overflow-hidden border-radius-4px padding-4-rem-all lg-padding-3-rem-all md-padding-4-rem-all position-relative" >
                        <i class="line-icon-Cursor-Click2 title-extra-large-heavy text-extra-dark-gray opacity-2 position-absolute top-minus-20px left-minus-30px"></i>
                        <h6 style="text-align: right" class="alt-font font-weight-500 text-white margin-35px-bottom sm-margin-15px-bottom position-relative z-index-1">{services_header}</h6>
                        <ul class="list-style-03 alt-font text-white">
                            {#each services as service}
                            <li style="text-align: center" class="border-color-dark-white-transparent mb-0">{service}</li>
                            {/each}
                        </ul>
                    </div>
                </div>
            </div>
        </div>
    </div>
</section>
