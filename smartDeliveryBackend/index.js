const express    = require('express');
const mongoose   = require('mongoose');
const bodyParser = require('body-parser');
const request    = require('request');

const app = express();

//Schemas
mongoose.connect('mongodb://localhost:27017/jiit-deliver', { useNewUrlParser : true });

const freeBox = new mongoose.Schema({
    box_addr : String
});

const freeRider = new mongoose.Schema({
    rider_id : Number
});

const ongoingOrder = new mongoose.Schema({
    rider_id : Number,
    order_id : Number,
    box_addr : String,
    otp      : Number,
    customer : Number,
    rider_location : String
});

const completedOrder = new mongoose.Schema({
    rider_id : Number,
    order_id : Number,
    box_addr : String,
    customer : Number,
})

const tamper = new mongoose.Schema({
    rider_id : Number,
    order_id : Number,
});

const Tamper         = mongoose.model('Tamper', tamper);  
const FreeBox        = mongoose.model('FreeBox', freeBox);
const FreeRider      = mongoose.model('FreeRider', freeRider);
const OngoingOrder   = mongoose.model('OngoingOrder', ongoingOrder);
const CompletedOrder = mongoose.model('CompletedOrder', completedOrder);
var g_order_id = 1;

app.use(require('cors')())

app.get("/", (req,res)=>{
    res.send("hello world");
});

app.get("/connectBOX" , (req,res)=> {
    let box_details = {
        box_addr : req.query.ip_addr
    };
    FreeBox.create(box_details, (err, details)=>{
        if(err) {
            console.log("Error Creating Entry!")
            res.status(400);
            res.send("Error");
        }
        else {
            console.log("Successfully Created Entry id: ",details.box_addr);
            res.status(200);
            res.send("Done");
        }
    })
});

app.get("/tamper", async (req,res)=>{
    if(req.query.value == "open") {
        let rider_id = null;
        let box_id = null;
        await OngoingOrder.find({order_id : req.query.order_id}, (err, details)=>{
            rider_id = details[0]["rider_id"];
            box_id = details[0]["box_addr"];
            details[0].remove();
        });
        let tamper_details = {
            order_id : req.query.order_id,
            rider_id : rider_id,
        }
        await Tamper.create(tamper_details, (err, details)=>{
            console.log("Tamper Reported",details);
        })
        await FreeBox.create({box_addr : box_id}, (err, details)=> {console.log(details)});
        await FreeRider.create({rider_id : rider_id} ,(err, details)=> {console.log(details)});
        res.send("Okay")
    }
    else {
        res.send("Error");
    }
})

app.get("/connectRider", (req,res)=> {
    let rider_details = {
        rider_id : req.query.rider_id
    };
    FreeRider.create(rider_details, (err, details)=>{
        if(err) {
            console.log("Error Creating Entry!")
            res.status(400);
            res.send("Error");
        }
        else {
            console.log("Successfully Created Entry id: ",details.rider_id);
            res.status(200);
            res.send("Done");
        }
    });
});

app.get("/newOrder", async (req,res)=> {
    var box_id = null;
    await FreeBox.find({}, (err, details)=> {
        box_id = details[0]["box_addr"];
        details[0].remove();
    });
    var rider_id = null;
    await FreeRider.find({},(err, details)=> {
        rider_id = details[0]["rider_id"];
        details[0].remove();
    });
    let order_details = {
        customer : req.query.mobile_number,
        otp      : Math.floor(Math.random()*8999)+1000,
        box_addr : box_id,
        rider_id : rider_id,
        order_id : g_order_id,
    };
    g_order_id += 1;
    OngoingOrder.create(order_details, (err,details)=>  {
        console.log("Successfully Created Entry id: ",details["otp"]);
        res.json({ otp: details["otp"].toString(), order_id : details["order_id"].toString()});
    })
    request(`http://${box_id}/startJob?order_id=${g_order_id-1}`, (err, res, body)=>{
        console.log(body);
    })
});

app.get("/isTamper", async (req,res)=>{
    await OngoingOrder.update({order_id : req.query.order_id}, {rider_location : req.query.location}, (err, details)=> {console.log(err)});
    await Tamper.find({order_id : req.query.order_id}, (err, details)=>{
        if(details.length > 0) {
            res.send("Food Tampered");
        }
    })
})

app.get("/isFinish", async (req,res)=>{
    await CompletedOrder.find({order_id : req.query.order_id}, (err, details)=>{
        if(details.length > 0) {
            res.send("FINISH");
        }
    })
})

app.get("/getJob", (req,res)=> {
    let rider_details = {
        rider_id : req.query.rider_id
    };
    OngoingOrder.find(rider_details, (err, details)=> {
        if(details.length > 0)res.send(details[0]["order_id"].toString());
    })
});

app.get("/finishJob", async (req,res)=> {
    let job_details = {
        order_id : req.query.order_id
    };
    var verify_otp = false;
    var rider_id = null;
    var box_id = null;
    var cutomer = null;
    await OngoingOrder.find(job_details, (err, details)=> {
        if(details[0]["otp"] == req.query.otp) {
            verify_otp = true;
            rider_id = details[0]["rider_id"];
            box_id = details[0]["box_addr"];
            customer = details[0]["customer"];
            details[0].remove();
        }
    })
    request(`http://${box_id}/finishJob`, (err, res, body)=>{
        console.log(body);
    })
    if(verify_otp) {
        await FreeBox.create({box_addr : box_id}, (err, details)=> {console.log(details)});
        await FreeRider.create({rider_id : rider_id} ,(err, details)=> {console.log(details)});
        await CompletedOrder.create({box_addr : box_id, rider_id : rider_id, customer : customer, order_id : job_details.order_id}, (err, details)=>{console.log(details)});
        res.send("FINISH");
    }
})

app.get("/FREE_BOXES", async (req, res)=> {
    await FreeBox.find({}, (err, details)=> {
        res.json(details);
    })
})

app.get("/FREE_RIDERS", async (req, res)=> {
    await FreeRider.find({}, (err, details)=> {
        res.json(details);
    })
})

app.get("/ONGOING_ORDERS", async (req, res)=> {
    await OngoingOrder.find({}, (err, details)=> {
        res.json(details);
    })
})

app.get("/COMPLETED_ORDERS", async (req, res)=> {
    await CompletedOrder.find({}, (err, details)=> {
        res.json(details);
    })
})

app.get("/TAMPERED_ORDERS", async (req, res)=> {
    await Tamper.find({}, (err, details)=> {
        res.json(details);
    })
})

var server = require('http').createServer(app);
server.listen(5000, "192.168.29.214", ()=> {
    console.log("started");
});