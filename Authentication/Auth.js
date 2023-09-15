let express = require("express");
let router = express.Router();
let bcrypt = require("bcrypt");
let jwt = require("jsonwebtoken");
let multer = require("multer");
let Path = require("path");
require("dotenv").config();
let UserModal = require("../Modals/User");
let ProfileStorage = multer.diskStorage({
  destination: (req, file, callback) => {
    callback(null, "public/profiles");
  },
  filename: (req, file, callback) => {
    callback(
      null,
      file.fieldname + "_" + Date.now() + Path.extname(file.originalname)
    );
  },
});

let upload = multer({
  storage: ProfileStorage,
});
router.post("/register", upload.single("avatar"), async (req, res) => {
  try {
    let { Name, Email, Password } = req.body;
    let encryptedPassword = await bcrypt.hash(Password, 10);

    let User = new UserModal({
      Name: Name,
      Email: Email,
      Password: encryptedPassword,
      Profile: req.file.filename,
    });

    let response = await User.save();
    res.status(200).json({
      message: "User is Registered Successsfully",
      Data: response,
    });
  } catch (err) {
    res.status(500).json({
      message: "Internal Server Error",
      errDescription: err.message,
    });
  }
});

router.post("/login", async (req, res) => {
  let { Email, Password } = req.body;
  UserModal.findOne({ Email: Email })
    .then((user) => {
      bcrypt
        .compare(Password, user.Password)
        .then((isOk) => {
          if (isOk) {
            let token = jwt.sign(
              { Email: user.Email, id: user._id },
              process.env.SECRET_KEY
            );
            res.status(200).json({
              token: token,
              message: "login sucessfull",
            });
          } else {
            res.status(401).json({
              message: "invalid credentials",
            });
          }
        })
        .catch((err) => {
          res.status(500).json({
            message: "internal server issue",
          });
        });
    })
    .catch((err) => {
      res.status(404).json({
        message: "You are not registered with us",
      });
    });
});

module.exports = router;
