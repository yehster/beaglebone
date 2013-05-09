var b = require('bonescript');
var http = require('http');
var fs = require('fs');
var cadencePin = 'P8_19';
var speedPin = 'P8_13';

var userFilesPath="/var/cadence/data/";
var clear="\033[2J\033[;H";
var red="\x1B[31m";
var blue="\x1B[34m";
var yellow="\x1B[33m";
var white="\x1B[37m";


var bold="\x1B[1m";
var normal="\x1B[2m";

var counters=new Array();

var user="Kevin";
if(process.argv.length>=3)
    {
        user=process.argv[2];
    }
var cadence_counter=new counter(cadencePin,5,user);
var speed_counter=new counter(speedPin,20,user);

var json_info;

//setTimeout(detach, 15000);


function interrupt_callback(data,pin) 
{
	if(typeof counters[pin]==='undefined')
	{
		return;
	}
	counter=counters[pin];
	counter.update(new Date().getTime());
	
}

function fixed_string(str,width)
{
	var retval="";
	for(var idx=str.length;idx<width;idx++)
	{
		retval+=" ";
	}
	return retval+str.toString();
}
function display_info()
{
    this.speed=(speed_counter.rate()*60*2/1600).toFixed(1);
    this.cadence=cadence_counter.rate();
    this.distance=(speed_counter.counts*2/1600).toFixed(3);
    this.active=cadence_counter.active_formatted();
    return this;
}
function display()
{
    
        json_info=new display_info();
	var displayString=clear+fixed_string(json_info.cadence,3)
		+" " + fixed_string(json_info.speed,4)
		+"\n" + fixed_string(json_info.distance,6)
                +"\n" +normal+ json_info.active;
        
	console.log(displayString);
}
setInterval(display,100);
function dateString(date2)
{
    var date = new Date();
    var retval="";
    retval+=date.getFullYear().toString();
    retval+="_";
    if(date.getMonth()+1<10)
    {
        retval+="0";
    }
    retval+=(date.getMonth()+1).toString();
    retval+="_";
    if(date.getDate()<10)
    {
        retval+="0";
    }
    retval+=date.getDate().toString();
    
    return retval;
}
function counter(pin,max_samples,user)
{
    
        this.user=user;
        this.date = new Date();
        this.dateString=dateString(this.date);
        this.fileName=userFilesPath+user+"_"+this.dateString+"_"+pin;
        this.save=function()
        {
            var data={
                counts:this.counts,
                elapsed_time:this.active_time()
            };
            var dataString;
            dataString=JSON.stringify(data);
            fs.writeFileSync(this.fileName,dataString);
        };
	this.counts=0;
	this.elapsed_time=0;
        try
        {
            var data=fs.readFileSync(this.fileName,"utf-8");
            console.log(data);
            var info=JSON.parse(data);
            this.counts=info.counts;
            this.elapsed_time=info.elapsed_time;
        }
        catch(err)
        {
            console.log("No file:"+this.fileName);
        }
        
	this.pin=pin;
	this.last_update=null;
	this.bounce_time=100;
	this.pause_length=5000;
	this.samples=new Array();
	this.sample_index=0;
	this.max_samples=max_samples;
	this.rate=function()
	{
		var period=this.avgInterval(10);
		if(period===0)
		{
			return 0;
		}
		return (60000/period).toFixed(0);
	}
	this.active_formatted=function()
	{
		var duration=this.active_time();
		var duration = duration - duration % 1000;
		duration = duration/1000;
		var seconds = duration % 60;
		var minutes = ((duration - seconds) /60) % 60;
		var hours = (((duration - seconds) /60) - minutes) / 60
		var secondsStr = (seconds < 10) ?  "0" +seconds.toString() : seconds.toString();
		var minutesStr = (minutes<10) ? "0" + minutes.toString() : minutes.toString();
		return hours.toString()+":"+minutesStr.toString()+":"+ secondsStr;
	}
	this.active_time=function()
	{
		var time=new Date().getTime();
		var delta=time-this.last_update;
		var increment=0;
		if(delta>this.pause_length)
		{
			increment=this.last_update-this.startup;
		}
		else
		{
			increment=(time)-this.startup;
		}
		return (increment)+this.elapsed_time;
	}
	this.addSample=function(time)
	{
		this.samples[this.sample_index]=time;
		this.sample_index++;
		this.sample_index=this.sample_index % this.max_samples;
	}
	b.pinMode(this.pin,b.INPUT);
	b.attachInterrupt(this.pin,true,'rising'
	,function(data)
		{interrupt_callback(data,pin);}
	);
	this.avgInterval=function(number)
	{
		if(this.samples.length===0)
		{
			return 0;
		}
		var total=0;
		for(idx=0;idx<this.samples.length;idx++)
		{
			total+=this.samples[idx];
		}
		return total/this.samples.length;
	}
	this.update=function(time)
	{
		if(this.last_update===null)
		{
			console.log("First Event:"+this.pin);
			this.last_update=time;
			this.startup=time;
			return;
		}
		var delta = time - this.last_update;
		if(delta>this.bounce_time)
		{
			this.counts++;
			if(delta>this.pause_length)
			{
				
				this.elapsed_time+=
					(this.last_update-this.startup);
				this.startup=time;
				this.samples.length=0;
				this.sample_index=0;
			}
			else
			{
				this.addSample(delta);
			}
			this.last_update=time;
                        
		}
	}
	counters[pin]=this;
	return this;
}

function interruptCallback(x) {
 if(last_update===null)
 {
    	last_update=new Date().getTime();
	last_signal=last_update;
        console.log("First event");
 }
 else
 {
	new_time=new Date().getTime();
	var delta=new_time-last_update;
	if(delta>bounce_time)
	{
		counts++;
		last_update=new_time;
        	cadence=60000/delta;
		console.log("Counts:"+counts+"|"+(60000/delta));
        	fs.writeFile("/usr/share/bone101/cadence.html", ""+cadence.toFixed(0)+","+counts, 
        function(err) {
            if(err) {
                console.log(err);
            } else {
            }
        
    });
}
}
}

process.on('exit', function () {
  console.log('About to exit.');
  cadence_counter.save();
  speed_counter.save();
});
process.on('SIGINT', function() {
    console.log("\nGracefully shutting down from SIGINT (Ctrl+C)");
    process.exit();
});

process.on('uncaughtException', function(err) {
  console.log('Caught exception: ' + err);
  process.exit();
});

function display_json(response)
{
  response.writeHead(200, {"Content-Type": "application/json"});
  response.write(JSON.stringify(json_info));
  response.end();
    
}

function display_file(response,filename,ct)
{
fs.readFile('/var/lib/cloud9/Cadence/'+filename, function (err, data) {
  if (err) throw err;
  response.writeHead(200, {"Content-Type": ct});
  response.write(data);
  response.end();
});    
    
}
http.createServer(function(request, response) {
    if(request.url.indexOf("/json")===0)
    {
        display_json(response)
    }
    else
    {
        if(request.url.indexOf(".html")>0)
        {
            display_file(response,request.url,"text/html");        
        }
        else 
        if(request.url.indexOf(".css")>0)
        {
            display_file(response,request.url,"text/css");        
        }
        if(request.url.indexOf(".js")>0)
        {
            display_file(response,request.url,"text/javascript");        
        }
        
    }
}).listen(8888);