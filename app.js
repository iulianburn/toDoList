//jshint esversion:6

const express = require("express");
const bodyParser = require("body-parser");
const mongoose=require("mongoose");
const app = express();
const _ = require("lodash");
const port=process.env.Port||3000;

main().catch(err => console.log(err));
app.set('view engine', 'ejs');

app.use(bodyParser.urlencoded({extended: true}));
app.use(express.static("public"));


async function main() {
await mongoose.connect("mongodb+srv://admin-iul:test123@cluster0.ggwfti5.mongodb.net/toDoListDBB");
// await mongoose.connect('mongodb://127.0.0.1:27017/todolistDB');
const itemSchema=new mongoose.Schema({
  name: String
});
const Item=new mongoose.model("Item", itemSchema);

const item1=new Item({
  name: "Welcome to your todolist"
});
const item2=new Item({
  name:"Hit the + buton to add a new item"
});
const item3=new Item({
  name:"<-- Hit this to delete item"
});
const defaultItems=[item1,item2,item3];
const listSchema={
  name:String,
  items:[itemSchema]
};
const List=mongoose.model("List", listSchema);

app.get("/", function(req, res) {
   Item.find({}, function(err, foundItems){
     if(foundItems.length===0){
       Item.insertMany(defaultItems, function(err){
        if(err){ console.log(err);}
        else{console.log("items are inserted");}
        });
        res.redirect("/");
     }else{
       res.render("list", {listTitle: "Today", newListItems: foundItems});
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
}else{
  List.findOne({name:listName}, function(err,foundList)
{
  foundList.items.push(item);
  foundList.save();
  res.redirect("/"+ listName);
})
}


});

//
// app.post("/delete", function(req,res){
//   const checkedItemId=req.body.checkbox;
// const dListName=req.body.listName1;
// console.log(dListName);
//
// //aici e problema!!!**************
// if(dListName==="Today"){
//   Item.findByIdAndRemove(checkedItemId, function(err){
//     if(!err){
//       console.log("checked item removed");
//     res.redirect("/");
//   }else{
//     console.log(err);
//   }
// });
// }
// // else{
// //   List.findOneAndUpdate({name:dListName}, {$pull:{items:{_id: checkedItemId}}}, function(err,foundList){
// //     if(!err)
// //     {
// //       res.redirect("/"+dListName);
// //     }else{console.log();}
// //
// // });
// // }
// });


app.get("/:customListName", function(req,res){
const customListName=req.params.customListName;
List.findOne({name:customListName}, function(err,foundList){
  if(!err){
    if(!foundList)
    {
//create a new list
const list=new List({
name: customListName,
items: defaultItems
});
list.save();
res.redirect("/"+ customListName);
    }else{
//show the list
res.render("list", {listTitle:foundList.name, newListItems: foundList.items})}
  }
});
});


app.post("/delete", function(req, res){
  const checkedItemId = req.body.checkbox;
  const dlistName = req.body.listName1;

  if (dlistName === "Today") {
    Item.findByIdAndRemove(checkedItemId, function(err) {
      if (!err) {
        console.log("Successfully deleted checked item.");
        res.redirect("/");
      }
    });
  } else {
    List.findOneAndUpdate({name: dlistName}, {$pull: {items: {_id: checkedItemId}}}, function(err, foundList) {
      if (!err){
        res.redirect("/" + dlistName);
      }
    });
};
});
};




app.get("/about", function(req, res){
  res.render("about");
});

app.listen(port, function() {
  console.log("Server started on port 3000");
});
