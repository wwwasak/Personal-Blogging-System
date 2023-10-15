document.addEventListener("DOMContentLoaded", function() {
    document.getElementById('openModalBtn').onclick = function() {
        document.getElementById('commentModal').style.display = "block";
    }
        
    document.getElementById('closeModalBtn').onclick = function() {
        document.getElementById('commentModal').style.display = "none";
    }
});