<script>
    export let page;
    export let description;
</script>

<section class="bg-gradient-light-orange-light-pink">
    <div class="container">
        <div class="d-flex flex-column flex-md-row justify-content-end extra-small-screen align-items-end">
            <div class="w-100 w-md-50 page-title-extra-small">
                <h1 class="alt-font text-extra-dark-gray position-relative padding-90px-left padding-15px-right sm-padding-55px-left mb-md-0 sm-margin-20px-bottom"><span class="page-title-separator-line bg-black w-70px sm-w-40px"></span>{page}</h1>
            </div>
            <div class="w-100 w-md-50">
                <h4 class="alt-font font-weight-500 text-extra-dark-gray mb-0">{description}</h4>
            </div>
        </div>
    </div>
</section>