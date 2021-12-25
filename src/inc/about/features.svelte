<script>
    let title = "چرا میز گرد؟"
    let title2 = "مزیت های میز گرد"

    import {feature_box} from "../../data/feature-section";
    let _features = feature_box.slice(0,4)

</script>

<section class="bg-light-gray wow animate__fadeIn">
    <div class="container">
        <div class="row justify-content-center">
            <div class="col-12 col-lg-6 col-sm-8 text-center margin-5-rem-bottom md-margin-3-rem-bottom">
                <span class="text-extra-medium margin-15px-bottom alt-font d-block w-100">{title}</span>
                <h5 class="alt-font text-extra-dark-gray font-weight-500 margin-2-rem-bottom sm-w-100">{title2}</h5>
            </div>
        </div>
        <div class="row justify-content-center">
            {#each _features as feature}
                <div class="col-12 col-lg-6 col-md-9 margin-30px-bottom xs-margin-15px-bottom">
                <div class="feature-box h-100 feature-box-left-icon border-radius-5px bg-white box-shadow-small feature-box-dark-hover overflow-hidden padding-4-rem-all">
                    <div class="feature-box-icon">
                        <i class="fa {feature.icon} icon-medium text-fast-blue"></i>
                    </div>
                    <div class="feature-box-content last-paragraph-no-margin">
                        <span class="alt-font font-weight-500 margin-10px-bottom d-block text-extra-dark-gray">{feature.txt}</span>
                        <p>{feature.desc}</p>
                    </div>
                    <div class="feature-box-overlay bg-gradient-fast-blue-purple"></div>
                </div>
            </div>
            {/each}

        </div>
    </div>
</section>