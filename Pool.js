// function Pool(){
// 	return var Pool = mysql.createPool({
// 				'host':'localhost',
// 				'user':'root',
// 				'password':'root',
// 				'database':'bk'
// 			});
// };


(function(exports,require,module,__filename,__dirname){
  function Pool(){
		return var Pool = mysql.createPool({
					'host':'localhost',
					'user':'root',
					'password':'root',
					'database':'bk'
				});
	};
})
module.exports = Pool;