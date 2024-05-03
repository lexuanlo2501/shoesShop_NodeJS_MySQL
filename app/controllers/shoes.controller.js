const { response } = require("express")
const Shoes = require("../models/shoes.model")
const fs = require('fs')

exports.get_all_shoes = (req, res) => {
    Shoes.get_all(req.query, (response) => {
        res.setHeader("X-Total-Count", +response.count);
        res.send(response.shoes)
    })
    
}


exports.find_shoes = (req, res) => {
    Shoes.find(req.params.id, response => {
        res.send(response)
    })
}

exports.find_list_shoes = (req, res) => {
  const {_page, _limit} = req.query
  Shoes.findList(req.params.id, response => {
    // res.status(200).send(response)
    res.setHeader("X-Total-Count", +response.count);
    res.send(response.shoes)
  },_page,_limit)
}

exports.add_shoes = (req, res) => {
    const data = req.body
    Shoes.create(data,(response) => {
        res.send(response)
    }, req.acc)
    console.log(req.acc)
}

exports.delete_shoes = (req, res) => {
    const id = req.params.id
    Shoes.delete(id, (response) => {
        res.send(response)
    })
}

exports.update_shoes = (req, res) => {
    Shoes.update(req.params.id, req.body, (response) => {
        res.send(response)
    })
}

exports.delete_img = (req, res) => {
    const filename = req.params.filename;
    let filePath = __dirname + "/public/imgs/" + filename;
    filePath = filePath.replace("\\app\\controllers","").replaceAll("/", "\\")
    // Kiểm tra xem file có tồn tại hay không
    console.log(filePath)
    if (fs.existsSync(filePath)) {
      // Xóa file
      fs.unlink(filePath, (err) => {
        if (err) {
          console.error(err);
          return res.status(500).json({ error: "Lỗi khi xóa file" });
        }
        res.json({ message: "File đã được xóa thành công" });
      });
    } else {
      res.status(404).json({ error: "File không tồn tại" });
    }
}

exports.delete_imgs = (req, res) => {
    const filenames = req.body.filenames; // Mảng tên file truyền qua body

  // Xác thực và kiểm tra filenames có phải là mảng
  if (!Array.isArray(filenames)) {
    return res.status(400).json({ error: "Filenames phải là một mảng" });
  }

  let deletedCount = 0; // Số lượng file đã xóa thành công
  let errors = []; // Lưu trữ các lỗi xảy ra

  // Lặp qua từng tên file trong mảng
  filenames.forEach((filename) => {
    let filePath = __dirname + "/public/imgs/" + filename;
    filePath = filePath.replace("\\app\\controllers","").replaceAll("/", "\\")

    // Kiểm tra xem file có tồn tại hay không
    if (fs.existsSync(filePath)) {
      // Xóa file
      try {
        fs.unlinkSync(filePath);
        deletedCount++;
      } catch (err) {
        errors.push(`Lỗi khi xóa file ${filename}: ${err.message}`);
      }
    } else {
      errors.push(`File ${filename} không tồn tại`);
    }
  });

  if (errors.length > 0) {
    res.status(500).json({ errors });
  } else {
    res.json({ message: `${deletedCount} file đã được xóa thành công` });
  }
}

exports.im_export_prod = (req, res) => {
  Shoes.im_exportProd(req.params.id,req.body, response => {
    res.status(200).send(response)
  })
}

exports.modify_discount = (req, res) => {
  Shoes.modifyDiscount(req.body, response => {
    res.status(200).send(response)
  })
}

