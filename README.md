+ Добавить refresh токен
+ Добавить redis для refresh токенов user_id:[uuid_token_1, uuid_token_2, ...]
+ Добавить в redis кэширование пользователя на ACCESS_TOKEN_EXPIRE_MINUTES
+ Добавить csrf токен
# Реализация auth на клиенте (auth.js), отправлять jwt токены в заголовках и csrf токены вместе с cookies
# Связать с mongodb
# Установить зависимости для LibreOffice