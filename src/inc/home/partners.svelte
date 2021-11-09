<script>
    import {clients} from "../../data/clients";
    let _clients = clients.slice(0,4)
</script>

<section class="padding-100px-tb bg-gradient-white-light-gray md-padding-75px-tb sm-padding-50px-tb">
    <div class="container">
        <div class="row align-items-center row-cols-1 row-cols-lg-4 row-cols-sm-2 client-logo-style-02">
            {#each _clients as client}
            <div title="{client.name}" class="col text-center md-margin-50px-bottom wow animate__fadeIn">
                <a href="{client.link}" class="client-logo"><img alt="{client.name}" src="{client.img}"></a>
            </div>
            {/each}

        </div>
    </div>
</section>