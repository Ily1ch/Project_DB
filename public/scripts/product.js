document.addEventListener("DOMContentLoaded", () => {
    const params = new URLSearchParams(window.location.search);
    const modelId = params.get("id");

    if (!modelId) {
      console.error(
        "Идентификатор модели отсутствует в параметрах запроса."
      );
      return;
    }

    const requestData = { model_id: modelId };

    fetch("/product", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(requestData),
    })
      .then((response) => response.json())
      .then((model) => {
        const productDetails = document.getElementById("productDetails");
        productDetails.innerHTML = `
        <div class="mainContainer">
          
          <h2>Робот-пылесос ${model.VacuumTypeName} ${
          model.ModelName
        }   </h2>
          <div class="imgAndInfo">
          <div class="MainHeader">
            <img src="${model.image_url}" " class="product-image">
          </div>
    
          <div class="info-table">
            <h3>Общая информация</h3>
            <table>
              <tr>
                <th>Параметр</th>
                <th>Значение</th>
              </tr>
              <tr>
                <td>Производитель</td>
                <td>${model.ManufacturerName}</td>
              </tr>
              <tr>
                <td>Тип</td>
                <td>${model.VacuumTypeName}</td>
              </tr>
              <tr>
                <td>Год выхода</td>
                <td>${model.release_date.slice(0, 4)}</td>
              </tr>
            </table>
          </div>
          </div>
          <div class="main-table">
            <h3>Характеристики</h3>
            <table>
              <tr>
                <th>Параметр</th>
                <th>Значение</th>
              </tr>
              <tr>
                <td>Вес</td>
                <td>${model.weight} Кг</td>
              </tr>
              <tr>
                <td>Время уборки</td>
                <td>${model.cleaning_time} Мин</td>
              </tr>
            </table>
            </div>
            </div>
            <div class="price-and-button">
              <p>Цена ${model.price} Руб</p>
              <a href="makingAnOrder?id=${
                model.model_id
              }" class="button28">Оформить заказ</a>
            </div>
  `;
      })
      .catch((error) => console.error("Ошибка получения данных:", error));
  });

  document.addEventListener("DOMContentLoaded", () => {
    // Получаем идентификатор модели пылесоса из параметров URL
    const params = new URLSearchParams(window.location.search);
    const modelId = params.get("id");

    if (modelId) {
      // Сохраняем идентификатор модели пылесоса в локальное хранилище
      localStorage.setItem("activeModelId", modelId);
      console.log("ID активной модели:", modelId);
    }
  });

  document.addEventListener("DOMContentLoaded", () => {
    const storedToken = localStorage.getItem("token");

    if (storedToken) {
      console.log("Токен:", storedToken);

      // Раскодируем токен, чтобы получить данные пользователя
      try {
        const decodedToken = JSON.parse(atob(storedToken.split(".")[1]));
        if (decodedToken && decodedToken.login === "admin") {
          const adminOnlyLinks = document.querySelectorAll(
            ".editbuttonAdmineOnly"
          );
          adminOnlyLinks.forEach((link) => (link.style.display = "block"));
        }
      } catch (error) {
        console.error("Ошибка при декодировании токена:", error);
      }
    } else {
      console.log("Токен не найден в локальном хранилище.");
    }
  });

  document.addEventListener("DOMContentLoaded", async () => {
    try {
      // Отправляем запрос на сервер для получения данных о пользователе
      const userResponse = await fetch("/getActiveUserId", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
      });

      if (userResponse.ok) {
        const userData = await userResponse.json();

        if (userData && userData.user_id) {
          // Сохраняем ID пользователя в localStorage
          localStorage.setItem("activeUserId", userData.user_id);
          console.log(
            "ID активного пользователя сохранено:",
            userData.user_id
          );
        } else {
          console.error("Ошибка: ID пользователя не получен.");
        }
      } else {
        console.error(
          "Ошибка при получении данных пользователя:",
          userResponse.status
        );
      }
    } catch (error) {
      console.error("Ошибка при отправке запроса на сервер:", error);
    }
  });

  document.addEventListener("DOMContentLoaded", () => {
    // ... Ваш текущий код ...

    // Обработчик для кнопки "Оформить заказ"
    const orderButton = document.querySelector(".cardOrders");
    orderButton.addEventListener("click", async () => {
      try {
        // Получаем ID пользователя и ID модели из локального хранилища
        const activeUserId = localStorage.getItem("activeUserId");
        const activeModelId = localStorage.getItem("activeModelId");

        // Проверяем, что оба ID получены
        if (!activeUserId || !activeModelId) {
          console.error(
            "Не удалось получить ID пользователя или ID модели."
          );
          return;
        }

        // Формируем данные для отправки на сервер
        const requestData = {
          user_id: activeUserId,
          model_id: activeModelId,
          quantity: 1, // Пример количества, можно настроить по вашему
        };

        // Отправляем данные на сервер
        const response = await fetch("/add-to-cart", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
          body: JSON.stringify(requestData),
        });

        if (response.ok) {
          console.log("Товар успешно добавлен в корзину.");
          // Можно добавить дополнительные действия после успешного добавления в корзину
        } else {
          console.error(
            "Ошибка при добавлении товара в корзину:!!",
            response.status
          );
        }
      } catch (error) {
        console.error("Ошибка при выполнении запроса:", error);
      }
    });
  });



  document.addEventListener("DOMContentLoaded", () => {
// Обработчик для кнопки "Оформить заказ"
const orderButton = document.querySelector(".cardOrders");

if (orderButton) {
orderButton.addEventListener("click", async () => {
  try {
    // Ваш код обработки события
  } catch (error) {
    console.error("Ошибка при выполнении запроса:", error);
  }
});
} else {
console.error("Элемент с классом 'cardOrders' не найден.");
}
});