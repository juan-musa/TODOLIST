const express = require("express");
const bodyParser = require("body-parser");
const mongoose = require("mongoose");



const app=express();

// let items=[];
// let workItems=[];

app.set('view engine', 'ejs');

app.use(bodyParser.urlencoded({extended:true}));
app.use(express.static("public"));

mongoose.connect("mongodb://127.0.0.1:27017/todolistDB", {useNewUrlParser: true});

const itemsSchema = new mongoose.Schema( {
    name : String  
});


const Item = mongoose.model("Item", itemsSchema);

const item1=new Item ({
    name: "Welcome to your todo list"
}
);

const item2=new Item ({
    name: "hit the + button to add"
}
);

const item3=new Item ({
    name: "<-- hit this to delete"
}
);

const  defultItems=[item1,item2,item3];


const listSchema ={
    name: String,
    items: [itemsSchema]
};

const List = mongoose.model("List",listSchema);
   


app.get("/",function(req, res){

    Item.find({}).then (function(foundItems){
        if (foundItems.length === 0){
            Item.insertMany(defultItems).then(function () {
                console.log("Successfully saved defult items to DB");
            })
            .catch(function (err) {
                console.log(err);
            });
                res.redirect("/");
        } else {
            res.render("list",{listTitle:"Today",newListitems: foundItems});
        }
        
    })
    .catch(function(err){
        console.log(err);
    });   
}
);

app.get("/:customListName",function(req,res){

    const customListName = req.params.customListName;
    List.findOne({name: customListName})
    .then(list => {
if (list) {
    res.render("list",{listTitle:list.name , newListitems:list.items})
} else {
        const list = new List ({
            name: customListName,
            items: defultItems
        });
        list.save();
        res.redirect("/"+ customListName);
}
    }).catch(err=>{
        console.log(err);
    });
    
    
});


app.post("/",function(req,res){

        let itemName = req.body.newItem;
        let listName = req.body.list;

        const item = new Item ({
            name: itemName
        });

        if(listName === "Today" ){
            item.save()
            res.redirect("/");

        }else{
          List.findOne({name:listName})
          .then(foundList=>{
            if(foundList){
                foundList.items.push(item);
                foundList.save();
                res.redirect("/"+listName)
            }
          }).catch(err=>{
            console.log(err);
          })  
        };

        
});

app.post("/delete", function(req,res){
        const itemId = req.body.checkbox;
        const listName= req.body.listName;


   if(listName === "Today" ){

    Item.findOneAndRemove({ _id: itemId}).then(result=>{
        console.log("Successfuly deleted checked item.");
        res.redirect("/");
    }).catch(err=>{
        console.log(err);
    });
  
    }else{
       List.findOneAndUpdate(
            {name: listName},
            {$pull:{items:{ _id: itemId}}}
            ).then(foundList=>{
                 res.redirect("/"+ listName);
            }).catch(err=>{
                console.log(err);
            })   
        };
});


app.get("/about",function(req,res){
    res.render("about");
});


app.listen(3000,function(){
    console.log("Server started on port 3000");    
});