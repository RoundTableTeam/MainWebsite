<script>
    import {samples} from "../../data/samples";
    let _samples = samples.slice(0,4)
</script>

<section class="bg-light-blue">
    <div class="container">
        <div class="row justify-content-center">
            <div class="col-12 col-xl-4 col-lg-5 col-md-7 col-sm-9 text-center last-paragraph-no-margin margin-5-rem-bottom md-margin-3-rem-bottom wow animate__fadeIn">
                <h4 class="alt-font font-weight-600 text-extra-dark-gray letter-spacing-minus-1px margin-20px-bottom sm-margin-10px-bottom">پروژه های اخیر</h4>
            </div>
        </div>
    </div>
        <div class="container">
                    <div class="row justify-content-center row-cols-2 ">
                        {#each _samples as sample}
                            <div class="col text-center margin-30px-bottom sm-margin-15px-bottom wow animate__fadeIn" data-wow-delay="0.2s">
                                <a href="{sample.link}">
                                    <div class="portfolio-box">
                                        <div class="portfolio-image ">
                                            <img src="{sample.img}" alt="{sample.name}" />
                                            <div class="portfolio-hover opacity-6 bg-transparent-white justify-content-center d-flex flex-column">
                                                <div class="scale">
                                                    <div class="alt-font text-extra-dark-gray font-weight-500 d-block">{sample.name}</div>
                                                    <div class="text-uppercase text-medium-gray text-small alt-font d-block">{sample.type}</div>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </a>
                            </div>
                        {/each}
                </div>
        </div>
</section>