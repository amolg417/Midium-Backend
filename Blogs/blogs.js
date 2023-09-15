let express = require("express");
let router = express.Router();
let jwt = require("jsonwebtoken");
let multer = require("multer");
let Path = require("path");

const BlogModal = require("../Modals/Blog");
let commentModal = require("../Modals/Comment");
require("dotenv").config();

let ImageStorage = multer.diskStorage({
  destination: (req, file, callback) => {
    callback(null, "public/blogimages");
  },
  filename: (req, file, callback) => {
    callback(
      null,
      file.fieldname + "_" + Date.now() + Path.extname(file.originalname)
    );
  },
});
let upload = multer({
  storage: ImageStorage,
});

function Authmiddleware(req, res, next) {
  try {
    let token = req.headers.authorization.split(" ")[1];
    let userinfo = jwt.verify(token, process.env.SECRET_KEY);
    req.User = userinfo;
    next();
  } catch (err) {
    res.status(401).json({
      status: "please login first",
      error: err,
    });
  }
}

router.post(
  "/posts",
  Authmiddleware,
  upload.single("image"),
  async (req, res) => {
    let { Title, Desc, Category } = req.body;
    try {
      let post = new BlogModal({
        Title: Title,
        Description: Desc,
        Image: req.file.filename,
        CreatedAt: new Date().getTime(),
        User: req.User.id,
        Views: 0,
        Category: Category,
        IsPicked: false,
      });
      let response = await post.save();
      res.status(200).json({
        message: "post saved succesfully",
        data: response,
      });
    } catch (err) {
      res.json({
        message: "something went wrong",
      });
    }
  }
);

router.post("/comments/:postId", Authmiddleware, async (req, res) => {
  let { postId } = req.params;
  let { Description } = req.body;
  try {
    if(Description.trim()){

      let comment = new commentModal({
        Description: Description,
        CreatedAt: new Date().getTime(),
        User: req.User.id,
        PostId: postId,
      });
      
      let response = await comment.save();
      res.status(200).json({
        message: "comment saved successfully",
        data: response,
      });
    }else{
      res.status(401).json({
        message:"Comment can not be empty spaces"
      })
    }
  } catch (err) {
    res.status(500).json({
      message: "internal server issue",
    });
  }
});

router.get("/comments/:postId", async (req, res) => {
  let { postId } = req.params;
  try {
     let response = await commentModal.find({ PostId: postId }).populate({ path: "User", select: "_id Name Profile" });
    if (response?.length) {
      res.status(200).json({
        message: "comment fetched successfully",
        data: response,
      });
    } else {
      res.status(404).json({
        message: "comments not found",
      });
    }
  } catch (err) {
    res.status(500).json({
      message: "internal server issue",
    });
  }
});

router.get("/categories", async (req, res) => {
  try {
    let categories = await BlogModal.distinct("Category");
    res.status(200).json(categories);
  } catch (err) {
    res.status(500).json({
      message: "something went wrong",
    });
  }
});

router.get("/posts", async (req, res) => {
  let { page, category } = req.query;
  const POST_PER_PAGE = 2;
  const skip = POST_PER_PAGE * (page - 1);
  const filter = {};
  if (category) {
    filter.Category = category;
  }
  try {
    const [posts, count] = await Promise.all([
      BlogModal.find(filter)
        .sort({ CreatedAt: -1 })
        .limit(POST_PER_PAGE)
        .skip(skip)
        .populate({ path: "User", select: "_id Name Profile" })
        .exec(),
      BlogModal.countDocuments(filter),
    ]);

    res.status(200).json({
      message: "data fetch successfully",
      data: { posts, count },
    });
  } catch (err) {
    res.status(404).json({
      message: "failed to fetch data",
      desc: err.message,
    });
  }
});

router.get("/post/:postId", async (req, res) => {
  let subscribe = { IsPicked: true, $inc: { Views: 1 } };
  let { postId } = req.params;
  try {
    let response = await BlogModal.findByIdAndUpdate(postId, subscribe, {
      new: true,
    }).populate({ path: "User", select: "_id Name Profile" });
    if (response) {
      res.status(200).json({
        message: "fetched Post successfully",
        data: response,
      });
    } else {
      res.status(404).json({
        message: "post not found",
      });
    }
  } catch (err) {
    res.status(500).json({
      message: "failed to fetch post",
    });
  }
});

router.get("/userPicked", async (req, res) => {
  let filter = { IsPicked: true };
  try {
    let response = await BlogModal.find(filter).limit(3).populate({ path: "User", select: "_id Name Profile" });
    res.status(200).json({
      message: "post fetched successfully",
      data: response,
    });
  } catch (err) {
    res.status(500).json({
      message: "internal server issues",
    });
  }
});
router.get("/popular", async (req, res) => {
  try {
    let response = await BlogModal.find({ Views: { $gt: 10 } }).populate({ path: "User", select: "_id Name Profile" });
    res.status(200).json({
      message: "post fetched successfully",
      data: response,
    });
  } catch (err) {
    res.status(500).json({
      message: "internal server issues",
    });
  }
});

module.exports = router;
