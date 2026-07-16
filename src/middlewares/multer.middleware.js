import multer from "multer"

// yeh storage 

const storage = multer.diskStorage({  // yeh storage hai ki files store krni hai on local disk not on cloudinary
    destination: function (req, file, cb) {  // yeh destination btata hai kaha store krni hai file
      cb(null, "./public/temp")   
    },
    filename: function (req, file, cb) {  // yeh name ta rha ki file ka name kya rkhna hai
      
      cb(null, file.originalname)  // this tells jo user ne name rkha tha whi rkhdo 
    }
  })
  
export const upload = multer({ 
    storage, 
})