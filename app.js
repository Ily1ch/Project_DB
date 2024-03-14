const express = require('express');
const sql = require('mssql');
const router = express.Router();
const jwt = require('jsonwebtoken');
// const ExcelJS = require('exceljs');
const app = express();
const port = 3000;
const path = require('path');
const bodyParser = require('body-parser');
const { type } = require('os');
const { log } = require('console');

// Настройки подключения к базе данных
const config = {
    server: 'PCLITE',
    database: 'VacuumRobotSystem',
    user: 'ilyua',
    password: '12345678',
    options: {
      trustServerCertificate: true,
    },
  };
  
  // Подключение к базе данных
  async function connectToDatabase() {
    try {
      await sql.connect(config);
      console.log('Подключено к базе данных.');
    } catch (err) {
      console.error('Ошибка подключения к базе данных:', err);
    }
  }


  //EJS шаблонизатор
app.set('view engine', 'ejs');
app.use(express.static(path.join(__dirname, 'public')));
app.set('views', path.join(__dirname, 'public', 'views'));
app.set('views engine', 'ejs');
app.set('photo', path.join(__dirname, 'public', 'photo'));
app.use(express.static('public'));
app.use(express.urlencoded({ extended: true }));
app.use(bodyParser.urlencoded())
app.use(bodyParser.json())

  app.listen(port, () => {
    console.log(`Сервер запущен на порту ${port}`);
    connectToDatabase();
  });

  app.get('/registration', (req, res) => {
    res.render('registration');
  });

  app.get('/authorization', (req, res) => {
    res.render('authorization');
  });

  app.get('/mainpage', (req, res) => {
    res.render('mainpage');
  });

  app.get('/top10Robots', (req, res) => {
    res.render('top10Robots');
  });

  app.get('/sellsReportTipe', (req, res) => {
    res.render('sellsReportTipe');
  });

  app.get('/catalog', (req, res) => {
    res.render('catalog');
  });

  app.get('/product', (req, res) => {
    res.render('product');
  });

  app.get('/product', (req, res) => {
    res.render('product');
  });

  app.get('/profile', (req, res) => {
    res.render('profile');
  });

  app.get('/makingAnOrder', (req, res) => {
    res.render('makingAnOrder');
  });

  // Пример POST-запроса для добавления пользователя
  app.post('/addUser', async (req, res) => {
    const { login, email, phone_number, password, full_name } = req.body;

    try {
        const request = new sql.Request();
        request.input('login', sql.NVarChar(255), login);
        request.input('email', sql.NVarChar(255), email);
        request.input('phone_number', sql.NVarChar(20), phone_number);
        request.input('password', sql.NVarChar(255), password);
        request.input('full_name', sql.NVarChar(255), full_name);

        const query = 'EXEC InsertUser @login, @email, @phone_number, @password, @full_name';
        await request.query(query);

        res.status(200).json({ message: 'Регистрация прошла успешно' });
    } catch (error) {
        console.error('Ошибка при обработке запроса на регистрацию:', error);
        res.status(500).json({ message: 'Ошибка регистрации' });
    }
});


// Обработчик для авторизации пользователя
app.post('/login', async (req, res) => {
    const { login, password } = req.body;
  
    try {
      const request = new sql.Request();
      request.input('login', sql.NVarChar(255), login);
      request.input('password', sql.NVarChar(255), password);
  
      const query = 'EXEC AuthenticateUser @login, @password';
      const result = await request.query(query);  
      if (result.recordset.length > 0) {
        const user_id = result.recordset[0].user_id;
        const token = jwt.sign({ user_id, login}, 'your_secret_key', { expiresIn: '1d' });
        // console.log(user_id);
        // console.log(token);
        res.status(200).json({token: token})
    } else {
        res.status(401).json({ message: 'Неправильный логин или пароль.' });
    }    
    } catch (error) {
      console.error('Ошибка при выполнении запроса на авторизацию:', error);
      res.status(500).json({ message: 'Ошибка авторизации.' });
    }
  });
  
const authenticateToken = (req, res, next) => {
  const token = req.query.token || String(req.headers.authorization).split(' ')[1];
  if (!token) {
    return res.status(401).json({ message: 'Отсутствует токен авторизации.' });
  }

  jwt.verify(token, 'your_secret_key', (err, user) => {
    if (err) {
      console.log(err);
      return res.status(403).json({ message: 'Ошибка при проверке токена.' });
    }
    
    req.user = user;
    next();
  });
};

//отоброжение профиля пользователя по токену
app.post('/profile', authenticateToken, async (req, res) => {
  try {
    const userId = req.user.user_id;
    // console.log(userId);
    const request = new sql.Request();
    request.input('user_id', sql.Int, userId);
    const result = await request.execute('GetUserById');
    // console.log(result);
    if (result.recordset.length > 0) {
      const userData = result.recordset[0];
      res.status(200).json(userData);
    } else {
      res.status(404).json({ message: 'Пользователь не найден.' });
    }
  } catch (error) {
    console.error('Ошибка при получении данных пользователя:', error);
    res.status(500).json({ message: 'Ошибка получения данных пользователя.' });
  }
});

// Обработчик для получения ID активного пользователя
app.post('/getActiveUserId', authenticateToken, (req, res) => {
  const userId = req.user.user_id;
  res.json({ user_id: userId });
});


app.post('/deliveryPlaces', authenticateToken, async (req, res) => {
  const userId = req.user.user_id;

  try {
    const request = new sql.Request();
    request.input('userId', sql.Int, userId);

    const result = await request.query('SELECT * FROM DeliveryPlaceViews WHERE user_id = @userId');
    //console.log(result);
    if (result.recordset.length > 0) {
      const deliveryData = result.recordset[0];
      res.json(deliveryData);
    } else {
      res.status(404).json({ message: 'Место заказа не найдено.' });
    }
  } catch (error) {
    console.error('Ошибка при получении данных о месте заказа:', error);
    res.status(500).json({ message: 'Ошибка при получении данных о месте заказа.' });
  }
});


//Каталог
  app.get('/models', async (req, res) => {
    try {
        const request = new sql.Request();
        const result = await request.query('SELECT * FROM ModelsView');
        res.json(result.recordset);
    } catch (error) {
        console.error('Ошибка получения данных:', error);
        res.status(500).send('Ошибка получения данных.');
    }
});

app.post('/product', async (req, res) => {
  const modelId = req.body.model_id;

  try {
    const request = new sql.Request();
    request.input('model_id', sql.Int, modelId);

    const result = await request.query('SELECT * FROM ProductViews WHERE model_id = @model_id');
    //console.log(result);
    if (result.recordset.length > 0) {
      const productData = result.recordset[0];
      res.json(productData);
    } else {
      res.status(404).json({ message: 'Продукт не найден.' });
    }
  } catch (error) {
    console.error('Ошибка при получении данных о продукте:', error);
    res.status(500).json({ message: 'Ошибка при получении данных о продукте.' });
  }
});

// Получение списка производителей
app.get('/getManufacturers', async (req, res) => {
  try {
    const request = new sql.Request();
    const result = await request.execute('GetManufacturers');
    //console.log(result);
    res.json(result.recordset);
  } catch (error) {
    console.error('Error getting manufacturers:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

// Получение списка типов пылесосов
app.get('/getVacuumTypes', async (req, res) => {
  try {
    const request = new sql.Request();
    const result = await request.execute('GetVacuumTypes');
    res.json(result.recordset);
  } catch (error) {
    console.error('Ошибка при получении списка типов пылесосов:', error);
    res.status(500).json({ message: 'Internal Server Error' });
  }
});

// Добавление модели
app.post('/addModel', async (req, res) => {
  const {
    modelName,
    manufacturerId,
    typeId,
    quantity,
    price,
    cleaningTime,
    releaseDate,
    weight,
    imageUrl,
  } = req.body;

  console.log();
  try {
    const request = new sql.Request();
    request.input('modelName', sql.NVarChar(255), modelName);
    request.input('manufacturerId', sql.Int, manufacturerId);
    request.input('typeId', sql.Int, typeId);
    request.input('quantity', sql.Int, quantity);
    request.input('price', sql.Float, price);
    request.input('cleaningTime', sql.Int, cleaningTime);
    request.input('releaseDate', sql.Date, releaseDate);
    request.input('weight', sql.Float, weight);
    request.input('imageUrl', sql.NVarChar(255), imageUrl);

    const query = 'EXEC AddModel @modelName, @manufacturerId, @typeId, @quantity, @price, @cleaningTime, @releaseDate, @weight, @imageUrl';
    await request.query(query);

    res.status(201).json({ message: 'Модель успешно добавлена.' });
  } catch (error) {
    console.error('Ошибка при добавлении модели:', error);
    res.status(500).json({ message: 'Internal Server Error' });
  }
});


app.post("/add-to-cart", authenticateToken, async (req, res) => {
  try {
    // Получаем данные из запроса
    const { user_id, model_id, quantity } = req.body;
    // Подключаемся к базе данных
    const request = new sql.Request();
    
    // Выполняем запрос на выполнение процедуры AddToShoppingCart
    const query = `
      EXEC AddToShoppingCart @user_id, @model_id, @quantity;
    `;
    request.input("user_id", sql.Int, user_id);
    request.input("model_id", sql.Int, model_id);
    request.input("quantity", sql.Int, quantity);

    const result = await request.query(query);

    // Проверяем результат выполнения процедуры
    if (result.rowsAffected && result.rowsAffected[0] > 0) {
      res.status(200).json({ message: "Товар успешно добавлен в корзину." });
    } else {
      res.status(500).json({ message: "Ошибка при добавлении товара в корзину." });
    }
  } catch (error) {
    console.error("Ошибка при добавлении товара в корзину:", error);
    res.status(500).json({ message: "Ошибка при добавлении товара в корзину." });
  }
});

// Серверный код
app.get('/shoppingCart', authenticateToken, async (req, res) => {
  try {
      // Получаем идентификатор пользователя из параметра запроса
      const userId = req.query.userId;

      // Проверяем наличие userId перед выполнением запроса к базе данных
      if (!userId) {
          console.error('Идентификатор пользователя не найден в параметре запроса.');
          res.status(400).json({ message: 'Bad Request' });
          return;
      }

      // Подключаемся к базе данных
      const pool = await sql.connect(config);

      // Выполняем запрос к представлению с фильтрацией по идентификатору пользователя
      const result = await pool
          .request()
          .input('user_id', sql.Int, userId)
          .query('SELECT * FROM ShoppingCartView WHERE shopping_cart_user_id = @user_id');

      // Отправляем данные на клиент
      res.json(result.recordset);
  } catch (error) {
      console.error('Ошибка при получении данных из представления:', error);
      res.status(500).json({ message: 'Internal Server Error' });
  }
});

app.use(express.json());

app.post('/searchModels', async (req, res) => {
  try {
    const { searchTerm } = req.body;
    const pool = await sql.connect(config);

    const result = await pool
      .request()
      .input('searchTerm', sql.NVarChar(255), searchTerm)
      .query('SELECT * FROM SearchModels(@searchTerm)');

    res.json(result.recordset);
  } catch (error) {
    console.error('Ошибка при выполнении запроса к базе данных:', error);
    res.status(500).json({ message: 'Internal Server Error' });
  }
});



// Обработчик DELETE-запроса для удаления модели
app.delete("/deleteModel/:modelId", authenticateToken, async (req, res) => {
  try {
    const { modelId } = req.params; // Используйте params для получения параметра из URL
    // Подключаемся к базе данных
    console.log(modelId);
    const request = new sql.Request();
    
    // Выполняем запрос на выполнение процедуры DeleteModelAndCart
    const query = `
      EXEC DeleteModelAndCart @model_id = ${modelId};
    `;

    const result = await request.query(query);

    // Проверка наличия удаленных строк
    if (result.rowsAffected > 0) {
      res.sendStatus(200); // Успешный статус код
      console.log("ну типа все окей");
    } else {
      res.sendStatus(404); // Модель не найдена
    }
  } catch (error) {
    console.error("Ошибка при удалении модели из базы данных:", error);
    res.sendStatus(500); // Внутренняя ошибка сервера
  }
});



app.post('/updateUserProfile/:userId', authenticateToken, async (req, res) => {
  const userId = req.params.userId;
  console.log(userId);
  const { editLogin, editEmail, editPhoneNumber } = req.body;
  console.log(req.body);
  console.log(editLogin, editEmail, editPhoneNumber);

  try {
    const request = new sql.Request();
    request.input('UserId', sql.Int, userId);
    request.input('Login', sql.NVarChar(255), editLogin);
    request.input('Email', sql.NVarChar(255), editEmail);
    request.input('PhoneNumber', sql.NVarChar(20), editPhoneNumber);

    const query = 'EXEC dbo.UpdateUserProfile @UserId, @Login, @Email, @PhoneNumber';
    const result = await request.query(query);

    res.status(200).json({ message: 'Данные профиля успешно обновлены.' });
  } catch (error) {
    console.error('Ошибка при обновлении данных профиля:', error);
    res.status(500).json({ message: 'Internal Server Error' });
  }
});

//..............Отчеты...............
app.get('/topSellingModels', async (req, res) => {
  try {
    const request = new sql.Request();
    const query = 'EXEC GetTopSellingModels';
    const models = await request.query(query);
    console.log(models);
    res.json(models);
  } catch (error) {
    console.error('Error:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

app.get('/salesReport/:type_id', async (req, res) => {
  const { type_id } = req.params;

  try {
    const request = new sql.Request();
    request.input('type_id', sql.Int, type_id);
    const result = await request.execute('GetSalesReportByVacuumType');
    console.log(result);
    res.json(result.recordset);
  } catch (error) {
    console.error('Error executing stored procedure:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});


