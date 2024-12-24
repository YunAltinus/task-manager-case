<template>
    <Tag :value="priorityTexts[props.priority]" :severity="prioritySeverities[props.priority]" />
</template>

<script setup>
import { Tag } from 'primevue'

const props = defineProps({
    priority: {
        type: String,
    },
})
const prioritySeverities = {
    'high': 'danger',
    'medium': 'warn',
    'low': 'info',
}

const priorityTexts = {
    'high': 'Yüksek',
    'medium': 'Orta',
    'low': 'Düşük',
}

</script>