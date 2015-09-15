^^var idFieldName = "_id"$$
^^
function getTypePairs(){
  var str = "";
	var arr = Object.keys(fields);
	for(var i in arr){
		var f = fields[arr[i]];
		if(i != 0)
			str += ", ";
    str += f.name + " " + "TEXT";//global.dbdef.getType(f, "sqlite");
  	if(i == 0)
			str += " PRIMARY KEY";
	}
  return str;
}
function getCols(){
  var str = "";
	var arr = Object.keys(fields);
	for(var i in arr){
		var f = fields[arr[i]];
      if(i != 0)
				str += ", ";
      str += f.name;
	}
  return str;
}
function getQuerys(){
  var str = "";
	for(var i in Object.keys(fields)){
      if(i != 0)
				str += ", ";
      str += "?";
	}
  return str;
}
function getItemList(){
  var str = "";
	var arr = Object.keys(fields);
	for(var i in arr){
		var f = fields[arr[i]];
      if(i != 0)
				str += ", ";
      str += "item." +f.name;
	}
  return str;
}

$$
//
//

#import "^^=name$$Utils.h"

@implementation ^^=name$$Utils
{
    //database
    FMDatabase * _database;
}

- (id)init
{
    if (self = [super init]) {
        //创建数据库，打开数据库，创建表单
        NSString * databasePath = [NSHomeDirectory() stringByAppendingPathComponent:@"Documents/^^=name$$.db"];
        NSLog(@"%@" , NSHomeDirectory());
        _database = [FMDatabase databaseWithPath:databasePath];
        BOOL ret = [_database open];
        if (ret == NO) {
            NSLog(@"数据库创建失败");
            exit(-1);
        }
        
        //创建表单
        NSString * sql = @"CREATE TABLE IF NOT EXISTS ^^=name$$(^^=getTypePairs()$$);";
        BOOL retN = [_database executeUpdate:sql];
        if (retN == NO) {
            NSLog(@"创建表单错误!");
        }
    }
    return self;
}

//添加对象
- (void)addItem:(^^=name$$Model *)item
{
    NSString * sql = @"INSERT INTO ^^=name$$(^^=getCols()$$) VALUES(^^=getQuerys()$$);";
    
    //将不是字符串的数据，转成字符串，因为通配符需要用字符串来填充
    
    @synchronized(self){
        //调用SQL，保存数据到表单
      	BOOL ret = [_database executeUpdate:sql, ^^=getItemList()$$];
        if (ret == NO) {
            NSLog(@"插入错误");
        }
    }
}

//删除一个记录
- (void)deleteById:(NSString *)ID
{
    NSString * sql = @"DELETE FROM ^^=name$$ WHERE ^^=idFieldName$$ = ?;";
    @synchronized(self){
        BOOL ret = [_database executeUpdate:sql, ID];
        if (ret == NO) {
            NSLog(@"删除失败");
        }
    }
}


//查找所有对象
- (NSArray *)list
{
    //将数据库中，查找到的记录，创建成对应对象，然后装到数组中返回
	NSString * sql = @"SELECT * FROM ^^=name$$;";
    FMResultSet * set;
    @synchronized(self){
        //找出所有记录

			set = [_database executeQuery:sql];
    }
    
    //根据记录，创建对象
    NSMutableArray * array = [NSMutableArray array];
    while ([set next]) {
        ^^=name$$Model *item = [[^^=name$$Model alloc] init];
	^^for(var key in fields){var f = fields[key];$$
        item.^^=f.name$$ = [set stringForColumn:@"^^=f.name$$"];
	^^}$$
        [array addObject: item];
    }
    
    return array;
}

//查找指定对象
- (^^=name$$Model *)getById:(NSString *)ID
{
    NSString * sql = @"SELECT * FROM ^^=name$$ WHERE ^^=idFieldName$$ = ?;";
    FMResultSet * set;
    @synchronized(self){
        set = [_database executeQuery:sql, ID];
    }
    
    //如果找不到，返回空
    if (set.next == NO) {
        return nil;
    }

    ^^=name$$Model *item = [[^^=name$$Model alloc] init];

^^for(var key in fields){var f = fields[key];$$
    item.^^=f.name$$ = [set stringForColumn:@"^^=f.name$$"];
^^}$$
    
    return item;
}
- (void)upsertById:(NSString *)^^=idFieldName$$ ^^=name$$Model:(^^=name$$Model *)updateItem
{
	^^=name$$Model * item = [self getById:^^=idFieldName$$];

	if (item.^^=idFieldName$$ == NULL) {
		[self addItem:updateItem];
	}else{
		NSMutableString * string  = [[NSMutableString alloc] init];
		NSMutableString * muString = [[NSMutableString alloc] initWithString:@"UPDATE ^^=name$$ SET "];
^^for(var key in fields){var f = fields[key];$$
		if (updateItem.^^=f.name$$ != NULL) {
				[string appendFormat:@", %@ = '%@'" , @"^^=f.name$$" , updateItem.^^=f.name$$];
		}
^^}$$
        
		[muString appendString:[string substringFromIndex:2]];
		
		NSString * updateSql = [NSString stringWithFormat:@"%@ WHERE ^^=idFieldName$$ = '%@' ;", muString, ^^=idFieldName$$];
		@synchronized(self){
			BOOL res = [_database executeUpdate:updateSql];
			if (!res) {
				NSLog(@"error when creating db table");
			} else {
				NSLog(@"success to creating db table");
			}
		}
	}
}

//单例
+ (^^=name$$Utils *)sharedDatabase
{
    static ^^=name$$Utils * database;
    //线程保护
    @synchronized(self){
        if (database == nil) {
            database = [[^^=name$$Utils alloc] init];
        }
    }
    
    return database;
}

@end
