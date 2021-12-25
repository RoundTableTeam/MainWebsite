<script>
    let title = ""
    let title2 = "از مشتری ها بشنوید"

    let tolds = [
        {
            told: "با گروه میز گرد حالا به فراتر از یک کلاس و مدرسه تدریس می کنم",
            name: "استاد ساداتیان مدرس فیزیک",
            pos: "دبیر برتر فیزیک استان البرز",
            img: "images/sadatian.png",
        },
        {
            told: "علاوه بر هزینه کمتر که برای نشون دادن فایل ها هزینه میکنم لازم نیست وقتمو مثل قبل هدر بدم حالا همون کار هارو با وقت و هزینه کمتر انجام میدم",
            name: "علیرضا محمدکریمی",
            pos: "مدیریت املاک املاک ایوان مدائن ",
            img: "images/k-madaen.png",
        },
        {
            told: "فوت کوزه گری توی کسب و کارتون توی دستای گروه میزگرده",
            name: "محمد مهدی میزان",
            pos: "مدیریت صنایع چوبی و مبلمان میزان",
            img: "images/k-mizan.png",
        },

    ]

    import  {clients} from "../../data/clients";
    let _clients = clients.slice(0,6)
</script>

<section class="bg-light-gray wow animate__fadeIn">
    <div class="container">
        <div class="row justify-content-center">
            <div class="col-12 col-md-6 text-center margin-5-rem-bottom sm-margin-3-rem-bottom">
                <span class="alt-font margin-10px-bottom d-inline-block text-uppercase font-weight-500 text-gradient-sky-blue-pink letter-spacing-1px">{title}</span>
                <h5 class="alt-font text-extra-dark-gray font-weight-600 letter-spacing-minus-1px">{title2}</h5>
            </div>
        </div>
        <div class="row row-cols-1 row-cols-lg-3 row-cols-md-2 justify-content-center margin-9-rem-bottom lg-margin-7-rem-bottom">
            {#each tolds as told }
            <div class="col wow animate__fadeIn" data-wow-delay="0.6s">
                <div class="testimonials-style-02 border-radius-5px overflow-hidden">
                    <img alt="" class="d-inline-block" src="{told.img}">
                    <div class="testimonials-content padding-3-half-rem-all text-center bg-white lg-padding-2-half-rem-lr">
                        <div class="testimonials-rounded-icon bg-white rounded-circle">
                            <i class="fa fa-quote-left icon-small text-gradient-light-purple-light-orange"></i>
                        </div>
                        <p>{told.told}</p>
                        <span class="alt-font font-weight-500 text-extra-dark-gray text-uppercase d-block">{told.name}</span>
                        <span class="alt-font font-weight-500 text-small text-uppercase d-block">{told.pos}</span>
                    </div>
                </div>
            </div>
            {/each}
        </div>

    </div>
</section>