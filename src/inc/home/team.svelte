<script>
    import {teams} from "../../data/team";
    let _teams = teams.slice(0,4)
</script>
<section>
    <div class="container">
        <div class="row justify-content-center">
            <div class="col-12 col-xl-4 col-lg-5 col-md-7 col-sm-9 text-center last-paragraph-no-margin margin-6-rem-bottom md-margin-4-rem-bottom md-margin-5-rem-bottom wow animate__fadeIn">
                <h4 class="alt-font font-weight-600 text-extra-dark-gray letter-spacing-minus-1px margin-20px-bottom sm-margin-10px-bottom">تیم ما</h4>
                <p>متنی بنگار.</p>
            </div>
        </div>


        <div class="row row-cols-1 row-cols-lg-4 row-cols-sm-2 justify-content-center">
            {#each _teams as team}
                <div class="col team-style-01 text-start md-margin-30px-bottom xs-margin-15px-bottom wow animate__fadeIn" data-wow-delay="0.2s">
                <figure class="border-radius-5px">
                    <div class="team-member-image">
                        <img alt="" src="{team.img}">
                        <div class="team-overlay bg-transparent-gradient-fast-blue-purple border-radius-5px"></div>
                    </div>
                    <figcaption class="align-items-center d-flex flex-column padding-20px-lr padding-30px-tb">
                        <div class="social-icon mt-auto">
                            {#each team.social as social}
                                <a style="cursor: pointer" title="{social.name}" href="{social.link}" target="_blank" class="icon-very-small text-white"><i aria-hidden="true" class="{social.logo}"></i></a>
                            {/each}
                          </div>
                        <span class="team-title d-block alt-font text-white font-weight-500 mt-auto">{team.name}</span>
                        <span class="team-sub-title text-small d-block text-white-transparent text-uppercase">{team.role}</span>
                    </figcaption>
                </figure>
            </div>
            {/each}

        </div>


        <div class="row">
            <div class="col-12 text-center margin-6-half-rem-top lg-margin-5-rem-top wow animate__fadeIn" data-wow-delay="0.7s">
                        <span class="alt-font font-weight-500 text-extra-medium text-extra-dark-gray letter-spacing-minus-1-half">
                            دوست داشتی ؟
                            <a class="font-weight-600 text-fast-blue text-decoration-line-bottom" href="/team">همه رو ببین.</a>
                        </span>
            </div>
        </div>
    </div>
</section>