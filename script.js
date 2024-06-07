document.addEventListener('scroll', function() {
    var scrollPosition = window.pageYOffset;
    var bannerImage = document.querySelector('.banner img');
    var bannerText = document.querySelector('.banner-text');

    bannerImage.style.transform = 'translateY(' + scrollPosition * 0.5 + 'px)';
    bannerText.style.transform = 'translate(-50%, -50%) translateX('+ (-220 * scrollPosition / 100)+  '%) translateY(' + scrollPosition*0.75 + 'px)';
});