<script>
    let title = "کار هایی که میکنیم"
    let title2 = "سوشال مدیاااا"
    let action = "بیشتر بخوانید"

    let services = [
        {
            title: "تایتل",
            des: "متن متن متن متن متن متن متن متن متن متن متن متن متن متن متن متن متن متن متن متن متن متن متن ر"
        },
        {
            title: "تایتل",
            des: "متن متن متن متن متن متن متن متن متن متن متن متن متن متن متن متن متن متن متن متن متن متن متن ر"
        },
        {
            title: "تایتل",
            des: "متن متن متن متن متن متن متن متن متن متن متن متن متن متن متن متن متن متن متن متن متن متن متن ر"
        },

    ]
</script>


<section class="bg-light-gray wow animate__fadeIn">
    <div class="container">
        <div class="row justify-content-center">
            <div class="col-12 col-md-6 text-center margin-5-rem-bottom sm-margin-3-rem-bottom">
                <span class="alt-font margin-10px-bottom d-inline-block text-uppercase font-weight-500 text-gradient-sky-blue-pink letter-spacing-1px">{title}</span>
                <h5 class="alt-font text-extra-dark-gray font-weight-600 letter-spacing-minus-1px">{title2}</h5>
            </div>
        </div>
        <div class="row justify-content-center">
            <!-- start services item -->
            {#each services as service, i}
            <div class="col-12 col-lg-4 col-md-9 md-margin-30px-bottom xs-margin-15px-bottom wow animate__fadeIn">
                <div class="feature-box text-start box-shadow-large box-shadow-double-large-hover bg-white padding-4-rem-all lg-padding-3-rem-all md-padding-4-half-rem-all">
                    <div class="feature-box-content">
                        <span class="margin-15px-bottom d-block text-extra-medium">{i+1}</span>
                        <h6 class="alt-font font-weight-600 d-block text-extra-dark-gray">{service.title}</h6>
                        <p>{service.des}</p>
                        <div class="h-1px bg-medium-gray margin-25px-bottom w-100"></div>
                        <a class="text-small font-weight-500 text-uppercase alt-font d-block text-extra-dark-gray" href="/about">{action}<i class="feather icon-feather-arrow-right icon-extra-small float-end"></i></a>
                    </div>
                    <div class="feature-box-overlay bg-white"></div>
                </div>
            </div>
            {/each}
            <!-- end services item -->
        </div>
    </div>
</section>