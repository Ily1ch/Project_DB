USE master;
CREATE DATABASE VacuumRobotSystem;
USE VacuumRobotSystem;

-- ������� ���������������
CREATE TABLE Manufacturers (
    manufacturer_id INT PRIMARY KEY,
    name NVARCHAR(255) NOT NULL
);

-- ������� ���� ��������
CREATE TABLE VacuumTypes (
    type_id INT PRIMARY KEY,
    type_name NVARCHAR(255) NOT NULL
);

-- ������� ��������
CREATE  TABLE Models (
    model_id INT PRIMARY KEY,
    manufacturer_id INT REFERENCES Manufacturers(manufacturer_id),
    type_id INT REFERENCES VacuumTypes(type_id),
    quantity INT,
    price FLOAT,
    cleaning_time INT,
    release_date DATE,
    name NVARCHAR(255) NOT NULL,
    weight FLOAT,
    image_url NVARCHAR(255)
	purchase_count INT DEFAULT 0
);
go



CREATE or alter FUNCTION SearchModels
    (@searchTerm NVARCHAR(255))
RETURNS TABLE
AS
RETURN
(
    SELECT
        model_id,
        manufacturer_id,
        type_id,
        quantity,
        price,
        cleaning_time,
        release_date,
        name,
        weight,
        image_url
    FROM
        Models
    WHERE
        name LIKE '%' + @searchTerm + '%'
);
go
SELECT * FROM SearchModels('x');

GO
-- �������� ��������� ��� ���������� ������
CREATE PROCEDURE AddModel
    @modelName NVARCHAR(255),
    @manufacturerId INT,
    @typeId INT,
    @quantity INT,
    @price FLOAT,
    @cleaningTime INT,
    @releaseDate DATE,
    @weight FLOAT,
    @imageUrl NVARCHAR(255)
AS
BEGIN
    INSERT INTO Models (name, manufacturer_id, type_id, quantity, price, cleaning_time, release_date, weight, image_url)
    VALUES (@modelName, @manufacturerId, @typeId, @quantity, @price, @cleaningTime, @releaseDate, @weight, @imageUrl);
END;
GO
-- �������� ��������� ��� ��������� ������ ��������������
CREATE PROCEDURE GetManufacturers
AS
BEGIN
    SELECT * FROM Manufacturers;
END;
GO
-- �������� ��������� ��� ��������� ������ ����� ���������
CREATE PROCEDURE GetVacuumTypes
AS
BEGIN
    SELECT * FROM VacuumTypes;
END;

GO
CREATE VIEW ProductViews AS
SELECT
    Mo.model_id,
    M.name AS ManufacturerName,
    V.type_name AS VacuumTypeName,
    Mo.quantity,
    Mo.price,
    Mo.cleaning_time,
    Mo.release_date,
    Mo.name AS ModelName,
    Mo.weight,
    Mo.image_url
FROM
    dbo.Models AS Mo
INNER JOIN
    dbo.Manufacturers AS M ON Mo.manufacturer_id = M.manufacturer_id
INNER JOIN
    dbo.VacuumTypes AS V ON Mo.type_id = V.type_id;
go
SELECT *
FROM ProductViews
WHERE model_id = 1;

GO

-- ������� ��������������
CREATE TABLE Users (
    user_id INT PRIMARY KEY,
    login NVARCHAR(255) UNIQUE NOT NULL,
    is_admin BIT NOT NULL DEFAULT 0,
    email NVARCHAR(255),
    phone_number NVARCHAR(20),
    password NVARCHAR(255) NOT NULL,
    full_name NVARCHAR(255) NOT NULL
);
GO
CREATE PROCEDURE dbo.UpdateUserProfile
    @UserId INT,
    @Login NVARCHAR(255),
    @Email NVARCHAR(255),
    @PhoneNumber NVARCHAR(20)
AS
BEGIN
    SET NOCOUNT ON;

    -- ��������, ��� ������������ �� �������� admin � �� ����������� ���� �����
    IF NOT EXISTS (
        SELECT 1
        FROM Users
        WHERE user_id = @UserId
            AND login = 'admin'
    )
    BEGIN
        -- ��������, ��� ������������ �� �������� ���������� ����� 'admin'
        IF @Login <> 'admin'
        BEGIN
            UPDATE Users
            SET
                login = @Login,
                email = @Email,
                phone_number = @PhoneNumber
            WHERE
                user_id = @UserId;

            -- ����� �������� �������� �� �������� ���������� � ����������� �������, ���� ����������

            PRINT '������� ������� ��������.';
        END
        ELSE
        BEGIN
            PRINT '������: ������������ ����� "admin".';
        END
    END
    ELSE
    BEGIN
        PRINT '������: ������������ � ������� "admin" �� ����� ����� ������������� ���� ������.';
    END
END;
GO

DECLARE @UserId INT = 9; -- ������� ���������� ������������� ������������
DECLARE @Login NVARCHAR(255) = 'superpuper';
DECLARE @Email NVARCHAR(255) = 'SuperPuper@example.com';
DECLARE @PhoneNumber NVARCHAR(20) = '445342349';

EXEC dbo.UpdateUserProfile
    @UserId = @UserId,
    @Login = @Login,
    @Email = @Email,
    @PhoneNumber = @PhoneNumber;



CREATE VIEW UsersView AS
SELECT
    user_id AS UserId,
    login AS Login,
    is_admin AS IsAdmin,
    email AS Email,
    phone_number AS PhoneNumber,
    password AS Password,
    full_name AS FullName
FROM Users;
GO
CREATE PROCEDURE GetUserById
    @user_id INT
AS
BEGIN
    SELECT
        user_id,
        login,
        email,
        phone_number,
        full_name
    FROM
        Users
    WHERE
        user_id = @user_id;
END;
EXEC GetUserById @user_id = 9;

GO
-- ������� ������
CREATE TABLE Reviews (
    review_id INT PRIMARY KEY,
    user_id INT REFERENCES Users(user_id),
    model_id INT REFERENCES Models(model_id),
    review_text TEXT
);

-- ������� ������� �������
CREATE TABLE PaymentMethods (
    payment_method_id INT PRIMARY KEY,
    method_name NVARCHAR(255) NOT NULL
);

-- ������� ������ ��������
CREATE TABLE DeliveryPlaces (
    delivery_place_id INT PRIMARY KEY,
    user_id INT REFERENCES Users(user_id),
    street_name NVARCHAR(255),
    house_number NVARCHAR(10)
);
GO
-- �������� ������������� ��� ���� ������
CREATE VIEW DeliveryPlaceViews AS
SELECT
    DP.delivery_place_id,
    DP.user_id,
    DP.street_name,
    DP.house_number,
    U.full_name AS UserName
FROM
    dbo.DeliveryPlaces AS DP
INNER JOIN
    dbo.Users AS U ON DP.user_id = U.user_id;
GO
-- ������ ��� ������ ������ �� ������������� ���� ������
SELECT * FROM DeliveryPlaceViews WHERE user_id = 9;



-- ������� ������
CREATE TABLE Orders (
    order_id INT PRIMARY KEY,
    order_date DATETIME2 DEFAULT GETDATE(),
    user_id INT REFERENCES Users(user_id),
    model_id INT REFERENCES Models(model_id),
    payment_method_id INT REFERENCES PaymentMethods(payment_method_id),
    total_amount FLOAT NOT NULL
);


-- ������� ��������
CREATE TABLE ShoppingCart (
    cart_item_id INT PRIMARY KEY IDENTITY(1,1),
    user_id INT REFERENCES Users(user_id),
    model_id INT REFERENCES Models(model_id),
    quantity INT NOT NULL,
    CONSTRAINT FK_ShoppingCart_Users FOREIGN KEY (user_id) REFERENCES Users(user_id),
    CONSTRAINT FK_ShoppingCart_Models FOREIGN KEY (model_id) REFERENCES Models(model_id)
);
go
CREATE or alter PROCEDURE AddToShoppingCart
    @user_id INT,
    @model_id INT,
    @quantity INT
AS
BEGIN
    -- ��������, ���������� �� ��� ������ � ������� ��� ������� ������ � ������������
    IF EXISTS (SELECT 1 FROM dbo.ShoppingCart WHERE user_id = @user_id AND model_id = @model_id)
    BEGIN
        -- ���� ������ ��� ����������, ��������� ����������
        UPDATE dbo.ShoppingCart
        SET quantity = quantity + @quantity
        WHERE user_id = @user_id AND model_id = @model_id;
    END
    ELSE
    BEGIN
        -- ��������� ���������� ������� � �������
        DECLARE @availableQuantity INT;
        SELECT @availableQuantity = quantity
        FROM dbo.Models
        WHERE model_id = @model_id;

        -- ���� ���������� ������� � ������� ������ 0, ��������� ����� ������ � �������
        IF @availableQuantity > 0
        BEGIN
            INSERT INTO dbo.ShoppingCart (user_id, model_id, quantity)
            VALUES (@user_id, @model_id, @quantity);
        END
    END
END;

go
EXEC AddToShoppingCart 9, 1, 1

go
CREATE or ALTER VIEW ShoppingCartView
AS
SELECT
    SC.cart_item_id,
    SC.user_id AS shopping_cart_user_id,
    SC.model_id AS shopping_cart_model_id,
    SC.quantity,
    M.name AS model_name,
    M.price AS model_price,
    SC.quantity * M.price AS total_price, -- ��������� ����������� ���� ��� �������� ����� ��������� ������
    U.full_name AS user_full_name
FROM
    ShoppingCart SC
JOIN
    Models M ON SC.model_id = M.model_id
JOIN
    Users U ON SC.user_id = U.user_id;



SELECT * FROM ShoppingCartView WHERE shopping_cart_user_id = 9



--�������� �� ������� ���� ������ ������� 
go
CREATE TRIGGER DeleteModelTrigger
ON Models
AFTER DELETE
AS
BEGIN
    SET NOCOUNT ON;

    -- �������� ������� �� ShoppingCart, ��������� � ��������� �������
    DELETE FROM ShoppingCart
    WHERE model_id IN (SELECT model_id FROM deleted);
END;
-- ������� ������ � ������������ model_id
--DELETE FROM ShoppingCart WHERE model_id = 4; -- �������� 123 �� �������� model_id
DELETE FROM Models WHERE model_id = 5; -- �������� 123 �� �������� model_id


go
CREATE or alter PROCEDURE DeleteModelAndCart
    @model_id INT
AS
BEGIN
    SET NOCOUNT ON;

    -- �������� ������� �� ShoppingCart, ��������� � ��������� �������
    DELETE FROM ShoppingCart
    WHERE model_id = @model_id;

    -- �������� ������ �� ������� Models
    DELETE FROM Models
    WHERE model_id = @model_id;
END;
GO
-- �������� 5 �� �������� �������� model_id
EXEC DeleteModelAndCart @model_id = 5;


-- ������--------
Go
CREATE or alter PROCEDURE GetTopSellingModels
AS
BEGIN
    SELECT TOP 10
        name AS model_name,
        purchase_count
    FROM
        Models
    ORDER BY
        purchase_count DESC;
END;
GO

-- ����� ��������� ��� ��������� ���-10 ����� ����������� �������-���������
EXEC GetTopSellingModels;


GO
-- �������� ���������
CREATE OR ALTER PROCEDURE GetSalesReportByVacuumType
    @VacuumType NVARCHAR(50)
AS
BEGIN
    SELECT
        vt.type_name AS VacuumType,
        m.name AS ModelName,
        m.purchase_count AS PurchaseCount
    FROM
        Models m
    INNER JOIN
        VacuumTypes vt ON m.type_id = vt.type_id
    WHERE
        vt.type_name = @VacuumType
    ORDER BY
        m.purchase_count DESC;
END;
GO

--�������������� ����� �� ����� ���������(���-�� � ����)
CREATE or alter PROCEDURE GetSalesReportByVacuumType
@type_id INT
AS
BEGIN
    SELECT
        vt.type_name AS VacuumType,
        SUM(m.purchase_count) AS TotalSales,
        SUM(m.price * m.purchase_count) AS TotalRevenue
    FROM
        VacuumTypes vt
    LEFT JOIN
        Models m ON vt.type_id = m.type_id
    WHERE
        vt.type_id = @type_id
    GROUP BY
        vt.type_name;
END;
GO
EXEC GetSalesReportByVacuumType 1;
