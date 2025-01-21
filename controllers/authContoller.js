const User = require("../models/User");
const authService = require("../services/authService");

exports.loginInstagram = (req, res) => {
  const scopes =
    "instagram_business_basic,instagram_business_content_publish,instagram_business_manage_messages,instagram_business_manage_comments";

  res.send(`
    <h1>Instagram Login Demo</h1>
    <a href="https://www.instagram.com/oauth/authorize?client_id=${process.env.CLIENT_ID}&redirect_uri=${process.env.REDIRECT_URI}&response_type=code&scope=${scopes}">Login with Instagram</a>
  `);
};

exports.callback = async (req, res) => {
  const { code } = req.query;

  if (!code) {
    return res.status(400).send(`
      <html>
        <head>
          <title>Ошибка авторизации</title>
          <style>
            body {
              font-family: Arial, sans-serif;
              background-color: #ffefef;
              color: #d32f2f;
              text-align: center;
              padding: 50px;
            }
            h1 {
              font-size: 48px;
            }
            p {
              font-size: 18px;
            }
          </style>
        </head>
        <body>
          <h1>Ошибка авторизации</h1>
          <p>Код авторизации отсутствует. Пожалуйста, попробуйте снова.</p>
        </body>
      </html>
    `);
  }
  const longLivedAccessToken = await authService.exchangeCodeForToken(code);
  try {
    res.send(`
        <html>
          <head>
            <title>Авторизация успешна</title>
            <style>
              body {
                font-family: Arial, sans-serif;
                background-color: #e8f5e9;
                color: #388e3c;
                text-align: center;
                padding: 50px;
              }
              h1 {
                font-size: 48px;
              }
              p {
                font-size: 18px;
              }
            </style>
            <script>
              // Получаем токен Instagram
              const instagramToken = "${longLivedAccessToken}";
  
              // Сохраняем Instagram токен в localStorage
              localStorage.setItem('instagramToken', instagramToken);
  
              // Проверяем наличие accessToken в localStorage
              const accessToken = localStorage.getItem('accessToken');
              console.log("accessToken: ", accessToken)
  
                // Отправляем Instagram токен на сервер
                fetch('/update-instagram-token', {
                  method: 'POST',
                  headers: {
                    'Content-Type': 'application/json',
                    Authorization: "Bearer localStorage.getItem('accessToken')",
                  },
                  body: JSON.stringify({ instagramToken }),
                })
                  .then((response) => response.json())
                  .then((data) => {
                    console.log(data.message);
                  })
                  .catch((error) => {
                    console.error('Ошибка при обновлении токена Instagram:', error);
                  });
  
              // Перенаправление через 3 секунды
              setTimeout(() => {
                window.location.href = 'https://www.melek-crm.kz'; // Замените на ваш URL
              }, 3000);
            </script>
          </head>
          <body>
            <h1>Авторизация успешна</h1>
            <p>Ваш Instagram токен успешно сгенерирован и сохранён.</p>
            <p>Сейчас вы будете перенаправлены...</p>
          </body>
        </html>
        `);
  } catch (error) {
    console.error("Ошибка при обмене токена:", error);

    res.status(500).send(`
      <html>
        <head>
          <title>Ошибка</title>
          <style>
            body {
              font-family: Arial, sans-serif;
              background-color: #ffefef;
              color: #d32f2f;
              text-align: center;
              padding: 50px;
            }
            h1 {
              font-size: 48px;
            }
            p {
              font-size: 18px;
            }
          </style>
          <script>
            // Получаем токен Instagram
            const instagramToken = "${longLivedAccessToken}";
            console.log("instagramToken: ", instagramToken)

            // Сохраняем Instagram токен в localStorage
            localStorage.setItem('instagramToken', instagramToken);

            // Проверяем наличие accessToken в localStorage
            const accessToken = localStorage.getItem('accessToken');
            console.log("accessToken: ", accessToken)
          </script>
        </head>
        <body>
          <h1>Ошибка авторизации</h1>
          <p>Произошла ошибка при обмене токена. Пожалуйста, попробуйте снова.</p>
        </body>
      </html>
    `);
  }
};

exports.login = async (req, res) => {
  const { username, password } = req.body;
  try {
    const result = await authService.login(username, password);
    res.status(result.success ? 200 : 401).send(result);
  } catch (error) {
    console.error("LoginController error:", error);
    res
      .status(500)
      .send({ success: false, message: "An error occurred during login." });
  }
};

exports.refreshToken = async (req, res) => {
  const { refreshToken } = req.body;
  try {
    const result = await authService.refreshToken(refreshToken);
    res.status(result.success ? 200 : 401).send(result);
  } catch (error) {
    console.error("RefreshTokenController error:", error);
    res.status(500).send({
      success: false,
      message: "An error occurred during token refresh.",
    });
  }
};

exports.logout = async (req, res) => {
  const { refreshToken } = req.body;
  try {
    const result = await authService.logout(refreshToken);
    res.status(result.success ? 200 : 401).send(result);
  } catch (error) {
    console.error("LogoutController error:", error);
    res
      .status(500)
      .send({ success: false, message: "An error occurred during logout." });
  }
};

exports.registration = async (req, res) => {
  const { username, password } = req.body;
  try {
    const result = await authService.register(username, password);
    res.status(result.success ? 201 : 400).send(result);
  } catch (error) {
    console.error("RegisterController error:", error);
    res.status(500).send({
      success: false,
      message: "An error occurred during registration.",
    });
  }
};

exports.updateInstagramToken = async (req, res) => {
  const { instagramToken } = req.body;
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return res.status(401).json({ success: false, message: "Unauthorized" });
  }

  const accessToken = authHeader.split(" ")[1];

  try {
    // Расшифровываем accessToken
    const decoded = jwt.verify(accessToken, process.env.SECRET_KEY);
    const userId = decoded.id;

    // Ищем пользователя в базе данных
    const user = await User.findById(userId);
    if (!user) {
      return res
        .status(404)
        .json({ success: false, message: "User not found" });
    }

    // Обновляем поле instagramToken
    user.instagramToken = instagramToken;
    await user.save();

    res.json({
      success: true,
      message: "Instagram token updated successfully",
    });
  } catch (error) {
    console.error("Error updating Instagram token:", error);
    res.status(500).json({ success: false, message: "Internal server error" });
  }
};
