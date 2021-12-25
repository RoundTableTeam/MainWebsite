<script>
    import Navbar from '../inc/navbar.svelte'
    import Hero from '../inc/home/hero.svelte'
    import Partners from '../inc/home/partners.svelte'
    import About from '../inc/home/about.svelte'
    import Ability from '../inc/home/ability.svelte'
    import Process from '../inc/home/process.svelte'
    import Samples from '../inc/home/samples.svelte'
    import Team from '../inc/home/team.svelte'
    import Explain from '../inc/home/explain.svelte'
    import Counter from '../inc/home/counter.svelte'
    import Footer from '../inc/footer.svelte'
</script>
<svelte:head>
    <script src="../../js/jquery.min.js"> </script>
    <script src="../../js/theme-vendors.min.js"> </script>
    <script src="../../js/main.js"> </script>
</svelte:head>
<main>
    <Navbar/>
    <Hero/>
    <Partners/>
    <About/>
    <Ability/>
    <Process/>
    <Samples/>
    <Explain/>
    <Team/>
    <Footer/>
</main>

<style>

</style>