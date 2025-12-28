<script setup>
const props = defineProps({
  title: {
    type: String,
    default: "Button",
  },
  to: {
    type: String,
    required: true,
  },
});

const router = useRouter();

function handleClick() {
  router.push(props.to);
}
</script>

<style scoped>
button {
  display: inline-block;
  border-radius: 4px;
  background-color: #282828;
  border: none;
  color: #ffffff;
  text-align: center;
  font-size: 17px;
  padding: 16px;
  width: 130px;
  transition: all 0.5s;
  cursor: pointer;
  margin: 5px;
}

button span {
  cursor: pointer;
  display: inline-block;
  position: relative;
  transition: 0.5s;
}

button span:after {
  content: "»";
  position: absolute;
  opacity: 0;
  top: 0;
  right: -15px;
  top: 3px;
  transition: 0.5s;
}

button:hover span {
  padding-right: 15px;
}

button:hover span:after {
  opacity: 1;
  right: 0;
}
</style>

<template>
  <button @click="handleClick">
    <span>{{ title }}</span>
  </button>
</template>
