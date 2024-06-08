document.addEventListener('scroll', function() {
    var scrollPosition = window.pageYOffset;
    var bannerImage = document.querySelector('.banner img');
    var bannerText = document.querySelector('.banner-text');

    bannerImage.style.transform = 'translateY(' + scrollPosition * 0.5 + 'px)';
    bannerText.style.transform = 'translate(-50%, -50%) translateX('+ (-220 * scrollPosition / 100)+  '%) translateY(' + scrollPosition*0.75 + 'px)';
});

const { createApp, onMounted, reactive, ref, watch, computed } = Vue;

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
        const totalItems = ref(0);
        const currentPage = ref(1);
        const perPage = ref(10);
        const sortBy = ref("newest");
        const posts = ref([])
        const lastItem = ref(0)

        const paginationLength = 5; // This defines how many pagination links to display at once

        const pages = computed(() => {
            const totalPage = Math.ceil(totalItems.value / perPage.value);
            let start = currentPage.value - Math.floor(paginationLength / 2);
            let end = start + paginationLength - 1;
        
            // Adjust if the start is less than 1
            if (start < 1) {
                start = 1;
                end = Math.min(totalPage, paginationLength);
            }
        
            // Adjust if the end is more than totalPage
            if (end > totalPage) {
                end = totalPage;
                start = Math.max(1, end - paginationLength + 1);
            }
        
            return Array.from({ length: (end - start + 1) }, (_, i) => start + i);
        });
        
        const saveState = () => {
            const state = {
                currentPage: currentPage.value,
                perPage: perPage.value,
                sortBy: sortBy.value
            };
            sessionStorage.setItem('appState', JSON.stringify(state));
            console.log(sessionStorage.getItem('appState'))
        };
    
        const loadState = () => {
            const savedState = sessionStorage.getItem('appState');
            if (savedState) {
                const state = JSON.parse(savedState);
                currentPage.value = state.currentPage || 1;
                perPage.value = state.perPage || 10;
                sortBy.value = state.sortBy || 'newest';
            } else {
                currentPage.value = 1;
                perPage.value = 10;
                sortBy.value = "newest";
                saveState(); 
            }
            console.log("Loaded state: ", savedState);
        };
        
        const getPosts = () => {
            const xhr = new XMLHttpRequest();

        const apiURL = `https://suitmedia-backend.suitdev.com/api/ideas?page[number]=${currentPage.value}&page[size]=${perPage.value}&append[]=small_image&append[]=medium_image&sort=${sortBy.value =="newest"?"-":""}published_at`
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
                                image: post?.small_image[0]?.url? post.small_image[0].url : "https://via.placeholder.com/300"
                            }
                        }
                    )

                    totalItems.value = response.meta.total
                    lastItem.value = response.meta.to
                    console.log(response.meta.total)
                    console.log(posts.value)
                    console.log("pages: ", pages.value)
                    console.log("current page: ", currentPage.value)
                } else {
                    console.log("Error", xhr.status);
                }
            };

            xhr.send();

        }

        const setCurrentPage = (page) => {
            if (page < 1 || page > totalItems.value) return;
            console.log("current page: ", currentPage.value)
            currentPage.value = page;
        }
        

        watch([perPage, sortBy, currentPage], () => {
            saveState();
            getPosts();
        }, { immediate: false });

        onMounted(() => {
            loadState();
            getPosts();
        });

        return {
            totalPages: totalItems,
            currentPage,
            perPage,
            sortBy,
            getPosts,
            posts,
            pages,
            setCurrentPage,
            lastItem
        };
    }
};

createApp(App).component('card', Card).mount("#app");