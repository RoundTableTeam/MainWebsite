<script>
    import Navbar from '../inc/navbar.svelte'

    import Title from '../inc/title.svelte'
    import Office from '../inc/contact/office.svelte'
    import Image from '../inc/contact/image.svelte'
    import Map from '../inc/contact/map.svelte'
    import S_contact from '../inc/contact/s_contact.svelte'

    import Footer from '../inc/footer.svelte'
</script>
<main>
    <Navbar/>

<section class="no-padding one-third-screen position-relative">
            <div class="opacity-full bg-gradient-fast-blue-purple z-index-0"></div>
            <div class="container h-100">
                <div class="row align-items-end justify-content-center h-100">
                    <div class="col-12 col-xl-6 col-lg-7 col-md-10 position-relative page-title-large text-center">
                        <h1 class="text-white alt-font font-weight-500 letter-spacing-minus-1 margin-5-rem-bottom sm-margin-3-rem-bottom">با ما درتماس باشید</h1>
                        <span class="w-1px h-80px d-inline-block bg-white margin-5-rem-bottom sm-margin-3-rem-bottom sm-h-50px"></span>
                    </div>
                </div>
            </div>
        </section>

    <Office/>
    <Image/>
    <br>
    <Map/>
    <S_contact/>

    <Footer/>
</main>

<style>

</style>