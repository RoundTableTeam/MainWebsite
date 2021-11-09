<script>
    let title = "متن برای اینجا"


    let addresses = [
    {
        location: "کرج",
        address: "آدرس",
        phone: "+989102625250",
        google_map: "https://goo.gl/maps/c6VAWeVMSnUMZLKz5",
    },
    {
        location: "تهران",
        address: "آدرس",
        phone: "+989102625250",
        google_map: "https://goo.gl/maps/c6VAWeVMSnUMZLKz5",
    }
    ]
</script>

<section>
    <div class="container">
        <div class="row align-items-end">
            <div class="col-12 col-lg-6 col-md-4 sm-margin-30px-bottom">
                <h5 class="alt-font w-50 text-extra-dark-gray font-weight-500 mb-0 lg-w-65 md-w-100">{title}</h5>
            </div>
            <div class="col-12 col-lg-6 col-md-8">
                <div class="row">
                    {#each addresses as address }
                        <div class="col-12 col-sm-6 xs-margin-30px-bottom">
                        <span class="alt-font d-block text-extra-dark-gray font-weight-500 margin-10px-bottom">{address.location}</span>
                        <p class="w-80 margin-5px-bottom lg-w-90">{address.address}</p>
                        <span class="d-block margin-10px-bottom">{address.phone}</span>
                        <a href="{address.google_map}" target="_blank" class="text-uppercase text-small text-extra-dark-gray font-weight-500 text-decoration-line-bottom">دیدن در نقشه</a>
                    </div>
                    {/each}

                </div>
            </div>
        </div>
    </div>
</section>

