const express = require("express");
const mongoose = require("mongoose");
const blogPostModel = require("../models/blogPost");
const router = express.Router();
const crypto = require("crypto");
const multer = require("multer");
const path = require("path");

router.get("/ping", (req, res) => {
  res.status(200).json({ msg: "pong", date: new Date() });
});

//CRUD
let lastUploadedImageName = "";
//->file Upload Config
const storage = multer.diskStorage({
  destination: "./uploads/",
  filename: function (req, file, callback) {
    crypto.pseudoRandomBytes(16, function (err, raw) {
      if (err) return callback(err);
      // callback(null, raw.toString("hex") + path.extname(file.originalname));
      lastUploadedImageName =
        raw.toString("hex") + path.extname(file.originalname);
      console.log("lastUploadedImageName", lastUploadedImageName);
      callback(null, lastUploadedImageName);
    });
  },
});
const upload = multer({ storage: storage });

//->file Upload

router.post("/blog-posts/images", upload.single("blogImage"), (req, res) => {
  !req.file.originalname.match(/\.(jpg|jpeg|png|gif|webp)$/i)
    ? res.status(400).json({ msg: "Only image file allowed" })
    : res.status(201).send({ filename: req.file.filename, file: req.file });
});

//->Create Post
router.post("/blog-posts", (req, res) => {
  console.log("req.body", req.body);
  // const blogPost = new BlogPost(req.body);
  const blogPost = new BlogPost({ ...req.body, image: lastUploadedImageName });
  blogPost.save((err, blogPost) => {
    return err ? res.status(500).json(err) : res.status(201).json(blogPost);
  });
});

//->ReadAll
router.get("/blog-posts", (req, res) => {
  blogPostModel.find()
    .sort({ createdOn: -1 })
    .exec()
    .then((posts) => {
      res.status(200).json(posts);
    })
    .catch((err) => {
      res.status(500).json({
        message: "posts not found",
        error: err,
      });
    });
});
//->ReadOne
router.get("/blog-posts/:id", (req, res) => {
  blogPostModel.findById(req.params.id)
    .then((post) => {
      res.status(200).json(post);
    })
    .catch((err) => {
      res.status(500).json({
        message: "post not found",
        error: err,
      });
    });
});

//->Update
router.put("/blog-posts/:id", upload.single('blogImage'), (req, res) => {
    const id = req.params.id;
    const conditions = { _id: id };
    const blogPost = { ...req.body, image: lastUploadedImageName };
    const update = { $set: blogPost };
    const options = {
      upsert: true,
      new: true,
    };
    blogPostModel.findOneAndUpdate(conditions, update, options, (err,response) => {
      return err
        ? res.status(500).json({ msg: "API : updated failed", error: err })
        : res.status(200).json({ msg: `API : document with id ${id} updated` , response: response })
    });
  });


//->Delete One
router.delete("/blog-posts/:id", (req, res) => {
  blogPostModel.findByIdAndDelete(req.params.id, (err, post) => {
    return err
      ? res.status(500).json(err)
      : res.status(202).json({ msg: `post with id ${post._id} deleted` });
  });
});

//->Delete Multi
router.delete("/blog-posts", (req, res) => {
  const ids = req.query.ids;
  const idsArray = ids.split(",").map((id) => {
    return id.match(/^[0-9a-zA-Z]{24}$/)
      ? mongoose.Types.ObjectId(id)
      : console.log("invalid id: ", id);
  });

  console.log(idsArray);

  const condition = { _id: { $in: idsArray } };
  console.log(condition);
  blogPostModel.deleteMany(condition, (err) => {
    return err
      ? res.status(500).json(err)
      : res.status(202).json({ msg: `posts with id ${idsArray} deleted` });
  });
});



module.exports = router;
