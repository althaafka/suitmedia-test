document.addEventListener('scroll', function() {
    var scrollPosition = window.pageYOffset;
    var bannerImage = document.querySelector('.banner img');
    var bannerText = document.querySelector('.banner-text');

    bannerImage.style.transform = 'translateY(' + scrollPosition * 0.5 + 'px)';
    bannerText.style.transform = 'translate(-50%, -50%) translateX('+ (-220 * scrollPosition / 100)+  '%) translateY(' + scrollPosition*0.75 + 'px)';
});

const { createApp, onMounted, reactive, ref, watch } = Vue;

const Card = {
    props: ["id","title", "date", "image"],
    template: `
        <div class="card" :id="id">
            <div class="image-container">
                <img loading="lazy" :src="image" :alt="image">
            </div>
            <div class="card-text">
                <div>{{ date }}</div>
                <h2>{{ title }}</h2>
            </div>
        </div>
    `
};


const App = {
    setup() {
        const totalPages = 10;
        const currentPage = reactive(1);
        const perPage = ref(10);
        const sortBy = ref("newest");
        const posts = ref([])

        const getPosts = () => {
            const xhr = new XMLHttpRequest();

        const apiURL = `https://suitmedia-backend.suitdev.com/api/ideas?page[number]=${currentPage}&page[size]=${perPage.value}&append[]=small_image&append[]=medium_image&sort=${sortBy.value =="newest"?"-":""}published_at`
            xhr.open("GET", apiURL, true);
            xhr.setRequestHeader("Content-Type", "application/json");
            xhr.setRequestHeader("Accept", "application/json");

            xhr.onload = function() {
                if (xhr.status === 200) {
                    const response = JSON.parse(xhr.responseText);
                    console.log(response);

                    posts.value = response.data.map(
                        (post) => {
                            return {
                                id: post.id,
                                title: post.title,
                                date: new Date(post.published_at).toLocaleDateString('id-ID', {
                                        day: 'numeric',
                                        month: 'long', 
                                        year: 'numeric' }),
                                image: post.small_image[0].url
                            }
                        }
                    )
                    console.log(posts.value)
                } else {
                    console.log("Error", xhr.status);
                }
            };

            xhr.send();

        }

        watch([perPage, sortBy], () => {
            getPosts();
        }, { immediate: true });

        onMounted(() => {
            getPosts();
        });

        return {
            totalPages,
            currentPage,
            perPage,
            sortBy,
            getPosts,
            posts
        };
    }
};

createApp(App).component('card', Card).mount("#app");