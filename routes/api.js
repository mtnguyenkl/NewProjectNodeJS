
var express = require('express');
var router = express.Router();

const Distributors = require('../models/distributors')
const Fruits = require('../models/fruits');

router.post('/add-distributor', async (req, res) => {
    try {
        const data = req.body;
        const newDistributors = new Distributors({
            name: data.name
        });
        const result = await newDistributors.save();
        if (result) {
            res.json({
                "status": 200,
                "messenger": "Thêm thành công",
                "data": result
            })
        } else {
            res.json({
                "status": 400,
                "messenger": "Lỗi, Thêm không thành công",
                "data": []
            })
        }
    } catch (error) {
        console.log(error);
    }
});

router.post('/add-fruit', async (req, res) => {
    try {
        const data = req.body;
        const newFruit = new Fruits({
            name: data.name,
            quantity: data.quantity,
            price: data.price,
            status: data.status,
            image: data.image,
            description: data.description,
            id_distributor: data.id_distributor
        });
        const result = await newFruit.save();
        if (result) {
            res.json({
                "status": 200,
                "messenger": "Thêm thành công",
                "data": result
            })
        } else {
            res.json({
                "status": 400,
                "messenger": "Lỗi, Thêm không thành công",
                "data": []
            })
        }
    } catch (error) {
        console.log(error);
    }
});

router.get('/get-list-fruit', async (req, res) => {
    try {
        const data = await Fruits.find().populate('id_distributor');
        res.json({
            "status": 200,
            "messenger": "Danh sách fruit",
            "data": data
        })
    } catch (error) {
        console.log(error);
    }
});
router.get('/get-fruit-by-id/:id', async (req, res) => {
    try {
        const { id } = req.params //lay du lieu thong qua :id tren url goi la param
        const data = await Fruits.findById(id).populate('id_distributor');
        res.json({
            "status": 200,
            "messenger": "Danh sách fruit",
            "data": data
        })
    } catch (error) {
        console.log(error);
    }
});

router.get('/get-list-fruit-in-price', async (req, res) => {
    try {
        const { price_start, price_end } = req.query
        const query = { price: { $gte: price_start, $lte: price_end } }
        //$gte lon hon hoac bang, $ge lon hon
        //$lte nho hon hoac bang, $le nho hon
        const data = await Fruits.find(query, 'name quantity price id_distributor')
            .populate('id_distributor')
            .sort({ quantity: -1 })// giam dan` = -1, tang dan` = 1
            .skip(0) // bo qua so luong row
            .limit(2) //lay 2 san pham
        res.json({
            "status": 200,
            "messenger": "Danh sách fruit",
            "data": data
        })
    } catch (error) {
        console.log(error);
    }
});
router.get('/get-list-fruit-have-name-a-or-x', async (req, res) => {
    try {
        const query = {
            $or: [
                { name: { $regex: 'T' } },
                { name: { $regex: 'X' } },
            ]
        }
        const data = await Fruits.find(query, 'name quantity price id_distributor')
            .populate('id_distributor')
        res.json({
            "status": 200,
            "messenger": "Danh sách fruit",
            "data": data
        })
    } catch (error) {
        console.log(error);
    }
});

//Api cap nhat fruit
router.put('/update-fruit-by-id/:id', async (req, res) => {
    try {
        const { id } = req.params
        const data = req.body
        const updatefruit = await Fruits.findById(id)
        let result = null;
        if (updatefruit) {
            updatefruit.name = data.name ?? updatefruit.name;
            updatefruit.quantity = data.quantity ?? updatefruit.quantity,
                updatefruit.price = data.price ?? updatefruit.price,
                updatefruit.status = data.status ?? updatefruit.status,
                updatefruit.image = data.image ?? updatefruit.image,
                updatefruit.description = data.description ?? updatefruit.description,
                updatefruit.id_distributor = data.id_distributor ?? updatefruit.id_distributor;

            result = await updatefruit.save();
        }
        //Tao 1 doi tuong moi
        //Them vao database
        if (result) {
            res.json({
                "status": 200,
                "messenger": "Cập nhật thành công",
                "data": result
            })
        } else {
            res.json({
                "status": 400,
                "messenger": "Lỗi, cập nhật không thành công",
                "data": []
            })
        }
    } catch (error) {
        console.log(error);
    }
});
router.delete('/destroy-fruit-by-id/:id', async (req, res) => {
    try {
        const { id } = req.params
        const result = await Fruits.findByIdAndDelete(id);
        if (result) {
            res.json({
                "status": 200,
                "messenger": "Xóa thành công",
                "data": result
            })
        } else {
            res.json({
                "status": 400,
                "messenger": "Lỗi, xóa không thành công",
                "data": []
            })
        }
    } catch (error) {
        console.log(error);
    }
});
const Upload = require('../config/common/upload');
router.post('/add-fruit-with-file-image', Upload.array('image', 5), async (req, res) => {
    //Upload.array('image',5) => up nhiều file tối đa là 5
    //upload.single('image') => up load 1 file
    try {
        const data = req.body; // Lấy dữ liệu từ body
        const { files } = req //files nếu upload nhiều, file nếu upload 1 file
        const urlsImage =
            files.map((file) => `${req.protocol}://${req.get("host")}/uploads/${file.filename}`)
        //url hình ảnh sẽ được lưu dưới dạng: http://localhost:3000/upload/filename
        const newfruit = new Fruits({
            name: data.name,
            quantity: data.quantity,
            price: data.price,
            status: data.status,
            image: urlsImage, /* Thêm url hình */
            
            description: data.description,
            id_distributor: data.id_distributor
        }); //Tạo một đối tượng mới
        const result = await newfruit.save(); //Thêm vào database
        if (result) {// Nếu thêm thành công result !null trả về dữ liệu
            res.json({
                "status": 200,
                "messenger": "Thêm thành công",
                "data": result
            })
        } else {// Nếu thêm không thành công result null, thông báo không thành công
            res.json({
                "status": 400,
                "messenger": "Lỗi, thêm không thành công",
                "data": []
            })
        }
    } catch (error) {
        console.log(error);
    }
});


module.exports = router;