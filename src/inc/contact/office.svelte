<script>
    let title = "برای ارتباط با ما تنها کاری که باید بکنید اینه که گوشیتون رو بردارید و باما تماس بگیرید"


    let addresses = [
    {
        location: "مهدی مهدی نژاد",
        address: "",
        phone: "+989386652538",
        google_map: "https://goo.gl/maps/c6VAWeVMSnUMZLKz5",
    },

    ]
</script>

<section>
    <div class="container">
        <div class="row align-items-end">
            <div class="col-12 col-lg-6 col-md-4 sm-margin-30px-bottom">
                <h5 style="text-align: right; direction: rtl" class="alt-font w-50 text-extra-dark-gray font-weight-500 mb-0 lg-w-65 md-w-100">{title}</h5>
            </div>
            <div class="col-12 col-lg-6 col-md-8">
                <div class="row">
                    {#each addresses as address }
                        <div class="col-12 col-sm-6 xs-margin-30px-bottom">
                        <span class="alt-font d-block text-extra-dark-gray font-weight-500 margin-10px-bottom">{address.location}</span>
                        <p class="w-80 margin-5px-bottom lg-w-90">{address.address}</p>
                        <span class="d-block margin-10px-bottom">{address.phone}</span>
                    </div>
                    {/each}

                </div>
            </div>
        </div>
    </div>
</section>

