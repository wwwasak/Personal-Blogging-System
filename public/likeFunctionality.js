const likeButton = document.getElementById('like-button');
const likeIcon = document.getElementById('like-icon');
const likeCountElement = document.getElementById('like-count');
const usersLikedList = document.getElementById('users-liked-list');

let userHasLiked = false;
let likesCount = 0;
let usersLiked = [];

likeButton.addEventListener('click', async () => {
    const articleId = likeButton.getAttribute('data-article-id');
    const userId = likeButton.getAttribute('data-user-id');

    try {
        if (!userHasLiked) {
            const response = await fetch('/likeArticle', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ userId, articleId }),
            });

            if (response.ok) {
                likeIcon.style.color = 'red';
                userHasLiked = true;
                likesCount++;
                usersLiked.push({ id: userId, account: `User ${userId}` });
                updateUI();
            } else {
                console.error('error');
            }
        } else {
            const response = await fetch('/unlikeArticle', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ userId, articleId }),
            });

            if (response.ok) {
                likeIcon.style.color = 'black';
                userHasLiked = false;
                likesCount--;
                usersLiked = usersLiked.filter(user => user.id !== userId);
                updateUI();
            } else {
                console.error('error');
            }
        }
    } catch (error) {
        console.error(error);
    }
});

function updateUI() {
    const likeColor = userHasLiked ? 'red' : 'black';

    likeIcon.style.color = likeColor;
    likeCountElement.textContent = `${likesCount} likes`;

    usersLikedList.innerHTML = '';

    usersLiked.forEach(user => {
        const listItem = document.createElement('li');
        const link = document.createElement('a');
        link.href = `/user/${user.id}`;
        link.textContent = user.account;
        listItem.appendChild(link);
        usersLikedList.appendChild(listItem);
    });
}
