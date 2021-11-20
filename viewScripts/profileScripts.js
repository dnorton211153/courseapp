document.getElementById('userUpdateForm').addEventListener('submit', (e) => {
    handlePost('/updateAccount', {
        _id: e.target.elements.id.value,
        username: e.target.elements.username.value,
        firstname: e.target.elements.firstname.value,
        surname: e.target.elements.surname.value,
        password: e.target.elements.password.value,
        confirm: e.target.elements.confirm.value
    }, (response) => {
        document.getElementById('feedback').innerHTML = response;
    })
    e.preventDefault();
})


Array.from(document.querySelectorAll('.userQuiz')).forEach(userQuiz => {
    userQuiz.addEventListener('click', (e) => {

        let userQuizId = e.target.elements.userQuizId.value;

        handlePost('/quiz', {
            userQuizId: userQuizId
        }, (response) => {
            let userQuiz = JSON.parse(response);
            
            localStorage.setItem(userQuiz.userId+userQuiz.quizId, JSON.stringify({
                userAnswers: userQuiz.answers,
                timeRemaining: 0
            }))

            window.location.href='/quizActive/review/' +  userQuiz.quizId;
        })

        e.preventDefault();

    })
})

Array.from(document.querySelectorAll('.courseLink')).forEach(el => {
    el.addEventListener('click', (e) => {
        window.location.href='/courseAdmin/' + e.target.parentNode.querySelector('input').value;
    })
})