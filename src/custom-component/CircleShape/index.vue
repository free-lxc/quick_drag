<template>
  <div class="circle-shape">
    <v-text :prop-value="element.propValue" :element="element" />
  </div>
</template>

<script lang="ts" setup>
defineProps({
  propValue: {
    type: String,
    required: true,
    default: "",
  },
  element: {
    type: Object,
    default: () => {},
  },
})
</script>

<style lang="scss" scoped>
.circle-shape {
  width: 100%;
  height: 100%;
  border-radius: 50%;
  overflow: auto;
}
</style>
