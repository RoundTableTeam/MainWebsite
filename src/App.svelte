<script>
	// This file is for routing
	// You can mount a Route. as SPA

	import router from "page"
	import Home from './comps/home.svelte'
	import About from './comps/about.svelte'
	import Team from './comps/team.svelte'
	import Contact from './comps/contact.svelte'
	import Service from './comps/services.svelte'
	import Portfolio from './comps/portfolio.svelte'
	import NotFound from './comps/not_found.svelte'

	let page;
	router('/', () => page = Home)
	router('/about', () => page = About)
	router('/team', () => page = Team)
	router('/contact', () => page = Contact)
	router('/service', () => page = Service)
	router('/Portfolio', () => page = Portfolio)
	router('*', () => page = NotFound)


	router.start()
</script>

<main>
	<svelte:component this={page} />
</main>

<style>
</style>