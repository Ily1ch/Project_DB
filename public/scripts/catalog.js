      // function myFunction() {
      //   const dropdown = document.getElementById("myDropdown");
      //   dropdown.classList.toggle("show");
      // }

      const displayRoboticVacuums = () => {
        fetch("/models")
          .then((response) => response.json())
          .then((data) => {
            const modelsList = document.getElementById("modelsList");
            modelsList.innerHTML = "";

            data.forEach((model) => {
              const productDiv = document.createElement("div");
              productDiv.className = "product";
              productDiv.id = `model-${model.model_id}`;
              productDiv.innerHTML = `
                <img src="${model.image_url}" alt="${model.ModelName}" class="product-image">
                <div class="product-info">
                  <h3>Робот-пылесос ${model.VacuumTypeName} ${model.ModelName}</h3>
                  <p>Производитель: ${model.ManufacturerName}</p>
                  <p>В наличии: ${model.quantity} Ед</p>
                  <p>Вес: ${model.weight} Кг</p>
                  <div class="price-and-button">
                    <p>Цена: ${model.price} Руб</p>
                    <a href="product?id=${model.model_id}" class="button28">Купить сейчас</a>
                  </div>
                </div>
              `;
              modelsList.appendChild(productDiv);
            });
          })
          .catch((error) => console.error("Ошибка получения данных:", error));
      };

      document.addEventListener("DOMContentLoaded", displayRoboticVacuums);

      // Открывает модальное окно
      function openModal() {
        const modal = document.getElementById("modal");
        modal.style.display = "flex";
      }

      // Закрывает модальное окно
      function closeModal() {
        const modal = document.getElementById("modal");
        modal.style.display = "none";
      }

      document.addEventListener("DOMContentLoaded", () => {
        const storedToken = localStorage.getItem("token");

        if (storedToken) {
          console.log("Токен:", storedToken);

          // Раскодируем токен, чтобы получить данные пользователя
          try {
            const decodedToken = JSON.parse(atob(storedToken.split(".")[1]));
            if (decodedToken && decodedToken.login === "admin") {
              const adminOnlyLinks = document.querySelectorAll(".admin-only");
              adminOnlyLinks.forEach((link) => {
                link.style.display = "block";
                link.addEventListener("click", openModal);
              });

              // Закрытие модального окна при клике на крестик
              const closeButton = document.querySelector(".close");
              closeButton.addEventListener("click", closeModal);
            }
          } catch (error) {
            console.error("Ошибка при декодировании токена:", error);
          }
        } else {
          console.log("Токен не найден в локальном хранилище.");
        }
      });

      document.addEventListener("DOMContentLoaded", async () => {
        // Заполнение выпадающих списков производителей и типов пылесосов
        const manufacturerSelect = document.getElementById("manufacturer");
        const vacuumTypeSelect = document.getElementById("vacuumType");

        try {
          // Получение списка производителей
          const manufacturersResponse = await fetch("/getManufacturers");
          const manufacturersData = await manufacturersResponse.json();

          // Заполнение выпадающего списка производителей
          manufacturersData.forEach((manufacturer) => {
            const option = document.createElement("option");
            option.value = manufacturer.manufacturer_id;
            option.textContent = manufacturer.name;
            manufacturerSelect.appendChild(option);
          });

          // Получение списка типов пылесосов
          const vacuumTypesResponse = await fetch("/getVacuumTypes");
          const vacuumTypesData = await vacuumTypesResponse.json();

          // Заполнение выпадающего списка типов пылесосов
          vacuumTypesData.forEach((vacuumType) => {
            const option = document.createElement("option");
            option.value = vacuumType.type_id;
            option.textContent = vacuumType.type_name;
            vacuumTypeSelect.appendChild(option);
          });
        } catch (error) {
          console.error(
            "Ошибка при получении данных для выпадающих списков:",
            error
          );
        }

        // Добавление обработчика для формы добавления модели
        const addModelForm = document.getElementById("addModelForm");

        addModelForm.addEventListener("submit", async (event) => {
          event.preventDefault();

          const modelName = document.getElementById("modelName").value;
          const manufacturerId = manufacturerSelect.value;
          const typeId = vacuumTypeSelect.value;
          const quantity = document.getElementById("quantity").value;
          const price = document.getElementById("price").value;
          const cleaningTime = document.getElementById("cleaningTime").value;
          const releaseDate = document.getElementById("releaseDate").value;
          const weight = document.getElementById("weight").value;
          const imageUrl = document.getElementById("imageUrl").value;
          console.log(modelName, manufacturerId, typeId, weight);
          const requestData = {
            modelName,
            manufacturerId,
            typeId,
            quantity,
            price,
            cleaningTime,
            releaseDate,
            weight,
            imageUrl,
          };
          console.log(requestData);
          try {
            const response = await fetch("/addModel", {
              method: "POST",
              headers: {
                "Content-Type": "application/json",
              },
              body: JSON.stringify(requestData),
            });

            if (response.ok) {
              console.log("Модель успешно добавлена.");
              // Добавьте здесь код для закрытия модального окна или других действий по вашему выбору
            } else {
              console.error("Ошибка при добавлении модели:", response.status);
            }
          } catch (error) {
            console.error("Ошибка при отправке запроса:", error);
          }
        });
      });

      function myFunction() {
        const dropdown = document.getElementById("myDropdown");
        const dropbtn = document.getElementById("dropbutn");

        dropdown.classList.toggle("show");

        if (dropdown.classList.contains("show")) {
          dropbtn.classList.add("buttonDropFocus");
        } else {
          dropbtn.classList.remove("buttonDropFocus");
        }
      }

      // Закрыть раскрывающийся список, если пользователь щелкнет за его пределами.
      // window.onclick = function(event) {
      //   if (!event.target.matches('.dropbtn')) {
      //     var dropdowns = document.getElementsByClassName("dropdown-content");
      //     var i;
      //     for (i = 0; i < dropdowns.length; i++) {
      //       var openDropdown = dropdowns[i];
      //       if (openDropdown.classList.contains('show')) {
      //         openDropdown.classList.remove('show');
      //       }
      //     }
      //   }
      // }