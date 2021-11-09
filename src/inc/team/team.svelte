<script>
    import {teams} from "../../data/team";
</script>

<section id="down-section" class="padding-100px-top md-padding-70px-top md-padding-40px-bottom sm-padding-50px-top xs-padding-20px-top sm-padding-25px-bottom">
    <div class="container-fluid padding-seven-lr xl-padding-three-lr md-padding-2-half-rem-lr xs-padding-15px-lr">
        <div class="row row-cols-1 row-cols-sm-2 row-cols-lg-3 row-cols-xl-4 justify-content-center">
            {#each teams as team}
                <div class="col team-style-02 text-center">
                <figure>
                    <div class="team-member-image border-radius-5px overflow-hidden">
                        <img alt="" src="{team.img}">
                        <div class="team-member-details bg-transparent-gradient-fast-blue-purple align-items-center justify-content-center d-flex flex-column padding-2-half-rem-lr">
                            <div class="text-white opacity-7 w-85 sm-w-95">{team.about}</div>
                            <div class="social-icon w-100 position-absolute bottom-40px left-0px">
                                {#each team.social as social}
                                <a style="cursor: pointer" title="{social.name}" href="{social.link}" target="_blank" class="icon-very-small text-white"><i aria-hidden="true" class="{social.logo}"></i></a>
                                {/each}
                            </div>
                        </div>
                    </div>
                    <figcaption class="team-member-position text-center padding-35px-tb sm-padding-25px-tb">
                        <div class="text-extra-dark-gray alt-font line-height-18px text-medium text-uppercase font-weight-500">{team.name}</div>
                        <span class="text-small text-uppercase">{team.role}</span>
                    </figcaption>
                </figure>
            </div>
            {/each}


        </div>
    </div>
</section>
