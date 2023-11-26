const express = require("express")
const app = express()
const Sequelize = require("sequelize")
const cors = require('cors')

const jwt = require('jsonwebtoken')
const dotenv = require('dotenv').config()
const bcrypt = require('bcrypt')

const http = require("http");
const socketIo = require("socket.io");
const server = http.createServer(app);
const io = socketIo(server, { cors: { origin: "*" } });

const salt = '$2b$10$3HVhKA2xxrCTEm4BKZ5oM.'

const sequelize = new Sequelize(process.env.database, "root", process.env.password, {
    dialect: "mysql",
    host: "localhost",
    define: {
      timestamps: false
    }
  })

app.use(express.json())
app.use(cors())

const RoomBooking = sequelize.define("room_booking", {
    id: {
      type: Sequelize.INTEGER,
      autoIncrement: true,
      primaryKey: true,
      allowNull: false
    },
    guest_name: {
      type: Sequelize.STRING,
      allowNull: false
    },
    room_num: {
      type: Sequelize.STRING,
      allowNull: false
    },
    checkin_date: {
      type: Sequelize.DATE,
      allowNull: false
    },
    checkout_date: {
      type: Sequelize.DATE,
      allowNull: false
    }
})

const User = sequelize.define('user', {
  email:{
    type: Sequelize.STRING,
    allowNull: false,
    primaryKey: true
  },
  password:{
    type: Sequelize.STRING,
    allowNull: false
  }
})

app.post("/login", (request, response) => {
  User.findOne({where:{email: request.body.email}})
  .then(data => {
    if (data === null) {
      response.status(404).send('Пользователь не найден');
    } else {
      const isRight = bcrypt.compareSync(request.body.password, data.password);
      if (isRight) {
        const token = jwt.sign({ email: request.body.email }, process.env.TOKEN);
        response.json({ token, email: request.body.email }); // Отправляем объект с токеном и email
      } else {
        response.status(401).send('Неверный пароль');
      }
    }
  }).catch(error => {
    console.error('Ошибка входа:', error);
    response.status(500).send('Ошибка сервера при входе');
  });
});

app.post("/registration", (request, response) => {
  User.findOne({where:{email: request.body.email}})
  .then(data => {
    if (data === null) {
      const hashedPassword = bcrypt.hashSync(request.body.password, salt);
      User.create({
        email: request.body.email,
        password: hashedPassword
      }).then(user => {
        const token = jwt.sign({ email: user.email }, process.env.TOKEN);
        response.json({ token, email: user.email }); // Отправляем объект с токеном и email
      });
    } else {
      response.status(409).send('Пользователь уже существует');
    }
  }).catch(error => {
    console.error('Ошибка регистрации:', error);
    response.status(500).send('Ошибка сервера при регистрации');
  });
});

app.get("/bookings", function(request, response){
    RoomBooking.findAll({ raw:true }).then(bookings => {
        response.send(bookings)
    }); 
})

app.post("/bookings",  function(request, response){
    RoomBooking.create({
        guest_name: request.body.guest_name,
        room_num: request.body.room_num,
        checkin_date: request.body.checkin_date,
        checkout_date: request.body.checkout_date
      })
    .then(() => {
        response.send("Бронь успешно добавлена");
    })
    .catch(error => {
        console.error('Ошибка создания брони:', error);
        response.status(500).send("Ошибка создания брони");
    });
})

app.put("/bookings/:id",  function(request, response){
  const bookingId = request.params.id;
  
  RoomBooking.update({ 
      guest_name: request.body.guest_name,
      room_num: request.body.room_num,
      checkin_date: request.body.checkin_date,
      checkout_date: request.body.checkout_date 
  }, {
      where: {
          id: bookingId
      }
  })
  .then(() => {
      response.send("Бронь успешно обновлена");
  })
  .catch(error => {
      console.error('Ошибка обновления брони:', error);
      response.status(500).send("Ошибка обновления брони");
  });
});

app.delete("/bookings/:id",  function(request, response){
  const bookingId = request.params.id;

  RoomBooking.destroy({
      where: {
          id: bookingId
      }
  })
  .then(() => {
      response.send("Бронь успешно удалена");
  })
  .catch(error => {
      console.error('Ошибка удаления брони:', error);
      response.status(500).send("Ошибка удаления брони");
  });
});

// WebSocket-сервер для чата
io.on("connection", (socket) => {
  console.log("Client connected");

  socket.on("disconnect", () => {
    console.log("Client disconnected");
  });

  socket.on("message", (message) => {
    console.log("Received message:", message);
    // Проверка структуры сообщения и рассылка его всем подключенным клиентам
    if (message && typeof message === 'object' && message.event === "message") {
      // Эмитируем событие 'message' всем подключенным клиентам, включая отправителя
      io.sockets.emit("message", message);
    }
  });
});

server.listen(8080, () => {
  console.log("Server listening on port 8080");
});

sequelize.sync().then(()=> {app.listen(process.env.port)})

module.exports = {
  RoomBooking,
  sequelize,
  io
};