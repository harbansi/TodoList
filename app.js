//jshint esversion:6

const express = require("express");
const bodyParser = require("body-parser");
const mongoose= require("mongoose");
const _= require("lodash");


const app = express();

app.set('view engine', 'ejs');

app.use(bodyParser.urlencoded({extended: true}));

app.use(express.static("public"));

const workItems = [];


mongoose.connect("mongodb+srv://harbansi:test123@cluster0-ypdnf.mongodb.net/todolistDB", { useNewUrlParser: true ,useUnifiedTopology: true});

const itemSchema=new mongoose.Schema({
  name:{
    type:String,
    required:true
  }
});

const Item= mongoose.model("item",itemSchema);
const item1= new Item({
  name:"Welcome to you ToDoList!!"
});

const item2= new Item({
  name:"hit +button to add new Items"
});

const item3= new Item({
  name:"<-- Hit this to delete Item"
});

const defaultItems=[item1,item2,item3];

const listSchema= new mongoose.Schema({
  name:String,
  items:[itemSchema]

});

const List=mongoose.model("list",listSchema);



app.get("/", function(req, res) {


  Item.find({},function(err,foundItems){

    if(foundItems.length === 0){
      Item.insertMany(defaultItems,function(err){
        if(err)
        {
          console.log("error");
        }
        else {
          console.log("successfully completed");
        }
      });
      res.redirect("/");
    }
    else {
      res.render("list", {listTitle:"Today", newListItems: foundItems });
    }
  });


});

app.post("/", function(req, res){

  const itemName = req.body.newItem;
  const listName= req.body.list;

  const item=new Item({
    name:itemName
  });

  if(listName==="Today"){
    item.save();
    res.redirect("/");
  }
  else {
    List.findOne({name:listName},function(err,foundList){
      foundList.items.push(item);
      foundList.save();
      res.redirect("/"+ listName);
    });
  }
});


app.get("/:customListname",function(req,res){
  const customListname = _.capitalize(req.params.customListname);


  List.findOne({name:customListname},function(err,foundList){
    if(!err)
    {
       if(!foundList){
         //create a new list
         const list = new List({
           name:customListname,
           items: defaultItems
       });
       list.save();
       res.redirect("/" +customListname);
       }
       else{
         //show existing list
         res.render("list",{listTitle:foundList.name, newListItems: foundList.items});

       }
     }

  });

});

app.post("/delete",function(req,res){
  const deleteId = req.body.checkBox;
  const deleteListName= req.body.hiddenItem;


if(deleteListName==="Today")
{
  Item.deleteOne({_id: deleteId},function(err){
    if(!err){
      console.log("successfully deleted");
    }
  });
  res.redirect("/");

}
else {
  List.findOneAndUpdate({name:deleteListName},{$pull:{items: {_id:deleteId}}},function(err,foundList){
    if(!err){
      res.redirect("/"+deleteListName);
    }
  });

}
});

app.use( function(req, res, next) {

  if (req.originalUrl && req.originalUrl.split("/").pop() === 'favicon.ico') {
    return res.sendStatus(204);
  }

  return next();

});


app.get("/about", function(req, res){
  res.render("about");
});

app.listen(3000, function() {
  console.log("Server started on port 3000");
});
