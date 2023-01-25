const functions = require("firebase-functions");
const express = require("express");
const bodyParser = require("body-parser");
const mongoose=require("mongoose");
const https= require("https");
const app = express();
////////////////////////////////////////////////
app.set('view engine', 'ejs');
app.use(bodyParser.urlencoded({extended: true}));
app.use(express.static("public"));
mongoose.set('strictQuery', false);
////connecting mongodb atlas to js////////////////////////
mongoose.connect("mongodb+srv://admin-ashwin:admin@cluster0.qtcbu.mongodb.net/zenith",{useNewUrlParser:true});
const arr=[];
let temp,humi,ph,fRice=0,fMaize=0,fChick=0,fKidney=0,fRPigeon=0,fMoth=0,fMung=0,fBlack=0,fLentil=0,fPom=0,fBanana=0,fMango=0,fGrapes=0,fWater=0,fMusk=0,fApple=0,fOrange=0,fPappaya=0,fCoconut=0,fCotton=0,fJute=0,fCoffee=0;;
const predicted=[];
//////schema for crop/////
const cropSchema={
  N:Number,
  P:Number,
  K:Number,
  temperature:Number,
  humidity:Number,
  ph:Number,
  rainfall:Number,
  label:String
}
//////end of crop schema/////

///retailer schema///////
const retailerSchema={
  company:String,
  demand:String,
  quantity:Number,
  price:Number,
  time:String
}
///end of retailer schema///////

//creating mongoose model for cropSchema and retailerSchema
const Crop=mongoose.model("Crop",cropSchema);
const Retailer=mongoose.model("Retailer",retailerSchema);
////////////////////////////end///////////////////

app.get("/",function(req,res){
  res.sendFile(__dirname+"/index.html");
});

app.get("/about.html",function(req,res){
  res.sendFile(__dirname+"/about.html");
});

app.get("/retailer.html",function(req,res){
  res.sendFile(__dirname+"/retailer.html");
});

app.get("/farmer.html",function(req,res){
  res.sendFile(__dirname+"/farmer.html");
});

app.get("/404.html",function(req,res){
  res.sendFile(__dirname+"/404.html");
});

app.get("/index.html",function(req,res){
  res.sendFile(__dirname+"/index.html");
});

///////for reading the contracts from the database///////////
app.post("/contract",function(req,res){
  Retailer.find({},function(er,foundItems){
    if(er){
      console.log("Error");
    }else{
        console.log(foundItems);
        res.render("contract", {newListItems: foundItems});
    }
});
});

app.post("/retailer",function(req,res)
{
  const company=req.body.company;           /////reading contract detail from the user////
  const demand=req.body.demand;
  const quantity=req.body.quantity;
  const price=req.body.price;
  const time=req.body.time;
  const retailer=new Retailer({
      company:company,
      demand:demand,
      quantity:quantity,
      price:price,
      time:time
  })
  ////////inserting into db/////////////
  console.log(retailer);
  retailer.save();
   res.redirect("/retailer.html");
});

app.post("/farmer",function(req,res){
  ///////fetching location,pH,moisture from input//////
  const location=req.body.location;
  ph=parseFloat(req.body.ph);
  const moisture=req.body.moisture;
  //console.log(location,ph,moisture);
  const url="https://api.openweathermap.org/data/2.5/weather?q="+location+"&appid=70b50a42c25f643c52e9da708af34cbe&units=metric";
  https.get(url,function(response)
  {
      if(response.statusCode==404){
        res.redirect("404.html");
        return;
        console.log("city not found");
      }
      else{
        response.on("data",function(data){
        const weather=JSON.parse(data);
        temp=weather.main.temp;
        humi=weather.main.humidity;
        console.log("temperature=",temp,"humidity=",humi);
        // console.log(typeof temp);
        // console.log(typeof humi);
        // console.log(typeof ph);
        Crop.find({'$and': [
          {'$and': [{'temperature': {'$gt': temp-1 } }, {'temperature': {'$lt': temp+1 } } ] },
          {'$and': [{'humidity': {'$gt': humi-2} }, {'humidity': {'$lt': humi+2 } } ] },
          {'$and': [{'ph': {'$gt': ph-0.5 } },{'ph': {'$lt': ph+0.5} } ] }
        ] },function(er,foundItems){
          if(er){
            console.log("Error in database");
          }
          else{
            foundItems.forEach(function(item){
              var crop=item.label;
              predicted.push(crop);
              //console.log(predicted);
            });
            let unique = [...new Set(predicted)];
            console.log(unique);
            res.render("prediction", {newListItems: unique});
          }
        });
      });
      }
  });
});

exports.app=functions.https.onRequest(app);
