<script>
    import {samples} from '../../data/samples'
</script>

<section class="pt-0">

    <div class="container">
        <div class="row">
            <div class="col-12 filter-content">
                <div class="portfolio-bordered portfolio-wrapper row row-cols-1 row-cols-md-2 row-cols-sm-2 client-logo-style-01 align-items-center margin-7-half-rem-top sm-margin-5-rem-top text-center">
                    {#each samples as sample}
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
        </div>
    </div>
</section>