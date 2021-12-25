<script>
      import {feature_box} from '../../data/feature-section'
</script>
<section style="background-color: #2d3436;
background-image: linear-gradient(315deg, #2d3436 0%, #000000 74%);
" class=" feature-section ">
              <div class="row row-cols-1 row-cols-lg-4 row-cols-sm-2 justify-content-center  ">
                  {#each feature_box as feat }
                <div class="col md-margin-40px-bottom wow animate__fadeIn" data-wow-delay="0.2s">
                    <div class="d-flex justify-content-center align-items-center h-100">
                        <span class="alt-font font-weight-500 text-uppercase">{ feat.txt }</span>
                        <i style="color: { feat.color }" class="fa { feat.icon } align-middle icon-large text-extra-dark-gray margin-15px-left"></i>
                    </div>
                </div>
               {/each}


        </div>
</section>