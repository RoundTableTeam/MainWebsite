<script>
    let title = "تایتل"
    let title2 = "تایتل2"

    let tolds = [
        {
            told: "عالی است بسیار بسیار",
            name: "احمد ذوقی",
            pos: "مدیر مالی آستارا",
            img: "images/testimonial-img-11.jpg",
        },
        {
            told: "عالی است بسیار بسیار",
            name: "احمد ذوقی",
            pos: "مدیر مالی آستارا",
            img: "images/testimonial-img-11.jpg",
        },
        {
            told: "عالی است بسیار بسیار",
            name: "احمد ذوقی",
            pos: "مدیر مالی آستارا",
            img: "images/testimonial-img-11.jpg",
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
        <div class="row row-cols-1 row-cols-lg-6 row-cols-md-3 row-cols-sm-2 client-logo-style-04">
            {#each _clients as client}
            <div class="col text-center sm-no-margin wow animate__fadeIn">
                <div class="client-box padding-25px-all text-center" title="{client.name}">
                    <a href="#"><img alt="{client.name}" src="{client.img}"></a>
                    <span class="client-overlay bg-white box-shadow-small border-radius-4px"></span>
                </div>
            </div>
            {/each}

        </div>
    </div>
</section>