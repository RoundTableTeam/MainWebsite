<script>
    let title = "۱ سال است که با اتخار افتخار میکنیم"
    import {clients} from "../../data/clients";
    let _clients = clients.slice(0,8)
</script>

<section class="wow animate__fadeIn">
    <div class="container">
        <div class="row align-items-center justify-content-center">
            <div class="col-12 col-xl-7 col-lg-8 col-md-7 col-sm-10 text-center text-md-start sm-margin-30px-bottom">
                <h5 style="text-align: center;direction: rtl" class="alt-font text-extra-dark-gray font-weight-500 mb-0">{title}</h5>
            </div>

        </div>
        <div class="row row-cols-1 row-cols-md-4 row-cols-sm-2 client-logo-style-01 align-items-center margin-7-half-rem-top sm-margin-5-rem-top">
            {#each _clients as client }
                <div class="col text-center margin-30px-bottom sm-margin-15px-bottom wow animate__fadeIn" >
                <div class="client-box padding-15px-all border border-color-dark-gray">
                    <a href="#"><img class="client-box-image" src="{client.img}" alt="{client.name}" /></a>
                </div>
            </div>
            {/each}

        </div>
    </div>
</section>