const express = require('express');
const mysql  = require('mysql');
const Multer = require('multer');
const path = require('path');
const fs = require('fs');
const ejs = require('ejs');
const cookieParser = require('cookie-parser');
// const Pool = require('Pool');

const server = express();
//中间键
server.use(cookieParser());


server.listen(1234);
//登录页路由
let indexRouter  = express.Router();
 //文章展示页路由
 let showRouter  = express.Router();
 //个人详情
 let myIndexRouter = express.Router();


server.use(Multer({dest:'./bk/allimg'}).any());
server.use('/res',indexRouter);
server.use('/show',showRouter);
server.use('/my',myIndexRouter);


//搜索
showRouter.use('/serch',(req,res)=>{
	// console.log(req.query.name);
	var Pool = mysql.createPool({
				'host':'localhost',
				'user':'root',
				'password':'root',
				'database':'bk'
			});
			Pool.getConnection((err,con)=>{
				if(err){
					console.log(err);
					res.send({ok:0,msg:'数据库连接失败1'});
					con.end();
				}else{
//select geming,geshou from song where geming like '%$keywords%' union select geming,geshou from song where geshou like '%$keywords%'
					con.query('SELECT * FROM `newstab` WHERE `newsName` LIKE "%'+req.query.name+'%" OR `userName` LIKE "%'+req.query.name+'%";',(err,data)=>{
						if(err){
							console.log(err);
							res.send({ok:0,msg:'数据库查询失败'});
						}else{
							// console.log(data)
							res.send({ok:0,msg:data});
						}
					})
				}
			})
})

//评论
showRouter.use('/commentNode',(req,res)=>{
	// console.log(req.query);
	var Pool = mysql.createPool({
				'host':'localhost',
				'user':'root',
				'password':'root',
				'database':'bk'
			});
			Pool.getConnection((err,con)=>{
				if(err){
					res.send({ok:0,msg:'数据库连接失败1'});
					con.end();
				}else{
					var {ID,user,newsName,inner,userImg,userName}=req.query;
					var nowTime = new Date().toLocaleDateString()+' '+new Date().toLocaleTimeString();
					con.query('INSERT INTO `commenttab` (`sid`,`user`,`newsName`,`commentinner`,`timer`,`userImg`,`userName`) VALUES("'+ID+'","'+user+'","'+newsName+'","'+inner+'","'+nowTime+'","'+userImg+'","'+userName+'");',(err,data)=>{
						if(err){
							console.log(err);
							res.send({ok:0,msg:'数据库连接失败'});
							con.end();
						}else{
							con.query('SELECT * FROM `usertab` WHERE user="'+user+'";',(err,data)=>{
								if(err){
									console.log(err);
								}else{
									// res.cookie('user',req.query.user+'-'+data[0].userImg+'-'+data[0].userName,{path:'/show'});


									res.send({ok:1,msg:{
										user:user,
										timer:nowTime,
										userImg:userImg,
										userName:userName,
										inner:inner
									}})

								}
								con.end();
							})
							
						}
						// con.end();
					})
				}
			})
})

//my?userName = shen

myIndexRouter.use('',(req,res)=>{
	// console.log(req.query);
	if(req.query == undefined || !req.query.userName){
		s.readFile('./bk/404.html','utf8',(err,data)=>{
			res.send(data);
		});
	}else{
		var Pool = mysql.createPool({
				'host':'localhost',
				'user':'root',
				'password':'root',
				'database':'bk'
			});
			Pool.getConnection((err,con)=>{
				if(err){
					res.send({ok:0,msg:'数据库连接失败1'});
					con.end();
				}else{
					con.query('SELECT * FROM `usertab` WHERE userName="'+req.query.userName+'";',(err,data)=>{
						if(err){
							res.send({ok:0,msg:'数据库连接失败2'});
							con.end();
						}else{
							var myData= data;
							if(data.length==0){
								s.readFile('./bk/404.html','utf8',(err,data)=>{
								res.send(data);
								});
								con.end();
							}else{
								con.query('SELECT * FROM `newstab` WHERE userName="'+req.query.userName+'";',(err,data)=>{
									if(err){
										res.send({ok:0,msg:'数据库连接失败3'});
										con.end();
									}else{
										myData.push(data);
										// console.log(myData)
										ejs.renderFile('./bk/my.ejs',{data:myData},(err,data)=>{
											if(err){
												console.log(err);
												res.send({ok:0,msg:'读取文件失败'});
											}else{

												res.send(data)
											}
											con.end();
										})
									}
								})
							}
						}
					})
				}
			});
	}
})


//show显示
showRouter.use('/',(req,res)=>{
	// console.log(req.query);
	if(req.query == undefined || !req.query.userName || !req.query.newsName || !req.query.ID){
		fs.readFile('./bk/404.html','utf8',(err,data)=>{
			res.send(data);
		})
	}else{
		console.log(req.cookies);
		// res.clearCookie('user');

		var myUser = req.cookies;
		res.cookie('user','----',{path:'/show'});

		// console.log(req.cookies);

;		var Pool = mysql.createPool({
				'host':'localhost',
				'user':'root',
				'password':'root',
				'database':'bk'
			});
			Pool.getConnection((err,con)=>{
				if(err){
					res.send({ok:0,msg:'数据库连接失败1'});
					con.end();
				}else{
					con.query('SELECT * FROM `newstab` WHERE userName="'+req.query.userName+'" AND newsName="'+req.query.newsName+'" AND ID="'+req.query.ID+'";',(err,data)=>{
						if(err){
							res.send({ok:0,msg:'数据库连接失败2'});
							console.log(err)
						}else{
							var myData = data;
							if(data.length==0){
								fs.readFile('./bk/404.html','utf8',(err,data)=>{
									res.send(data);
								})
							con.end();
							}else{

						con.query('SELECT userName,userImg,commentinner,timer FROM `commenttab` WHERE sid="'+req.query.ID+'";',(err,pi)=>{
							if(err){
								console.log(err);
								con.end();
							}else{
								ejs.renderFile('./bk/show.ejs',{data:data[0],cookieNode:req.cookies.user,comm:pi},(err,data)=>{
									if(err){
										console.log(err)
									}else{
										
										// console.log(myData);
										var {download}=myData[0];
										download = Number(download)+1;
										con.query('UPDATE `newstab` SET download="'+download+'" WHERE userName="'+req.query.userName+'" AND newsName="'+req.query.newsName+'" AND ID="'+req.query.ID+'";',(err)=>{
											if(err){
												console.log(err)
											}else{
											res.send(data);
											}
											con.end();
										})
									}
								})
							}
						})

								
							}
							
						}
					})
				}
			})
	}
});


//ejs
server.use('/index.html',(req,res)=>{
if(req.query.page == undefined || req.query.page == 0){
	var page = 0;
}else{
	var page = req.query.page;
}
res.cookie('user',req.cookies.user)
console.log(req.cookies.user)
var Pool = mysql.createPool({
				'host':'localhost',
				'user':'root',
				'password':'root',
				'database':'bk'
			});
			Pool.getConnection((err,con)=>{
				if(err){
					res.send({ok:0,msg:'数据库连接失败1'});
					con.end();
				}else{
					con.query('SELECT * FROM `newstab`;',(err,data)=>{
						if(err){
							console.log(err)
							res.send({ok:0,msg:'数据库连接失败1'});
						}else{
							 var data = data.reverse().slice(page*10,page*10+10)
							if(data.length == 0){
								fs.readFile('./bk/404.html','utf8',(err,data)=>{
									res.send(data);
								})
							}else{
								ejs.renderFile('./bk/index.ejs',{data:data,page:page,cookieNode:req.cookies.user},(err,data)=>{
								if(err){
									console.log(err)
								}else{

									res.send(data);
								};
								
								})
							}
						
						}
						con.end();
					})
				}


		});

})

//发布文章
indexRouter.use('/postedNews',(req,res)=>{
// console.log(req.query)
var Pool = mysql.createPool({
				'host':'localhost',
				'user':'root',
				'password':'root',
				'database':'bk'
			});
			Pool.getConnection((err,con)=>{
				if(err){
					res.send({ok:0,msg:'数据库连接失败1'});
					con.end();
				}else{
					var {user,userName,newsName,inner}=req.query;
					var timer = new Date().toLocaleDateString()+' '+new Date().toLocaleTimeString();
					con.query('INSERT INTO `newstab` (`user`,`userName`,`timer`,`newsName`,`inner`,`download`) VALUES("'+user+'","'+userName+'","'+timer+'","'+newsName+'","'+inner+'","0");',(err)=>{
						if(err){
							res.send({ok:0,msg:'数据库连接失败'});
							con.end();
						}else{
							con.query('SELECT ID,userName,newsName,timer FROM `newstab` WHERE user="'+user+'" AND newsName="'+newsName+'" AND timer="'+timer+'";',(err,data)=>{
								if(err){
									console.log(err);
									res.send({ok:0,msg:'数据库连接失败77'});
									con.end();
								}else{
									res.send({ok:1,msg:data});
								}
								con.end();
							})
							// res.send({ok:1,msg:'发布成功'});
						};
						
					})
				}
			});
})

//登录
indexRouter.use('/login',(req,res)=>{


	var Pool = mysql.createPool({
				'host':'localhost',
				'user':'root',
				'password':'root',
				'database':'bk'
			});
			Pool.getConnection((err,con)=>{
				if(err){
					res.send({ok:0,msg:'数据库连接失败1'});
					con.end();
				}else{
					con.query('SELECT user,pass,userImg,userName FROM `usertab` WHERE user="'+req.query.user+'" AND pass="'+req.query.pass+'";',(err,data)=>{
						if(err){
							res.send({ok:0,msg:'数据库连接失败2'});
							con.end();
						}else{


							if(data.length>0){
								res.cookie('user',req.query.user+'-'+data[0].userImg+'-'+data[0].userName,{path:'/show'})
								
								//登录成功种cookie
								res.cookie('user',req.query.user+'-'+data[0].userImg+'-'+data[0].userName,{path:'/index.html'});
								res.send({ok:1,msg:'登录成功',data:data});
								

							}else{
								res.send({ok:0,msg:'账号或者密码错误'});
								
							};
							con.end();
						}
					})
				}
			})
})
//注册
indexRouter.use('/resModule',(req,res)=>{
	// console.log(req.files[0],req.body);
	var newName = req.files[0].path + path.parse(req.files[0].originalname).ext;
	fs.rename(req.files[0].path,newName,(err)=>{
		if(err){
			console.log(err)
		}else{
			var Pool = mysql.createPool({
				'host':'localhost',
				'user':'root',
				'password':'root',
				'database':'bk'
			});
			Pool.getConnection((err,con)=>{
				if(err){
					res.send({ok:0,msg:'数据库连接失败'});
					con.end();
				}else{
					var nowTime = new Date().toLocaleDateString()+' '+new Date().toLocaleTimeString();
					var {user,pass,userName,email,sex,QQ,age,trueName} = req.body;
					con.query('SELECT user FROM `usertab` WHERE user="'+user+'";',(err,data)=>{
						if(err){
							console.log(err);
							res.send({ok:0,msg:'数据库连接失败'});
							con.end();
						}else{
							if(data.length>0){
								res.send({ok:0,msg:'用户名也存在'});
								con.end();
							}else{
								con.query('INSERT INTO `usertab` (`user`,`pass`,`email`,`userImg`,`sex`,`timer`,`userName`,`trueName`,`QQ`,`age`) VALUES("'+user+'","'+pass+'","'+email+'","'+newName+'","'+sex+'","'+nowTime+'","'+userName+'","'+trueName+'","'+QQ+'","'+age+'");',(err,data)=>{
								if(err){
									res.send({ok:0,msg:'数据写入失败'});
									console.log(err)
								}else{
									
									res.send({ok:1,msg:'数据注册成功'});
								}
								con.end();
							})
							}
						}
					})
				}
			})
		}
	})
	
});

server.use('/',express.static('./bk'));