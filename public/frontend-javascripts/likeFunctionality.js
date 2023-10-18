document.addEventListener("DOMContentLoaded", async function () {
    const likeButton = document.querySelector("#like-button");
    const likeIcon = document.querySelector("#like-icon");
    const articleId = likeButton.getAttribute("data-article-id");
    const userId = likeButton.getAttribute("data-user-id");
    const response = await fetch(`/hasUserLikedArticle?userId=${userId}&articleId=${articleId}`)
    const hasUserLikedArticle = await response.json();
    if (hasUserLikedArticle) {
        likeIcon.style.color = "red";
    }
    else {
        likeIcon.style.color = "black";
    }
    likeButton.addEventListener("click", async (e) => {
        console.log("like button clicked");
        if (!hasUserLikedArticle) {
            console.log("user has not liked article");
            result = await fetch(`/likeArticle?userId=${userId}&articleId=${articleId}`)
            likeIcon.style.color = "red";
        }
        else {
            result = await fetch(`/unlikeArticle?userId=${userId}&articleId=${articleId}`)
            likeIcon.style.color = "black";
        }
        location.reload();
    });
});



