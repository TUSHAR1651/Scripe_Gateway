if(process.env.NODE_ENV !== 'production'){
    require('dotenv').config();
}

const StripeSecretKey = process.env.STRIPE_SECRET_KEY;
const StripePublicKey = process.env.STRIPE_PUBLIC_KEY;

// console.log(StripeSecretKey , StripePublicKey);

const express = require('express');
const fs = require('fs');
const app = express();
const stripe = require('stripe')(StripeSecretKey)

app.set('view engine' , 'ejs');
app.use(express.json())
app.use(express.static('public'));


app.get('/store' , function(req , res) {
    fs.readFile('items.json' , function(error  , data){
        if(error){
            res.status(500).end();
        }
        else{
            res.render('store.ejs' , {
                StripePublicKey : StripePublicKey,
                items : JSON.parse(data)
            });
        }
    })
}) ;

app.post('/purchase' , function(req , res){
    // console.log('purchase');
    fs.readFile('items.json' , function(error, data){
        if(error){
            console.log(error);
            res.status(500).end();
        }else{
            // console.log('purchase');
            const itemsJson = JSON.parse(data);
            const itemsArray = itemsJson.music.concat(itemsJson.merch);
            // console.log(itemsArray);
            let total = 0;
            console.log(req.body);
            req.body.items.forEach(function(item){
                // console.log(item);
                const itemJson = itemsArray.find(function(i){
                    return i.id == item.id;
                })
                if(itemJson)
                total += itemJson.price * item.quantity;
                else console.log("no item");
            });
            stripe.charges.create({
                amount : total,
                source : req.body.stripeTokenId,
                currency : 'usd'
            }).then(function (){
                console.log('charge successful')
                res.json({message : 'Successfully Purchased the Items'})
            }).catch(function (){
                console.log('charge fail')
                res.status(500).end();
            })
        }
    });
});

app.listen(3000);