document.addEventListener("DOMContentLoaded", () => {

    document.querySelector(".log_in").addEventListener('click', () => {
        try {
           

            let login_get = new XMLHttpRequest()
            const url = "http://localhost:8000/?login=" + document.querySelector(".email").value + "&password=" + document.querySelector(".password").value
            console.log(url)

            let error_text = document.querySelector("#error_msg")
            console.log(error_text)
            error_text.classList.add("hide")

            login_get.open("GET", url)
            login_get.addEventListener("readystatechange", () => {
                if (login_get.status !== 200) {
                    error_text.classList.add("show")
                    return;
                }

                let user_id = JSON.parse(login_get.responseText)

                let auth = login_get.getResponseHeader("Authorization");
                if (auth) {

                    const url = "http://localhost:8000/user?user_id=" + user_id;
                    console.log(auth)

                    let user_info_request = new XMLHttpRequest();
                    user_info_request.open("GET", url)
                    user_info_request.setRequestHeader("Authorization", auth)
                    user_info_request.addEventListener("readystatechange", () => {
                        if (user_info_request.status === 200) {

                            let user_info = JSON.parse(user_info_request.responseText)
                            let bith_date = new Date(user_info.birth_date)
                         
                            document.querySelector(".session").classList.add('hide')
                            document.querySelector(".user").classList.remove('hide')

                            document.querySelector(".user_name").innerHTML = user_info.name;
                            document.querySelector(".user_image").setAttribute("src", user_info.image)
                            document.querySelector(".user_birth_date").innerHTML = bith_date.toLocaleDateString();

                            localStorage.setItem("user_id", user_id)
                            localStorage.setItem("ssid",auth)

                            document.querySelector('#animated-block').style.display = 'block';

                            setTimeout(()=>{
                                document.querySelector('#animated-block').style.opacity = '0';
                                setTimeout(()=>{
                                    document.querySelector('#animated-block').style.display = 'none';
                                },1000)
                            },10000);
                        }
                    })

                    user_info_request.send();
                }

            })

            login_get.send();
        } catch (e) {
            console.log(e)
        }
    })

    document.querySelector(".logout").addEventListener('click', () => {
        let logout = new XMLHttpRequest()
        const url = "http://localhost:8000/ssdelete?user_id=" + localStorage.getItem("user_id")
  
        logout.open("DELETE", url)
        logout.setRequestHeader("Authorization",localStorage.getItem("ssid"))
        logout.addEventListener("readystatechange", () => {
            if(logout.status !== 200){
                console.log("Ошибка удаление сессии: ",logout.responseText)
            }else{
                console.log("Сессия удалена")
                document.querySelector(".session").classList.remove('hide')
                document.querySelector(".user").classList.add('hide')

                document.querySelector('#animated-block').style.opacity = '1';

                localStorage.clear()
            }
        })

        logout.send()
    })
});