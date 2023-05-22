# Методы

- Запрос http://localhost:8000/create - для создания пользователя Ответом на этот запрос будет SSID в Заголовке Authorization и user_id
```json
{
    "login":"admin",
    "password":"admin",
    "photo":"D:\\ok\\ok.jpg",
    "date_of_birth":"2003-01-20",
    "name":"Artem"
}
```

- Запрос http://localhost:8000/ssdelete?user_id= - удаляет сессию пользователя с user_id требует сессионный id
Ответ ок и статус 200 означает что сессия удалена 

- Запрос http://localhost:8000/?login= &password= - для входа в аккаунт пользователя 
Ответ user_id и id новой созданной сессии в заголовке Authorization

- Запрос http://localhost:8000/user?user_id=1 - возращает информамцию о пользователе, требует ssid в заголовке Authorization
Ответ json пользователя с user_id 


# Запуск

```
git clone https://github.com/Natsegad/front-back.git 
cd front-back
npm i
npm run dev
```

После заходим по пути $proj-path$/front и запускаем index.html
