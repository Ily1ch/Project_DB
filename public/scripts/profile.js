document.addEventListener("DOMContentLoaded", async () => {
    try {
      // Получение данных о пользователе
      const userResponse = await fetch("/profile", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
      });

      if (userResponse.ok) {
        const userData = await userResponse.json();

        if (userData) {
          // Сохраняем ID пользователя в localStorage
        localStorage.setItem("activeUserId", userData.user_id);

        // Выводим ID пользователя в консоль
        console.log("ID пользователя:", userData.user_id);
        

          document.getElementById("userId").textContent =
            userData.user_id || "Нет данных";
            
          document.getElementById("login").textContent =
            userData.login || "Нет данных";
          document.getElementById("email").textContent =
            userData.email || "Нет данных";
          document.getElementById("phoneNumber").textContent =
            userData.phone_number || "Нет данных";
        } else {
          console.error("Ошибка: Данные пользователя не получены.");
        }
      } else {
        console.error(
          "Ошибка при получении данных пользователя:",
          userResponse.status
        );
      }

      // Получение данных о месте заказа
      const deliveryResponse = await fetch("/deliveryPlaces", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
      });

      if (deliveryResponse.ok) {
        const deliveryData = await deliveryResponse.json();

        if (deliveryData) {
          document.getElementById("city").textContent =
            deliveryData.street_name || "Нет данных";
          document.getElementById("address").textContent =
            deliveryData.house_number || "Нет данных";
          document.getElementById("postalCode").textContent =
            deliveryData.UserName || "Нет данных";
        } else {
          console.error("Ошибка: Данные о месте заказа не получены.");
        }
      } else {
        console.error(
          "Ошибка при получении данных о месте заказа:",
          deliveryResponse.status
        );
      }
    } catch (error) {
      console.error("Ошибка при отправке запросов на сервер:", error);
    }

    // Обработчик для кнопки "Выйти из профиля"
    const logoutButton = document.querySelector("#logoutButton");

    if (logoutButton) {
      logoutButton.addEventListener("click", () => {
        // Удаление токена из локального хранилища
        localStorage.clear();

        // Перенаправление пользователя на страницу выхода
        window.location.href = "/authorization"; // Замените "/logout" на реальный URL для выхода
      });
    }
  });

  // Фронтенд
  document.addEventListener("DOMContentLoaded", async () => {
    try {
      // Получение данных о товарах в корзине пользователя
      
      const userId = localStorage.getItem("activeUserId");
      console.log(userId);

      if (!userId) {
        console.error("Id пользователя не найден.");
        return;
      }

      const cartResponse = await fetch(`/shoppingCart?userId=${userId}`, {
        method: "GET",
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
      });

      if (cartResponse.ok) {
        const cartItems = await cartResponse.json();

        if (cartItems.length > 0) {
          const cartItemList = document.getElementById("cartItemList");

          cartItems.forEach((item) => {
            const tableRow = document.createElement("tr");
            tableRow.innerHTML = `
                        <td>${item.model_name}</td>
                        <td>${item.quantity} Шт.</td>
                        <td>${item.model_price} Руб.</td>
                        <td>${item.total_price} Руб.</td>
                    `;
            cartItemList.appendChild(tableRow);
          });
        } else {
          console.log("Корзина пуста.");
        }
      } else {
        console.error(
          "Ошибка при получении данных о товарах в корзине:",
          cartResponse.status
        );
      }
    } catch (error) {
      console.error("Ошибка при отправке запроса на сервер:", error);
    }
  });
  