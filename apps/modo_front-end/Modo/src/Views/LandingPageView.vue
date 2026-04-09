<script setup>
import NavBar from '../Components/NavBar.vue'
import { ref, onMounted, onUnmounted } from 'vue'

// Estado da animação
const titleActive = ref(false)
const textActive = ref(false)
let hasAnimated = false

// Timeouts
let titleTimeout = null
let textTimeout = null

// Elementos DOM
let sectionElement = null
let scrollElement = null

// Função de hover para animação
function handleMouseEnter() {
  if (hasAnimated) return
  hasAnimated = true

  titleTimeout = setTimeout(() => {
    titleActive.value = true
  }, 600)

  textTimeout = setTimeout(() => {
    textActive.value = true
  }, 1200)
}

// Função para scroll horizontal baseado no scroll vertical
function handleScroll() {
  if (!sectionElement || !scrollElement) return

  const start = sectionElement.offsetTop
  const height = sectionElement.offsetHeight
  const scrollY = window.scrollY

  if (scrollY < start || scrollY > start + height) return

  const progress = (scrollY - start) / height
  const maxMove = scrollElement.scrollWidth - window.innerWidth

  scrollElement.style.transform = `translateX(${-progress * maxMove}px)`
}

// Monta os elementos após render
onMounted(() => {
  sectionElement = document.querySelector('.scroll-section-color')
  scrollElement = document.querySelector('.scroll-section')

  window.addEventListener('scroll', handleScroll)
})

// Remove listeners
onUnmounted(() => {
  window.removeEventListener('scroll', handleScroll)

  // Limpa timeouts caso componente seja destruído
  clearTimeout(titleTimeout)
  clearTimeout(textTimeout)
})
</script>

<template>
  <div class="landing-page">
    <div class="navbar-layer">
      <NavBar />
    </div>

    <section class="hero-section">
      <div class="wave-back">
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1512 1019" preserveAspectRatio="none">
          <path
            d="M572 917.5C481 1000.92 206.5 1045 0 1002V0H1512V534C1484 518.5 1403.5 470.468 1273.5 505.5C1143.5 540.533 1114.46 592.339 1054 667.5C1017 713.5 962.36 780.701 863.5 795.5C780 808 638.21 856.808 572 917.5Z"
            fill="#CBEDDA"
          />
        </svg>
      </div>

      <div class="wave-front">
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1512 985" preserveAspectRatio="none">
          <defs>
            <linearGradient id="heroGradient" x1="756" y1="-239" x2="756" y2="968.18" gradientUnits="userSpaceOnUse">
              <stop offset="0%" stop-color="#CBEDDA" stop-opacity="0.7" />
              <stop offset="58%" stop-color="#97DBB4" />
            </linearGradient>
          </defs>

          <path
            d="M520 923C397.112 1011.97 206.5 990 0 947V0H1512V461.5C1460.5 443.5 1413.5 414.286 1317.5 428C1201.5 444.571 1162 512 1094.5 588C962.678 736.422 906.16 730.589 754 775.5C640.5 809 616 853.5 520 923Z"
            fill="url(#heroGradient)"
          />
        </svg>
      </div>

      <div class="hero-section-images">
        <div class="hero1">
          <img src="/src/images/hero_1.png" alt="Bicicleta" />
        </div>
        <div class="hero2">
          <img src="/src/images/hero_2.png" alt="Reciclagem" />
        </div>
        <div class="hero3">
          <img src="/src/images/hero_3.png" alt="Plantio" />
        </div>
      </div>

      <div class="hero-content">
        <div class="container">
          <h1 class="hero-title">
            Change your <br/> habits create <br/>
            your new you.
          </h1>
          <p class="hero-description">
            Turn your goals into quests to beat <br />making a better world by a better you!
          </p>
          <div class="ms-auto">
            <RouterLink class="letsStart-btn" to="/signin"> Let's start </RouterLink>
          </div>
        </div>
      </div>
    </section>

    <section id="case_studies" class="carousel-section">
      <div class="section-titles">
        <div>
          <h1>CASE STUDIES</h1>
        </div>
        <div>
          <h1>&#x2022;</h1>
        </div>
      </div>

      <div class="carousel">
        <div class="card card-1">
          <img src="/src/images/carousel_img1.jpeg" alt="" />
          <div class="content">
            <img class="carousel-logo" src="/src/images/M.png" alt="logo" />
            <h2>Separate your waste correctly and contribute to the recycling cycle</h2>
          </div>
        </div>

        <div class="card card-2">
          <img src="/src/images/carousel_img2.jpg" alt="" />
          <div class="content">
            <img class="carousel-logo" src="/src/images/M.png" alt="logo" />
            <h2>Save water while improving yourself</h2>
          </div>
        </div>

        <div class="card card-3">
          <img src="/src/images/carousel_img3.jpg" alt="" />
          <div class="content">
            <img class="carousel-logo" src="/src/images/M.png" alt="logo" />
            <h2>Walking or cycling for a better air quality for all of us</h2>
          </div>
        </div>
      </div>
    </section>

    <section class="scroll-section-color" ref="section" @mouseenter="handleMouseEnter">
      <div id="about" class="appear-section">
        <div class="section-titles">
          <div>
            <h1>THE NEED AND THE SOLUTION</h1>
          </div>
          <div>
            <h1>&#x2022;</h1>
          </div>
        </div>

        <div class="appear-content">
          <div class="appear-text">
            <h2 :class="{ active: titleActive }">Why we built Modo.</h2>

            <p :class="{ active: textActive }">
              We built Modo because we believe that while many people want to live a more eco-conscious life, 
              the path to true sustainability can feel overwhelming. 
              In a world of convenience and fast consumption, it is easy to lose track of the small, 
              daily actions that lead to a significant environmental impact.
              <br><br>
              Modo was designed to bridge the gap between intention and action. 
              We’ve created a dedicated space for sustainable habit-tracking that helps you stay committed to a greener lifestyle.
            </p>
          </div>

          <img class="appear-detail" src="/src/images/scrol_detail.png" />
        </div>
      </div>
      <div class="scroll-section" ref="scroll">
        <img src="/src/images/scroll_img1.jpg" alt="" />
        <img src="/src/images/scroll_img2.png" alt="" />
        <img src="/src/images/scroll_img3.png" alt="" />
        <img src="/src/images/scroll_img4.png" alt="" />
      </div>
    </section>

    <section class="sponsors-section">
      <h3>It wasn't possible without these organizations</h3>
      <div class="sponsors-carousel">
        <div class="sponsors">
          <div class="card-sponsers" style="padding-top: 18px">
            <img src="/src/images/pPortoLogo.png" alt="P.Porto Logo" />
          </div>
          <div class="card-sponsers" style="padding-top: 4px">
            <img src="/src/images/portoLogo.png" alt="Porto Logo" />
          </div>
          <div class="card-sponsers" style="padding-top: 5px">
            <img src="/src/images/esmadLogo.png" alt="Esmad Logo" />
          </div>
          <div class="card-sponsers" style="padding-top: 18px">
            <img src="/src/images/pPortoLogo.png" alt="P.Porto Logo" />
          </div>
          <div class="card-sponsers" style="padding-top: 4px">
            <img src="/src/images/portoLogo.png" alt="Porto Logo" />
          </div>
          <div class="card-sponsers" style="padding-top: 5px">
            <img src="/src/images/esmadLogo.png" alt="Esmad Logo" />
          </div>
        </div>
        <div aria-hidden class="sponsors">
          <div class="card-sponsers" style="padding-top: 18px">
            <img src="/src/images/pPortoLogo.png" alt="P.Porto Logo" />
          </div>
          <div class="card-sponsers" style="padding-top: 4px">
            <img src="/src/images/portoLogo.png" alt="Porto Logo" />
          </div>
          <div class="card-sponsers" style="padding-top: 5px">
            <img src="/src/images/esmadLogo.png" alt="Esmad Logo" />
          </div>
          <div class="card-sponsers" style="padding-top: 18px">
            <img src="/src/images/pPortoLogo.png" alt="P.Porto Logo" />
          </div>
          <div class="card-sponsers" style="padding-top: 4px">
            <img src="/src/images/portoLogo.png" alt="Porto Logo" />
          </div>
          <div class="card-sponsers" style="padding-top: 5px">
            <img src="/src/images/esmadLogo.png" alt="Esmad Logo" />
          </div>
        </div>
      </div>
    </section>

    <section class="info-section">
      <div class="wave-back-2">
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1512 1639" preserveAspectRatio="none">
          <path
            d="M419 54C320.869 0.209347 185.664 0.000562976 0 0V1639H1512V269.5C1272.5 269.5 1263 171.948 1104.5 161.5C967.68 152.481 905.963 218.279 736 206.5C566.037 194.721 566.5 134.852 419 54Z"
            fill="#355D4C"
          />
        </svg>

        <div id="faq" class="faq-section container">
          <div class="faq-title text-center mb-4">
            <h2>Got questions? We got answers!</h2>
          </div>

          <div class="accordion" id="faqAccordion">
            <div class="accordion-item">
              <h2 class="accordion-header" id="headingOne">
                <button
                  class="accordion-button"
                  type="button"
                  data-bs-toggle="collapse"
                  data-bs-target="#collapseOne"
                  aria-expanded="true"
                  aria-controls="collapseOne"
                >
                  What is Modo?
                </button>
              </h2>
              <div
                id="collapseOne"
                class="accordion-collapse collapse show"
                aria-labelledby="headingOne"
                data-bs-parent="#faqAccordion"
              >
                <div class="accordion-body">
                  Modo is a sustainability tracker designed to help you build a greener lifestyle. 
                  It gamifies your environmental impact by rewarding you with points for every eco-friendly action you complete, 
                  turning personal growth into a win for the planet.
                </div>
              </div>
            </div>

            <div class="accordion-item">
              <h2 class="accordion-header" id="headingTwo">
                <button
                  class="accordion-button collapsed"
                  type="button"
                  data-bs-toggle="collapse"
                  data-bs-target="#collapseTwo"
                  aria-expanded="false"
                  aria-controls="collapseTwo"
                >
                  Is there an iOS or Android App?
                </button>
              </h2>
              <div
                id="collapseTwo"
                class="accordion-collapse collapse"
                aria-labelledby="headingTwo"
                data-bs-parent="#faqAccordion"
              >
                <div class="accordion-body">
                  Right now, Modo is available via web browser on all devices. 
                  We’re working hard on native iOS and Android apps to make sustainable living even easier for our community. 
                  Stay tuned for updates!
                </div>
              </div>
            </div>

            <div class="accordion-item">
              <h2 class="accordion-header" id="headingThree">
                <button
                  class="accordion-button collapsed"
                  type="button"
                  data-bs-toggle="collapse"
                  data-bs-target="#collapseThree"
                  aria-expanded="false"
                  aria-controls="collapseThree"
                >
                  How many habits can I track?
                </button>
              </h2>
              <div
                id="collapseThree"
                class="accordion-collapse collapse"
                aria-labelledby="headingThree"
                data-bs-parent="#faqAccordion"
              >
                <div class="accordion-body">
                  As many as you need to make a real impact, though we recommend starting with 3 to 5 core rituals.
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div class="wave-back-3">
        <svg
          xmlns="http://www.w3.org/2000/svg"
          width="1028"
          height="323"
          viewBox="0 0 1028 323"
          fill="none"
        >
          <path
            d="M404.728 63.1583C201 80.6583 175.5 145.158 0 145.158V322.658H1027.5V0.15901C905.5 -4.34081 832 88.158 700 88.1582C615 88.1583 558.163 49.9784 404.728 63.1583Z"
            fill="#97DBB4"
          />
        </svg>
      </div>
    </section>
  </div>
</template>
