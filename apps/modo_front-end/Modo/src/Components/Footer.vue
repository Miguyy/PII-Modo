<template>
  <footer :class="['modo-global-footer', { 'no-top-margin': route.path === '/' }]">
    <div class="container pt-5 pb-4">
      <div class="footer-border-top mb-5"></div>

      <div class="row">
        <!-- Left Side: Brand and Info -->
        <div class="col-lg-6 mb-4 mb-lg-0 pe-lg-5">
          <div class="mb-4">
            <img src="@/images/modoLogoNavbar.png" alt="Modo Logo" class="footer-logo" />
          </div>
          <h4 class="mb-5 footer-slogan">The best tracker to change who you are.</h4>
          <p class="footer-copyright mb-4">
            Copyright 2026 Modo Services, Inc. All Rights Reserved.
          </p>
          <div class="social-icons d-flex gap-3">
            <a href="#" class="social-link"><i class="bi bi-instagram"></i></a>
            <a href="#" class="social-link"><i class="bi bi-linkedin"></i></a>
            <a href="#" class="social-link">
              <!-- Custom SVG for X logo to match design -->
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="16"
                height="16"
                fill="currentColor"
                class="bi bi-twitter-x"
                viewBox="0 0 16 16"
              >
                <path
                  d="M12.6.75h2.454l-5.36 6.142L16 15.25h-4.937l-3.867-5.07-4.425 5.07H.316l5.733-6.57L0 .75h5.063l3.495 4.633L12.601.75Zm-.86 13.028h1.36L4.323 2.145H2.865l8.875 11.633Z"
                />
              </svg>
            </a>
          </div>
        </div>

        <!-- Right Side: Links -->
        <div class="col-lg-6">
          <div class="row">
            <div class="col-4">
              <h5 class="footer-heading mb-4">Products</h5>
              <ul class="list-unstyled footer-list">
                <li><a href="#">iOS App</a></li>
                <li><a href="#">Android App</a></li>
                <li><a href="#">Web App</a></li>
                <li><a href="#">Updates</a></li>
              </ul>
            </div>
            <div class="col-4">
              <h5 class="footer-heading mb-4">About</h5>
              <ul class="list-unstyled footer-list">
                <li><a href="#">Our Team</a></li>
                <li><a href="#">Our Mission</a></li>
              </ul>
            </div>
            <div class="col-4">
              <h5 class="footer-heading mb-4">Legal</h5>
              <ul class="list-unstyled footer-list">
                <li><a href="#">Privacy</a></li>
                <li><a href="#">Terms of Service</a></li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  </footer>
</template>

<script setup>
import { useRoute } from 'vue-router'
const route = useRoute()
</script>

<style scoped>
/* Global Footer Styles */
.modo-global-footer {
  flex-shrink: 0;
  width: 100%;
  background-color: var(--primary-color);
  color: #fff;
  margin-top: 80px;
}

.modo-global-footer.no-top-margin {
  margin-top: 0;
}

.footer-border-top {
  border-top: 1px dashed rgba(255, 255, 255, 0.3);
  width: 100%;
}

.footer-logo {
  height: 35px;
  width: auto;
  /* Force logo to pure white if it isn't already */
  filter: brightness(0) invert(1);
}

.footer-slogan {
  font-weight: 500;
  font-size: 1.25rem;
  color: #fff;
}

.footer-copyright {
  font-size: 0.8rem;
  color: rgba(255, 255, 255, 0.5);
}

.social-link {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  color: #fff;
  font-size: 1.2rem;
  transition: opacity 0.2s ease;
}

.social-link:hover {
  opacity: 0.7;
}

.footer-heading {
  font-size: 1.1rem;
  font-weight: 500;
  color: #fff;
}

.footer-list {
  padding: 0;
  margin: 0;
}

.footer-list li {
  margin-bottom: 0.75rem;
}

.footer-list a {
  color: rgba(255, 255, 255, 0.7);
  text-decoration: none;
  font-size: 0.95rem;
  transition: color 0.2s ease;
}

.footer-list a:hover {
  color: #fff;
}
</style>
