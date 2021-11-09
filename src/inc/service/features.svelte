<script>
    import {features} from "../../data/features";
</script>

<section class="bg-light-gray wow animate__fadeIn">


    <div class="container">
        <div class="row row-cols-1 row-cols-lg-3 row-cols-sm-2">
            {#each features as feature}
            <div class="col wow animate__fadeIn" data-wow-delay="0.4s">
                <div class="feature-box padding-4-half-rem-all lg-padding-3-rem-all">
                    <div class="feature-box-icon feature-box-svg margin-20px-bottom">
                        <i class="{feature.icon} icon-medium text-gradient-sky-blue-pink"></i>
                        <span class="feature-box-svg-shap drop-shadow">
                                    <svg width="100" viewBox="-110 -110 220 220" xmlns="http://www.w3.org/2000/svg"><path fill="#fff" d="M88.6,52.5C56,107.7,-69.9,110.3,-100.2,56.5C-130.5,2.7,-65.2,-107.7,-2.3,-109C60.6,-110.3,121.2,-2.7,88.6,52.5Z"></path></svg>
                                </span>
                    </div>
                    <div class="feature-box-content last-paragraph-no-margin">
                        <span class="alt-font font-weight-500 margin-10px-bottom d-block text-extra-dark-gray">{feature.title}</span>
                        <p>{feature.desc}</p>
                    </div>
                </div>
            </div>
                {/each}


        </div>
    </div>
</section>
