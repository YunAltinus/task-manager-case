<template>
    <div ref="gallery" class="lightgallery">
        <slot />
    </div>
</template>

<script>
import lightGallery from 'lightgallery';
import lgThumbnail from 'lightgallery/plugins/thumbnail';
import lgVideo from 'lightgallery/plugins/video';
import 'lightgallery/css/lightgallery.css';
import 'lightgallery/css/lg-thumbnail.css';
import 'lightgallery/css/lg-video.css';

export default {
    name: 'LightGallery',
    mounted() {
        lightGallery(this.$refs.gallery, {
            plugins: [lgThumbnail, lgVideo],
            selector: 'a',
            share: false,
            actualSize: false,
            autoplay: false,
            autoplayControls: false,
            fullScreen: false,
            subHtmlSelectorRelative: false,
            controls: false,
            videojs: true,
            preload: false,
        });
    },
};
</script>

<style scoped>
.lightgallery {
    z-index: 99999;
}

.lg-backdrop {
    background-color: rgba(0, 0, 0, 0.5) !important;
}
</style>
