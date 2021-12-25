<script>
    let about_us = {
        title: "ما سه سال است که در این حوزه فعالیت داریم  .",
        desc: "گروه میزگرد که از سال 1397 در حوزه رشد کسب و کار شما در فضای مجازی شروع به کار کرده است با حضور مشاوران و متخصصان خود در این زمینه در سال های اخیر به پیشرفت های زیادی دست یافته است .",
        img: "images/about-2.png",
        link: {url: "/service", txt: "خدمات ما"}
    }
    let about_work = {
        title: "درباره کار ما",
        desc: "با شیوع کرونا و بسته شدن مشاغل فضای مجازی روز به روز در حال پیشرفت  است اگر شما هم به دنبال رشد کسب و کار خود در فضای مجازی هستید و نیاز به کمک دارید حتما با ما تماس بگیرید. ",
        img: "images/about-us-img-07.jpg",
    }

</script>

<section id="about" class="bg-light-gray">
    <div class="container">
        <div class="row">
            <div class="col-12 col-lg-4 pe-lg-0 d-flex md-margin-30px-bottom">
                <div class="w-100 md-h-700px sm-h-550px xs-h-450px cover-background" style="background-image:url('{about_us.img}');"></div>
            </div>
            <div class="col-12 col-lg-4 col-md-6 ps-lg-0 d-flex sm-margin-30px-bottom">
                <div class="justify-content-center w-100 d-flex flex-column bg-fast-blue padding-5-half-rem-lr lg-padding-3-rem-lr md-padding-4-rem-all">
                    <span style="text-align: right; direction: rtl" class="text-extra-large alt-font font-weight-500 text-white margin-20px-bottom d-block">{about_us.title}</span>
                    <p style="text-align: justify; direction: rtl" class="text-white opacity-7">{about_us.desc}</p>
                    <a style="text-align: right" href="{about_us.link.url}" class="btn btn-large btn-link text-white text-white-hover align-self-start">{about_us.link.txt}</a>
                </div>
            </div>
            <div class="col-12 col-lg-4 col-md-6">
                <img src="{about_work.img}" alt="" />
                <div class="bg-white padding-3-half-rem-lr padding-3-rem-tb lg-padding-2-rem-all md-padding-2-half-rem-all sm-padding-4-rem-all last-paragraph-no-margin">
                    <span class="alt-font text-extra-dark-gray font-weight-500 margin-10px-bottom d-block">{about_work.title}</span>
                    <p style="direction: rtl; text-align: justify; ">{about_work.desc}</p>
                </div>
            </div>
        </div>
    </div>
</section>