const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const { UserModel,Image } = require("./task");
const expressAsyncHandler = require("express-async-handler");
const dotenv = require("dotenv");
const nodemailer = require("nodemailer");
const generateOTP = require("./otpgen");
const uploadImage = require("./Uploadimage");
const emailjs = require("./email.js")
const multer = require('multer');
const CryptoJS = require("crypto-js");
dotenv.config();

// const fs = require('fs');
const xlsx = require('xlsx');
dotenv.config();
const encryptionKey = process.env.Otpkey;
let transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST,
  port: process.env.SMTP_PORT,
  secure: false,
  auth: {
    user: process.env.SMTP_MAIL,
    pass: process.env.SMTP_PASSWORD,
  },
});

const app = express();
app.use(express.json());
app.use(cors());


 mongoose
  .connect(
    "mongodb+srv://arundanabalan94:rNu9QUsNcjkBTaaM@karthik.dkvplhe.mongodb.net/?retryWrites=true&w=majority&appName=karthik",
  )

  .then(() => {
    let url='http://localhost:5000'
    console.log(url,"connected to database");
  })
  .catch((error) => {
    console.error("Error connecting to database:", error);
  });


  app.post("/forgt-password",  expressAsyncHandler( (req, res) => {
    const { email } = req.body;  
    const otp = generateOTP();
    console.log(otp)
    const encryptedOtp = CryptoJS.AES.encrypt(otp, encryptionKey).toString();
    var mailOptions = {
      from: process.env.SMTP_MAIL,
      to: email,
      subject: "OTP form Callback Coding",
      text: `Your OTP is: ${otp}`,
    };
    try {
       transporter.sendMail(mailOptions);
      res.json({
        key:encryptedOtp,
        msg:"Email sent successfully!"
      });
  } catch (error) {
      console.error("Error sending email:", error);
      res.status(500).json("Failed to send email. Please try again later.");
  }
  }))

app.post("/login", (req, res) => {
  const { email, password } = req.body;
  UserModel.findOne({ email: email }).then((user) => {
    if (user) {
      if (user.password === password) {
        res.json("Log in successfully");
      } else {
        res.json("The password is incorrect");
      }
    } else {
      res.json("No record existed");
    }
  });
});

app.post("/", (req, res) => {
  console.log(req.body,"req.body")

});

Image.getAll = async function() {
  try {
    // Retrieve all files from the database
    const files = await this.find(); // Assuming you want to retrieve all documents in the Image collection
    return files;
  } catch (error) {
    throw new Error('Error retrieving files:', error);
  }
};
app.post("/register", (req, res) => {
  console.log(req.body,"req.body")
  const Email = req.body.email
    UserModel.findOne({ email: Email }).then((user) => {
      if (user) {
        res.json(
          {statuscode:1,
           msg: "This Mail Already Found"
          }
         );
      }
      else{
      UserModel.create(req.body)
      .then((students) => {res.json(
        {statuscode:0,
          msg: "Created successfully",
          data:students
         }
        
        
        );} )
      .catch((err) => res.json(err,"register error"));
      }
    })
      
  });
app.get("/files", async (req, res) => {
  try {
    // Retrieve all files using the Image model
    const files = await Image.getAll();
    console.log(files);
    
    // Send the files as a response
    res.json(files);
  } catch (error) {
    console.error("Error retrieving files:", error);
  }
});

app.post("/updatepassword", (req, res) => {
  console.log(req.body,"req.body")
  const { code, email, password, encryptedOtp } = req.body;
  const decryptedEncryptedOtp = CryptoJS.AES.decrypt(encryptedOtp, encryptionKey).toString(CryptoJS.enc.Utf8);
  const request ={
    email: email,
    password: password
  }
  if (code == decryptedEncryptedOtp) {
    UserModel.findOneAndUpdate({ email: email }, request, { new: true })
      .then((updatedUser) => {
        if (!updatedUser) {
          return res.status(404).json({
            statuscode: 4,
            msg: "User not found",
          });
        }
        res.json({
          statuscode: 0,
          msg: "User updated successfully",
          data: updatedUser,
        });
      })
      .catch((err) => {
        res.status(500).json({
          statuscode: 5,
          msg: "Error updating user",
          error: err.message,
        });
      });

  } else {
    res.json({
      key: encryptedOtp,
      msg: "OTP is wrong"
    });
  }
});





app.get("/", (req, res) => {
  res.send({ message: "Hello" });
});



app.listen(5000, () => {
  console.log("server is running");
});


app.post("/uploadImage", (req, res) => {
console.log(req,"req.body")
  uploadImage(req.body.image)
    .then((url) => {
      if (url) {
        const requestbody = {
          name: req.body.Name,
          url: url,
          size: req.body.size
        };
        console.log(requestbody, "requestbody");
        try {
          Image.create(requestbody);
          console.log("done")
        } catch (error) {
          console.log(error,"error")
        }
       
      }
      
      res.send(url)
    })
    .catch((err) => res.status(500).send(err));
});

const upload = multer({ dest: 'uploads/' });
app.post("/bulkMail", upload.single('file'), async (req, res) => {
  try {


    const file = req.file;

    // Read the content of the uploaded Excel file
    const filePath = file.path;
    const workbook = xlsx.readFile(filePath);

    // Assuming there's only one sheet, you can access it by index (0)
    const sheetName = workbook.SheetNames[0];
    const sheet = workbook.Sheets[sheetName];

    // Convert the sheet to JSON format, skipping headers
    const jsonData = xlsx.utils.sheet_to_json(sheet, { header: 1 });

    // Filter out empty rows and flatten the array
    const flattenedData = jsonData.filter(row => row.length > 0).flat();
    const text=req.body.mailText
    // Log or use the flattened data as needed
    // const res = emailjs(text,flattenedData)
    
    // console.log('Content of the uploaded Excel file:', flattenedData);
    try {
      emailjs(text, flattenedData)
      .then(response => {
        res.status(200).send(response);
        console.log('Content of the uploaded Excel file:', response);
      })
      .catch(error => {
        res.status(200).send(error);
        console.error('Error:', error);
      });
    } catch (error) {
      console.log("error")
    }
    

    // Send a response indicating successful file upload
   
  } catch (error) {
    console.error('Error handling file upload:', error);
    res.status(500).send('Internal server error');
  }
})