<script setup>
import SiteHeader from './components/SiteHeader.vue'
import HeroSection from './components/HeroSection.vue'
import DemoWindow from './components/DemoWindow.vue'
import PricingSection from './components/PricingSection.vue'
import FeaturesSection from './components/FeaturesSection.vue'
import DownloadsSection from './components/DownloadsSection.vue'
import SiteFooter from './components/SiteFooter.vue'
</script>

<template>
  <div id="top">
    <SiteHeader />
    <main>
      <HeroSection />
      <DemoWindow />
      <PricingSection />
      <FeaturesSection />
      <DownloadsSection />
    </main>
    <SiteFooter />
  </div>
</template>
